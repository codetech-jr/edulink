import { SupabaseClient } from '@supabase/supabase-js'
import type { RepresentedStudent } from '../_components/FinancesTab'

export interface RepresentativeData {
  profile: {
    role: string
    full_name: string
    school_id?: string
  }
  rawStudents: Array<{
    id: string
    full_name: string
    cedula?: string
    school_id: string
    courses: any // TODO: tipado pendiente
  }>
  billingConcepts: Array<{
    id: string
    name: string
    amount_usd: number
  }>
  bcvRate: number
  school: {
    name: string
    rif?: string
  }
  representedStudents: RepresentedStudent[]
  studentsWithAcademicData: any[] // TODO: tipado pendiente
  communications: any[] // TODO: tipado pendiente
  totalPagadoGlobal: number
  totalDeudaGlobal: number
  pendingPaymentsGlobal: any[] // TODO: tipado pendiente
}

export async function getRepresentativeData(
  supabase: SupabaseClient,
  userId: string
): Promise<RepresentativeData | { isEmpty: true; profile: { full_name: string } }> {
  // 1. Obtener perfil y estudiantes representados en paralelo
  const [profileResult, studentsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('role, full_name, school_id')
      .eq('id', userId)
      .single(),
    supabase
      .from('students')
      .select(`
        id,
        full_name,
        cedula,
        school_id,
        courses (
          id,
          name,
          grade_level,
          section
        )
      `)
      .eq('parent_id', userId)
      .eq('is_active', true),
  ])

  const profile = profileResult.data
  if (!profile || profile.role !== 'representante') {
    throw new Error('No autorizado')
  }

  const rawStudents = studentsResult.data ?? []

  if (rawStudents.length === 0) {
    return {
      isEmpty: true,
      profile: { full_name: profile.full_name },
    }
  }

  const studentIds = rawStudents.map((s) => s.id)
  const schoolId = rawStudents[0].school_id || profile.school_id

  const today = new Date()
  const dayOfWeek = today.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() + diffToMonday)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 4)

  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  // Carga concurrente con Promise.all
  const [
    paymentsResult,
    billingConceptsResult,
    exchangeRatesResult,
    schoolResult,
    attendanceResult,
    gradesResult,
    communicationsResult,
    behaviorResult,
  ] = await Promise.all([
    supabase
      .from('payments')
      .select(`
        id,
        student_id,
        amount_usd,
        amount_ves,
        payment_method,
        status,
        reference_number,
        transaction_date,
        created_at,
        rejection_reason,
        billing_concepts (
          name
        )
      `)
      .in('student_id', studentIds)
      .order('transaction_date', { ascending: false }),

    supabase
      .from('billing_concepts')
      .select('id, name, amount_usd')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('name', { ascending: true }),

    supabase
      .from('exchange_rates')
      .select('rate')
      .eq('school_id', schoolId)
      .order('rate_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('schools')
      .select('name, rif')
      .eq('id', schoolId)
      .single(),

    supabase
      .from('attendance')
      .select(`
        id,
        student_id,
        attendance_date,
        status,
        notes,
        subject_id,
        subjects (
          id,
          name,
          start_time,
          end_time
        )
      `)
      .in('student_id', studentIds)
      .gte('attendance_date', weekStartStr)
      .lte('attendance_date', weekEndStr),

    supabase
      .from('grades')
      .select(`
        id,
        student_id,
        score,
        is_absent,
        notes,
        evaluation_id,
        evaluations (
          id,
          name,
          weight,
          term_id,
          evaluation_date,
          terms (
            id,
            name
          ),
          subjects (
            id,
            name,
            profiles:teacher_id (
              full_name
            )
          )
        )
      `)
      .in('student_id', studentIds),

    supabase
      .from('communications')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('student_behavior_records')
      .select(`
        id,
        student_id,
        school_id,
        created_by,
        type,
        title,
        description,
        incident_date,
        requires_parent_signature,
        parent_acknowledged_at,
        created_at,
        profiles:created_by (
          full_name,
          role
        )
      `)
      .in('student_id', studentIds)
      .order('incident_date', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  const payments = paymentsResult.data ?? []
  const billingConcepts = billingConceptsResult.data ?? []

  // Obtener tasa BCV con fallback a adminClient (en caso de que RLS restrinja la lectura a representantes)
  let bcvRate = exchangeRatesResult.data?.rate ? Number(exchangeRatesResult.data.rate) : null

  if (!bcvRate) {
    try {
      const { createAdminClient } = await import('@/utils/supabase/admin')
      const adminClient = createAdminClient()

      // 1. Intentar por el colegio específico
      const { data: adminRate } = await adminClient
        .from('exchange_rates')
        .select('rate')
        .eq('school_id', schoolId)
        .order('rate_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (adminRate?.rate) {
        bcvRate = Number(adminRate.rate)
      } else {
        // 2. Intentar la tasa más reciente registrada en el sistema
        const { data: globalRate } = await adminClient
          .from('exchange_rates')
          .select('rate')
          .order('rate_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (globalRate?.rate) {
          bcvRate = Number(globalRate.rate)
        }
      }
    } catch (err) {
      console.error('[Representante] Error al obtener tasa con adminClient:', err)
    }
  }

  // Fallback seguro si la base de datos no tiene ninguna tasa registrada
  if (!bcvRate) {
    bcvRate = 36.5
  }

  const school = schoolResult.data || { name: 'Institución Educativa', rif: 'J-00000000-0' }
  const attendance = attendanceResult.data ?? []
  const gradesData = gradesResult.data ?? []
  const communications = (communicationsResult.data ?? []).filter((c: any) => !c.is_archived) // TODO: tipado pendiente

  const totalFacturadoInstitucional = billingConcepts.reduce(
    (acc, curr) => acc + Number(curr.amount_usd || 0),
    0
  )

  const representedStudents: RepresentedStudent[] = rawStudents.map((student) => {
    const studentPayments = payments.filter((p) => p.student_id === student.id)
    const totalPagado = studentPayments
      .filter((p) => p.status === 'confirmado')
      .reduce((sum, p) => sum + Number(p.amount_usd || 0), 0)

    const totalPendiente = studentPayments
      .filter((p) => p.status === 'pendiente')
      .reduce((sum, p) => sum + Number(p.amount_usd || 0), 0)

    const saldoPendiente = Math.max(0, totalFacturadoInstitucional - totalPagado)
    const saldoPendienteVes = Math.round(saldoPendiente * bcvRate * 100) / 100

    let status: 'al_dia' | 'pendiente' | 'moroso' = 'moroso'
    if (saldoPendiente <= 0) {
      status = 'al_dia'
    } else if (totalPendiente > 0) {
      status = 'pendiente'
    } else {
      status = 'moroso'
    }

    return {
      id: student.id,
      full_name: student.full_name,
      cedula: student.cedula || '',
      courses: student.courses,
      totalFacturado: totalFacturadoInstitucional,
      totalPagado,
      totalPendiente,
      saldoPendiente,
      saldoPendienteVes,
      status,
      payments: studentPayments as any, // TODO: tipado pendiente
    }
  })

  const normalizedGrades = (gradesData ?? []).map((g: any) => { // TODO: tipado pendiente
    let evalData = g.evaluations
    if (Array.isArray(evalData)) evalData = evalData[0] || null

    let termData = evalData?.terms
    if (Array.isArray(termData)) termData = termData[0] || null

    let subjectData = evalData?.subjects
    if (Array.isArray(subjectData)) subjectData = subjectData[0] || null

    let teacherProfile = subjectData?.profiles
    if (Array.isArray(teacherProfile)) teacherProfile = teacherProfile[0] || null

    return {
      id: g.id,
      student_id: g.student_id,
      score: g.score !== null ? Number(g.score) : null,
      is_absent: g.is_absent,
      notes: g.notes,
      evaluation_id: g.evaluation_id,
      evaluations: evalData
        ? {
            id: evalData.id,
            name: evalData.name,
            weight: Number(evalData.weight),
            evaluation_date: evalData.evaluation_date,
            term_id: evalData.term_id,
            terms: termData ? { id: termData.id, name: termData.name } : null,
            subjects: subjectData
              ? {
                  id: subjectData.id,
                  name: subjectData.name,
                  teacherName: teacherProfile?.full_name || 'Docente',
                }
              : null,
          }
        : null,
    }
  })

  const behaviorRecords = behaviorResult?.data ?? []

  const studentsWithAcademicData = rawStudents.map((student) => ({
    ...student,
    attendance: attendance.filter((a) => a.student_id === student.id),
    grades: normalizedGrades.filter((g) => g.student_id === student.id),
    behaviorRecords: behaviorRecords.filter((b: any) => b.student_id === student.id),
  }))

  const totalPagadoGlobal = representedStudents.reduce((sum, s) => sum + s.totalPagado, 0)
  const totalDeudaGlobal = representedStudents.reduce((sum, s) => sum + s.saldoPendiente, 0)
  const pendingPaymentsGlobal = payments.filter((p) => p.status === 'pendiente')

  return {
    profile,
    rawStudents,
    billingConcepts,
    bcvRate,
    school,
    representedStudents,
    studentsWithAcademicData,
    communications,
    totalPagadoGlobal,
    totalDeudaGlobal,
    pendingPaymentsGlobal,
  }
}
