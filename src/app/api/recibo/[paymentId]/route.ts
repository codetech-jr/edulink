import React from 'react'
import { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReciboTemplate, ReciboData } from '@/components/pdf/ReciboTemplate'
import { isAdminRole } from '@/lib/permissions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{
    paymentId: string
  }>
}

// Mapeo oficial de métodos de pago venezolanos
const PAYMENT_METHODS: Record<string, string> = {
  pago_movil: 'Pago Móvil (C2P)',
  zelle: 'Zelle',
  transferencia: 'Transferencia Bancaria',
  efectivo: 'Efectivo USD',
}

// Función auxiliar para formatear fechas a DD/MM/AAAA
function formatDateVE(dateStr?: string | null): string {
  if (!dateStr) return new Date().toLocaleDateString('es-VE')
  const [year, month, day] = dateStr.split('T')[0].split('-')
  if (year && month && day) {
    return `${day}/${month}/${year}`
  }
  return dateStr
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { paymentId } = await params
    const supabase = await createClient()

    // 1. Validar autenticación de usuario
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

    // 2. Obtener perfil del usuario actual
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role, school_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Perfil no encontrado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3. Consultar el pago y todas sus entidades relacionadas
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        id,
        school_id,
        student_id,
        amount_usd,
        amount_ves,
        exchange_rate_used,
        payment_method,
        status,
        reference_number,
        transaction_date,
        receipt_number,
        processed_at,
        billing_concept_id,
        students (
          id,
          full_name,
          cedula,
          parent_id,
          courses (
            id,
            name,
            grade_level,
            section
          )
        ),
        billing_concepts (
          id,
          name,
          description
        ),
        schools (
          id,
          name,
          rif
        )
      `)
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      return new Response(JSON.stringify({ error: 'Pago no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 4. Verificación de Estado: Solo se emite recibo si status = 'confirmado'
    if (payment.status !== 'confirmado') {
      return new Response(
        JSON.stringify({ error: 'Este pago aún no ha sido verificado' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 5. Verificación de Autorización:
    // Admin/Coordinador del mismo colegio O el representante del estudiante
    const studentData = Array.isArray(payment.students)
      ? payment.students[0]
      : payment.students

    let isAuthorized = false

    if (isAdminRole(profile.role) && profile.school_id === payment.school_id) {
      isAuthorized = true
    } else if (studentData?.parent_id === user.id || studentData?.id === user.id) {
      isAuthorized = true
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'No está autorizado para descargar este recibo' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 6. Consultar datos del representante
    let representativeName = 'Representante Registrado'
    let representativeCedula: string | undefined = undefined

    if (studentData?.parent_id) {
      if (studentData.parent_id === user.id) {
        representativeName = profile.full_name || 'Representante Legal'
      } else {
        const { data: parentProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', studentData.parent_id)
          .single()
        if (parentProfile?.full_name) {
          representativeName = parentProfile.full_name
        }
      }
    }

    // 7. Calcular equivalente en Bolívares (amount_usd × tasa BCV)
    let exchangeRate = payment.exchange_rate_used
      ? Number(payment.exchange_rate_used)
      : null

    if (!exchangeRate) {
      // Buscar la tasa BCV registrada en la fecha del pago
      const { data: rateData } = await supabase
        .from('exchange_rates')
        .select('rate')
        .eq('school_id', payment.school_id)
        .lte('rate_date', payment.transaction_date)
        .order('rate_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (rateData?.rate) {
        exchangeRate = Number(rateData.rate)
      } else {
        // Intentar con adminClient (para el caso de roles como representante donde RLS bloquee la tabla)
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
            exchangeRate = Number(adminRate.rate)
          }
        } catch {
          // No-op fallback
        }

        if (!exchangeRate) {
          exchangeRate = 36.5
        }
      }
    }

    const amountUsd = Number(payment.amount_usd || 0)
    const amountVes = payment.amount_ves
      ? Number(payment.amount_ves)
      : Math.round(amountUsd * exchangeRate * 100) / 100

    // 8. Normalizar datos de colegio, curso y concepto
    const schoolData = Array.isArray(payment.schools)
      ? payment.schools[0]
      : payment.schools

    const schoolInfo = {
      name: schoolData?.name || 'Institución Educativa',
      rif: schoolData?.rif || 'J-00000000-0',
    }

    const courseData = Array.isArray(studentData?.courses)
      ? studentData.courses[0]
      : studentData?.courses

    const studentInfo = {
      fullName: studentData?.full_name || 'Estudiante',
      cedula: studentData?.cedula || '',
      courseName: courseData?.name || 'Educación Básica',
      gradeLevel: courseData?.grade_level || 1,
      section: courseData?.section || 'U',
    }

    const conceptData = Array.isArray(payment.billing_concepts)
      ? payment.billing_concepts[0]
      : payment.billing_concepts

    const conceptInfo = {
      name: conceptData?.name || 'Mensualidad / Arancel Escolar',
      description: conceptData?.description || undefined,
    }

    // 9. Número de recibo correlativo (ej. REC-2026-00042)
    const transactionYear = payment.transaction_date
      ? new Date(payment.transaction_date).getFullYear()
      : new Date().getFullYear()

    const receiptNumber =
      payment.receipt_number ||
      `REC-${transactionYear}-${String(payment.id).slice(0, 5).toUpperCase()}`

    const methodFormatted =
      PAYMENT_METHODS[payment.payment_method] ||
      payment.payment_method?.toUpperCase() ||
      'Pago General'

    const issuedAt = new Intl.DateTimeFormat('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())

    const reciboData: ReciboData = {
      school: schoolInfo,
      receiptNumber,
      issuedAt,
      transactionDate: formatDateVE(payment.transaction_date),
      student: studentInfo,
      representative: {
        fullName: representativeName,
        cedula: representativeCedula,
      },
      concept: conceptInfo,
      paymentMethod: methodFormatted,
      referenceNumber: payment.reference_number || 'S/R',
      amountUsd,
      amountVes,
      exchangeRate,
    }

    // 10. Generar Buffer del PDF con @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(
      React.createElement(ReciboTemplate, { data: reciboData }) as any /* TODO: tipado pendiente */
    )

    const cleanFilename = `recibo_${receiptNumber.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.pdf`

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cleanFilename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error: any /* TODO: tipado pendiente */) {
    console.error('Error generando recibo PDF:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno al generar el recibo de pago' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
