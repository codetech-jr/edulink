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
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role, school_id')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      try {
        const { createAdminClient } = await import('@/utils/supabase/admin')
        const adminClient = createAdminClient()
        const adminProf = await adminClient
          .from('profiles')
          .select('id, full_name, role, school_id')
          .eq('id', user.id)
          .maybeSingle()
        if (adminProf.data) {
          profile = adminProf.data
        }
      } catch {
        // Fallback no-op
      }
    }

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Perfil no encontrado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3. Consultar el pago (columnas directas de la tabla payments para evitar fallos de relación de PostgREST)
    const paymentColumns = `
      id,
      school_id,
      student_id,
      payer_id,
      amount_usd,
      amount_ves,
      exchange_rate_used,
      payment_method,
      status,
      reference_number,
      transaction_date,
      receipt_number,
      processed_at,
      billing_concept_id
    `

    let { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(paymentColumns)
      .eq('id', paymentId)
      .maybeSingle()

    if (!payment) {
      try {
        const { createAdminClient } = await import('@/utils/supabase/admin')
        const adminClient = createAdminClient()
        const adminRes = await adminClient
          .from('payments')
          .select(paymentColumns)
          .eq('id', paymentId)
          .maybeSingle()

        if (adminRes.data) {
          payment = adminRes.data
        }
      } catch (err) {
        console.warn('[Recibo API] Fallback adminClient para pago falló:', err)
      }
    }

    if (!payment) {
      console.error('[Recibo API] Pago no encontrado. paymentId:', paymentId, 'Error previo:', paymentError)
      return new Response(
        JSON.stringify({
          error: 'Pago no encontrado',
          details: paymentError?.message || 'No se encontró el registro con el ID suministrado',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 4. Verificación de Estado: Solo se emite recibo si status = 'confirmado'
    if (payment.status !== 'confirmado') {
      return new Response(
        JSON.stringify({
          error: `Este pago se encuentra en estado "${payment.status}". Solo se emite recibo para pagos confirmados.`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Cliente para consultas de entidades relacionadas
    let dbClient = supabase
    try {
      const { createAdminClient } = await import('@/utils/supabase/admin')
      dbClient = createAdminClient()
    } catch {
      // Fallback a supabase de sesión
    }

    // 5. Consultas concurrentes e independientes para estudiante, colegio y concepto de facturación
    const [studentRes, schoolRes, conceptRes] = await Promise.all([
      payment.student_id
        ? dbClient
            .from('students')
            .select(`
              id,
              full_name,
              cedula,
              parent_id,
              school_id,
              courses (
                id,
                name,
                grade_level,
                section
              )
            `)
            .eq('id', payment.student_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      payment.school_id || profile.school_id
        ? dbClient
            .from('schools')
            .select('id, name, rif')
            .eq('id', payment.school_id || profile.school_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      payment.billing_concept_id
        ? dbClient
            .from('billing_concepts')
            .select('id, name, description')
            .eq('id', payment.billing_concept_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ])

    const studentData = studentRes?.data
    const paymentSchoolId = payment.school_id || studentData?.school_id || profile.school_id

    // 6. Verificación de Autorización:
    // Admin/Coordinador del mismo colegio O quien pagó O el representante/estudiante
    let isAuthorized = false

    if (isAdminRole(profile.role)) {
      if (!profile.school_id || !paymentSchoolId || profile.school_id === paymentSchoolId) {
        isAuthorized = true
      }
    } else if (
      (payment.payer_id && payment.payer_id === user.id) ||
      (studentData?.parent_id && studentData.parent_id === user.id) ||
      (studentData?.id && studentData.id === user.id)
    ) {
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

    // 7. Consultar datos del representante
    let representativeName = 'Representante Registrado'
    let representativeCedula: string | undefined = undefined

    const parentId = studentData?.parent_id || payment.payer_id

    if (parentId) {
      if (parentId === user.id && profile.role === 'representante') {
        representativeName = profile.full_name || 'Representante Legal'
      } else {
        const { data: parentProfile } = await dbClient
          .from('profiles')
          .select('full_name')
          .eq('id', parentId)
          .maybeSingle()
        if (parentProfile?.full_name) {
          representativeName = parentProfile.full_name
        }
      }
    }

    // 8. Calcular equivalente en Bolívares (amount_usd × tasa BCV)
    let exchangeRate = payment.exchange_rate_used
      ? Number(payment.exchange_rate_used)
      : null

    if (!exchangeRate) {
      // Buscar la tasa BCV registrada en la fecha del pago
      const { data: rateData } = await dbClient
        .from('exchange_rates')
        .select('rate')
        .eq('school_id', paymentSchoolId)
        .lte('rate_date', payment.transaction_date || new Date().toISOString().split('T')[0])
        .order('rate_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (rateData?.rate) {
        exchangeRate = Number(rateData.rate)
      } else {
        const { data: latestRate } = await dbClient
          .from('exchange_rates')
          .select('rate')
          .order('rate_date', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (latestRate?.rate) {
          exchangeRate = Number(latestRate.rate)
        } else {
          exchangeRate = 36.5
        }
      }
    }

    const amountUsd = Number(payment.amount_usd || 0)
    const amountVes = payment.amount_ves
      ? Number(payment.amount_ves)
      : Math.round(amountUsd * exchangeRate * 100) / 100

    // 9. Normalizar datos de colegio, curso y concepto
    const schoolInfo = {
      name: schoolRes?.data?.name || 'Institución Educativa',
      rif: schoolRes?.data?.rif || 'J-00000000-0',
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

    const conceptInfo = {
      name: conceptRes?.data?.name || 'Mensualidad / Arancel Escolar',
      description: conceptRes?.data?.description || undefined,
    }

    // 10. Número de recibo correlativo (ej. REC-2026-00042)
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

    // 11. Generar Buffer del PDF con @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(
      React.createElement(ReciboTemplate, { data: reciboData }) as any
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
  } catch (error: any) {
    console.error('Error generando recibo PDF:', error)
    return new Response(
      JSON.stringify({
        error: 'Error interno al generar el recibo de pago',
        details: error?.message || String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
