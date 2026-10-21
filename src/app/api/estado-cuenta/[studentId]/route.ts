import React from 'react'
import { NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/utils/supabase/server'
import { isAdminRole } from '@/lib/permissions'
import {
  EstadoCuentaTemplate,
  type EstadoCuentaData,
  type EstadoCuentaPayment,
} from '@/components/pdf/EstadoCuentaTemplate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{
    studentId: string
  }>
}

const PAYMENT_METHODS: Record<string, string> = {
  pago_movil: 'Pago Móvil (C2P)',
  zelle: 'Zelle',
  transferencia: 'Transferencia Bancaria',
  efectivo: 'Efectivo USD',
}

function formatDateVE(dateStr?: string | null): string {
  if (!dateStr) return '-'
  try {
    const parts = dateStr.split('T')[0].split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
  } catch {
    // fallback
  }
  return dateStr
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { studentId } = await params
    const supabase = await createClient()

    // 1. Validar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, role, school_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Perfil no encontrado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3. Consultar datos del estudiante
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        full_name,
        cedula,
        list_number,
        school_id,
        parent_id,
        is_active,
        courses (
          id,
          name,
          grade_level,
          section
        ),
        schools (
          id,
          name,
          rif
        )
      `)
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return new Response(JSON.stringify({ error: 'Estudiante no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 4. Verificación de Autorización: Admin/Coordinador de la misma escuela O el padre
    let isAuthorized = false
    if (isAdminRole(profile.role) && profile.school_id === student.school_id) {
      isAuthorized = true
    } else if (student.parent_id === user.id || student.id === user.id) {
      isAuthorized = true
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'No autorizado para ver este estado de cuenta' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 5. Carga concurrente de pagos, tasa BCV, arancel mensual y representante
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0')
    const firstDayOfMonth = `${currentYear}-${currentMonthNum}-01`

    const [paymentsResult, latestRateResult, billingConceptsResult, parentProfileResult] =
      await Promise.all([
        supabase
          .from('payments')
          .select(`
            id,
            amount_usd,
            amount_ves,
            status,
            payment_method,
            reference_number,
            transaction_date,
            created_at,
            billing_concepts (
              name
            )
          `)
          .eq('student_id', studentId)
          .order('transaction_date', { ascending: false }),

        supabase
          .from('exchange_rates')
          .select('rate')
          .eq('school_id', student.school_id)
          .order('rate_date', { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from('billing_concepts')
          .select('id, name, amount_usd, is_active')
          .eq('school_id', student.school_id)
          .eq('is_active', true)
          .order('amount_usd', { ascending: false }),

        student.parent_id
          ? supabase
              .from('profiles')
              .select('full_name')
              .eq('id', student.parent_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ])

    const payments = paymentsResult.data ?? []
    let bcvRate = latestRateResult.data?.rate ? Number(latestRateResult.data.rate) : null

    if (!bcvRate) {
      try {
        const { createAdminClient } = await import('@/utils/supabase/admin')
        const adminClient = createAdminClient()
        const { data: adminRate } = await adminClient
          .from('exchange_rates')
          .select('rate')
          .order('rate_date', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (adminRate?.rate) {
          bcvRate = Number(adminRate.rate)
        }
      } catch {
        // No-op
      }
      if (!bcvRate) bcvRate = 36.5
    }

    const parentProfile = parentProfileResult.data

    // Concepto base mensual
    const activeConcept = billingConceptsResult.data?.[0]
    const monthlyFee = activeConcept?.amount_usd ? Number(activeConcept.amount_usd) : 40

    // Clasificación del mes
    const monthPayments = payments.filter((p) => {
      const pDate = p.transaction_date || p.created_at
      return pDate && pDate >= firstDayOfMonth
    })

    const hasConfirmedThisMonth = monthPayments.some((p) => p.status === 'confirmado')
    const hasPendingThisMonth = monthPayments.some((p) => p.status === 'pendiente')

    let currentStatus: 'al_dia' | 'pendiente' | 'moroso' = 'moroso'
    let totalDebtUsd = monthlyFee

    if (hasConfirmedThisMonth) {
      currentStatus = 'al_dia'
      totalDebtUsd = 0
    } else if (hasPendingThisMonth) {
      currentStatus = 'pendiente'
      totalDebtUsd = monthlyFee
    }

    const totalPaidUsd = payments
      .filter((p) => p.status === 'confirmado')
      .reduce((sum, p) => sum + Number(p.amount_usd || 0), 0)

    const totalPendingUsd = payments
      .filter((p) => p.status === 'pendiente')
      .reduce((sum, p) => sum + Number(p.amount_usd || 0), 0)

    const totalDebtVes = Math.round(totalDebtUsd * bcvRate * 100) / 100

    const paymentHistory: EstadoCuentaPayment[] = payments.map((p: any /* TODO: tipado pendiente */) => ({
      date: formatDateVE(p.transaction_date || p.created_at),
      concept: p.billing_concepts?.name || 'Mensualidad Escolar',
      method: PAYMENT_METHODS[p.payment_method] || p.payment_method || 'Pago',
      reference: p.reference_number || 'S/R',
      amountUsd: Number(p.amount_usd || 0),
      status: p.status,
    }))

    const schoolData = Array.isArray(student.schools) ? student.schools[0] : student.schools
    const courseData = Array.isArray(student.courses) ? student.courses[0] : student.courses

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ]
    const currentMonthLabel = `${monthNames[now.getMonth()]} ${currentYear}`

    const estadoCuentaData: EstadoCuentaData = {
      school: {
        name: schoolData?.name || 'Institución Educativa',
        rif: schoolData?.rif || 'J-00000000-0',
      },
      student: {
        fullName: student.full_name,
        cedula: student.cedula || '',
        courseName: courseData?.name || 'Educación Básica',
        gradeLevel: courseData?.grade_level || 1,
        section: courseData?.section || 'U',
        listNumber: student.list_number,
      },
      representative: {
        fullName: parentProfile?.full_name || 'Representante Legal',
      },
      issuedAt: new Intl.DateTimeFormat('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(now),
      currentMonth: currentMonthLabel,
      currentStatus,
      bcvRate,
      summary: {
        totalPaidUsd,
        totalPendingUsd,
        totalDebtUsd,
        totalDebtVes,
      },
      paymentHistory,
    }

    // 6. Generar Buffer del PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(EstadoCuentaTemplate, { data: estadoCuentaData }) as any /* TODO: tipado pendiente */
    )

    const cleanName = student.full_name.toLowerCase().replace(/[^a-z0-9]/gi, '_')
    const filename = `estado_cuenta_${cleanName}.pdf`

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error: any /* TODO: tipado pendiente */) {
    console.error('Error generando estado de cuenta PDF:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno al generar el estado de cuenta' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
