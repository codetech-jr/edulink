import { SupabaseClient } from '@supabase/supabase-js'
import type { StudentMorosidadRecord, PaymentRecord } from '../_components/AccountStatementModal'
import type { CourseOption } from '../_components/MorosidadFilters'

export interface MorosidadDashboardData {
  processedStudents: StudentMorosidadRecord[]
  bcvRate: number
  conceptName: string
  totalCobradoMes: number
  totalPendienteMes: number
  totalAdeudadoMes: number
  morosidadRate: number
  totalEstudiantes: number
  totalMorosos: number
  courseOptions: CourseOption[]
}

export async function getMorosidadData(
  supabase: SupabaseClient,
  schoolId: string
): Promise<MorosidadDashboardData> {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0')
  const firstDayOfMonth = `${currentYear}-${currentMonthNum}-01`

  // Consultas concurrentes sin cascada (Promise.all)
  const [
    studentsResult,
    paymentsResult,
    billingConceptsResult,
    exchangeRateResult,
    coursesResult,
    parentProfilesResult,
  ] = await Promise.all([
    // Estudiantes activos con cursos
    supabase
      .from('students')
      .select(`
        id,
        full_name,
        cedula,
        list_number,
        course_id,
        parent_id,
        is_active,
        courses (
          id,
          name,
          grade_level,
          section
        )
      `)
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('full_name', { ascending: true }),

    // Pagos del colegio
    supabase
      .from('payments')
      .select(`
        id,
        student_id,
        amount_usd,
        amount_ves,
        status,
        payment_method,
        reference_number,
        transaction_date,
        created_at,
        phone_number,
        billing_concepts (
          name
        )
      `)
      .eq('school_id', schoolId)
      .order('transaction_date', { ascending: false }),

    // Aranceles / mensualidades activas
    supabase
      .from('billing_concepts')
      .select('id, name, amount_usd, is_active')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('amount_usd', { ascending: false }),

    // Tasa BCV oficial más reciente
    supabase
      .from('exchange_rates')
      .select('rate, rate_date')
      .eq('school_id', schoolId)
      .order('rate_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Cursos para opciones de filtro
    supabase
      .from('courses')
      .select('id, name, grade_level, section')
      .eq('school_id', schoolId)
      .order('grade_level', { ascending: true }),

    // Perfiles de representantes
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('school_id', schoolId),
  ])

  const rawStudents = studentsResult.data ?? []
  const payments = paymentsResult.data ?? []
  const billingConcepts = billingConceptsResult.data ?? []
  const bcvRate = exchangeRateResult.data?.rate ? Number(exchangeRateResult.data.rate) : 36.5
  const coursesList = coursesResult.data ?? []
  const parentProfiles = parentProfilesResult.data ?? []

  // Mapa de representantes
  const parentMap = new Map<string, { full_name: string }>()
  parentProfiles.forEach((p) => {
    parentMap.set(p.id, { full_name: p.full_name || 'Representante' })
  })

  // Concepto de facturación mensual activo
  const activeConcept = billingConcepts[0]
  const conceptName = activeConcept?.name || 'Mensualidad Escolar'
  const monthlyFeeUsd = activeConcept?.amount_usd ? Number(activeConcept.amount_usd) : 40

  // Clasificación y cálculo por estudiante en memoria
  const processedStudents: StudentMorosidadRecord[] = rawStudents.map((s: {
    id: string
    full_name: string
    cedula?: string | null
    list_number?: number | null
    course_id?: string | null
    parent_id?: string | null
    courses?: {
      id?: string
      name?: string
      grade_level?: string | number
      section?: string
    } | Array<{
      id?: string
      name?: string
      grade_level?: string | number
      section?: string
    }> | null
  }) => {
    const courseData = Array.isArray(s.courses) ? s.courses[0] : s.courses
    const parent = s.parent_id ? parentMap.get(s.parent_id) : null

    // Todos los pagos del estudiante
    const studentPayments = payments.filter((p) => p.student_id === s.id)

    // Pagos del mes en curso
    const monthPayments = studentPayments.filter((p) => {
      const pDate = p.transaction_date || p.created_at
      return pDate && pDate >= firstDayOfMonth
    })

    const hasConfirmedThisMonth = monthPayments.some((p) => p.status === 'confirmado')
    const hasPendingThisMonth = monthPayments.some((p) => p.status === 'pendiente')

    let status: 'al_dia' | 'pendiente' | 'moroso' = 'moroso'
    let debtUsd = monthlyFeeUsd

    if (hasConfirmedThisMonth) {
      status = 'al_dia'
      debtUsd = 0
    } else if (hasPendingThisMonth) {
      status = 'pendiente'
      debtUsd = monthlyFeeUsd
    } else {
      status = 'moroso'
      debtUsd = monthlyFeeUsd
    }

    const paidUsd = studentPayments
      .filter((p) => p.status === 'confirmado')
      .reduce((sum, p) => sum + Number(p.amount_usd || 0), 0)

    const pendingUsd = studentPayments
      .filter((p) => p.status === 'pendiente')
      .reduce((sum, p) => sum + Number(p.amount_usd || 0), 0)

    const debtVes = Math.round(debtUsd * bcvRate * 100) / 100

    const lastPaymentWithPhone = studentPayments.find((p) => p.phone_number)
    const phone = lastPaymentWithPhone?.phone_number || undefined

    const formattedPayments: PaymentRecord[] = studentPayments.map((p: {
      id: string
      amount_usd: number
      amount_ves?: number | null
      status: 'confirmado' | 'pendiente' | 'rechazado'
      payment_method: string
      reference_number?: string | null
      transaction_date?: string | null
      created_at?: string | null
      billing_concepts?: { name?: string } | Array<{ name?: string }> | null
    }) => {
      const bConcept = Array.isArray(p.billing_concepts) ? p.billing_concepts[0] : p.billing_concepts
      return {
        id: p.id,
        amount_usd: Number(p.amount_usd || 0),
        amount_ves: p.amount_ves ? Number(p.amount_ves) : null,
        status: p.status,
        payment_method: p.payment_method,
        reference_number: p.reference_number,
        transaction_date: p.transaction_date || p.created_at?.split('T')[0] || '-',
        concept_name: bConcept?.name || 'Mensualidad',
      }
    })

    return {
      id: s.id,
      list_number: s.list_number,
      full_name: s.full_name,
      cedula: s.cedula || '',
      course_id: s.course_id,
      course_name: courseData?.name || 'Sin curso',
      grade_level: courseData?.grade_level || 1,
      section: courseData?.section || 'U',
      parent_id: s.parent_id,
      representative_name: parent?.full_name || 'Representante Legal',
      representative_phone: phone,
      status,
      debt_usd: debtUsd,
      debt_ves: debtVes,
      paid_usd: paidUsd,
      pending_usd: pendingUsd,
      payments: formattedPayments,
    }
  })

  // Cálculos de KPIs consolidados del mes
  const confirmedMonthPayments = payments.filter(
    (p) => p.status === 'confirmado' && (p.transaction_date || p.created_at) >= firstDayOfMonth
  )
  const totalCobradoMes = confirmedMonthPayments.reduce(
    (sum, p) => sum + Number(p.amount_usd || 0),
    0
  )

  const pendingMonthPayments = payments.filter(
    (p) => p.status === 'pendiente' && (p.transaction_date || p.created_at) >= firstDayOfMonth
  )
  const totalPendienteMes = pendingMonthPayments.reduce(
    (sum, p) => sum + Number(p.amount_usd || 0),
    0
  )

  const morososList = processedStudents.filter((s) => s.status === 'moroso')
  const totalAdeudadoMes = morososList.reduce((sum, s) => sum + s.debt_usd, 0)
  const morosidadRate =
    processedStudents.length > 0
      ? Math.round((morososList.length / processedStudents.length) * 100)
      : 0

  const courseOptions: CourseOption[] = coursesList.map((c: {
    id: string
    grade_level: string | number
    section: string
    name: string
  }) => ({
    id: c.id,
    label: `${c.grade_level}° "${c.section}" - ${c.name}`,
  }))

  return {
    processedStudents,
    bcvRate,
    conceptName,
    totalCobradoMes,
    totalPendienteMes,
    totalAdeudadoMes,
    morosidadRate,
    totalEstudiantes: processedStudents.length,
    totalMorosos: morososList.length,
    courseOptions,
  }
}
