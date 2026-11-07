import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { formatWhatsAppLink } from '@/lib/utils/whatsapp'
import {
  AdminAttendanceReport,
  AttendanceKPIsData,
  AttendanceRawRecord,
  AttendanceStatus,
  AttendanceViewTab,
  CourseOption,
  StudentAttendanceDaily,
  StudentAttendanceMonthly,
  StudentAttendanceWeekly,
  StudentAttendanceWeeklyDay,
} from '@/lib/types/attendance-admin'

export { formatWhatsAppLink }

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const DAY_NAMES_ES = [
  { dayIndex: 1, full: 'Lunes', short: 'Lun' },
  { dayIndex: 2, full: 'Martes', short: 'Mar' },
  { dayIndex: 3, full: 'Miércoles', short: 'Mié' },
  { dayIndex: 4, full: 'Jueves', short: 'Jue' },
  { dayIndex: 5, full: 'Viernes', short: 'Vie' },
]

export interface GetAttendanceReportParams {
  schoolId: string
  tab?: AttendanceViewTab
  date?: string // YYYY-MM-DD
  weekOffset?: number // relative offset in weeks
  month?: number // 1-12
  year?: number
  courseId?: string // 'all' or uuid
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (hora local de Venezuela UTC-4)
 */
export function getCaracasToday(): string {
  const now = new Date()
  // Ajuste a UTC-4 si se ejecuta en servidor UTC
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const caracasTime = new Date(utc - 4 * 3600000)
  return caracasTime.toISOString().split('T')[0]
}

/**
 * Calcula los días hábiles de la semana (Lunes a Viernes) a partir de una fecha de referencia
 */
export function getWeekDates(referenceDateStr: string, weekOffset = 0) {
  const parts = referenceDateStr.split('-').map(Number)
  const refDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0)

  if (weekOffset !== 0) {
    refDate.setDate(refDate.getDate() + weekOffset * 7)
  }

  const dayOfWeek = refDate.getDay() // 0 = Dom, 1 = Lun, etc.
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const monday = new Date(refDate)
  monday.setDate(refDate.getDate() + diffToMonday)

  const days = DAY_NAMES_ES.map((d, index) => {
    const cur = new Date(monday)
    cur.setDate(monday.getDate() + index)
    const dateStr = cur.toISOString().split('T')[0]
    return {
      date: dateStr,
      dayName: d.full,
      shortName: d.short,
    }
  })

  return {
    weekStartStr: days[0].date,
    weekEndStr: days[4].date,
    days,
  }
}

/**
 * Servicio principal de agregación de asistencia administrativa.
 * Soporta vistas Diario, Semanal y Mensual con métricas y semáforos de riesgo LOPNNA/MPPE.
 */
export async function getAdminAttendanceReport(
  params: GetAttendanceReportParams
): Promise<AdminAttendanceReport> {
  const { schoolId } = params
  const tab: AttendanceViewTab = params.tab || 'mensual'
  const todayCaracas = getCaracasToday()
  const targetDate = params.date || todayCaracas

  const now = new Date()
  const month = params.month && params.month >= 1 && params.month <= 12 ? params.month : now.getMonth() + 1
  const year = params.year && params.year >= 2020 ? params.year : now.getFullYear()
  const monthName = MONTH_NAMES[month - 1]

  const weekInfo = getWeekDates(targetDate, params.weekOffset || 0)

  const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDayOfMonth = new Date(year, month, 0).getDate()
  const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`

  // 1. Instanciar cliente DB (con fallback a service_role para RLS multi-tabla)
  let dbClient: any
  try {
    dbClient = createAdminClient()
  } catch {
    dbClient = await createClient()
  }

  // 2. Determinar rango de consulta de asistencia según pestaña activa
  let rangeStart = startOfMonth
  let rangeEnd = endOfMonth

  if (tab === 'diario') {
    rangeStart = targetDate
    rangeEnd = targetDate
  } else if (tab === 'semanal') {
    rangeStart = weekInfo.weekStartStr
    rangeEnd = weekInfo.weekEndStr
  }

  // 3. Ejecutar consultas concurrentes
  const [
    schoolResult,
    coursesResult,
    studentsResult,
    parentProfilesResult,
    attendanceResult,
  ] = await Promise.all([
    // Colegio
    dbClient
      .from('schools')
      .select('name, rif')
      .eq('id', schoolId)
      .maybeSingle(),

    // Cursos
    dbClient
      .from('courses')
      .select('id, name, grade_level, section')
      .eq('school_id', schoolId)
      .order('grade_level', { ascending: true })
      .order('section', { ascending: true }),

    // Estudiantes activos
    dbClient
      .from('students')
      .select(`
        id,
        full_name,
        cedula,
        list_number,
        course_id,
        parent_id,
        relationship,
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

    // Representantes
    dbClient
      .from('profiles')
      .select('id, full_name, phone, cedula')
      .eq('school_id', schoolId),

    // Asistencia en el rango seleccionado
    dbClient
      .from('attendance')
      .select(`
        id,
        student_id,
        subject_id,
        teacher_id,
        attendance_date,
        status,
        notes,
        subjects (
          id,
          name
        )
      `)
      .eq('school_id', schoolId)
      .gte('attendance_date', rangeStart)
      .lte('attendance_date', rangeEnd),
  ])

  const schoolName = schoolResult?.data?.name || 'Institución Educativa'
  const schoolRif = schoolResult?.data?.rif || 'J-00000000-0'
  const courses: CourseOption[] = coursesResult?.data || []
  let rawStudents: any[] = studentsResult?.data || []
  const parentProfiles: any[] = parentProfilesResult?.data || []
  const attendanceRecords: AttendanceRawRecord[] = attendanceResult?.data || []

  // Filtrar estudiantes por curso si se especificó
  const selectedCourseId = params.courseId || 'all'
  if (selectedCourseId !== 'all') {
    rawStudents = rawStudents.filter((s) => s.course_id === selectedCourseId)
  }

  // Mapeo rápido de representantes
  const parentMap = new Map<string, { full_name: string; phone: string | null; cedula: string | null }>()
  parentProfiles.forEach((p) => {
    parentMap.set(p.id, {
      full_name: p.full_name || 'Representante',
      phone: p.phone || null,
      cedula: p.cedula || null,
    })
  })

  // Agrupar registros de asistencia por student_id
  const attendanceByStudent = new Map<string, AttendanceRawRecord[]>()
  attendanceRecords.forEach((record) => {
    const list = attendanceByStudent.get(record.student_id) || []
    list.push(record)
    attendanceByStudent.set(record.student_id, list)
  })

  // 4. Procesar vista DIARIA
  const dailyData: StudentAttendanceDaily[] = rawStudents.map((st) => {
    const studentRecords = (attendanceByStudent.get(st.id) || []).filter(
      (r) => r.attendance_date === targetDate
    )
    const parent = st.parent_id ? parentMap.get(st.parent_id) : null

    if (studentRecords.length === 0) {
      return {
        student_id: st.id,
        full_name: st.full_name,
        cedula: st.cedula,
        list_number: st.list_number,
        course_id: st.course_id,
        course_name: st.courses?.name || `${st.courses?.grade_level ?? ''}° ${st.courses?.section ?? ''}`,
        grade_level: st.courses?.grade_level || 0,
        section: st.courses?.section || '',
        parent_id: st.parent_id,
        parent_name: parent?.full_name || null,
        parent_phone: parent?.phone || null,
        relationship: st.relationship || null,
        status: 'sin_registro',
        notes: null,
        subject_names: [],
        records_count: 0,
      }
    }

    // Si tiene múltiples materias en el día:
    // Jerarquía de visualización: ausente > tarde > justificado > presente
    let overallStatus: AttendanceStatus = 'presente'
    if (studentRecords.some((r) => r.status === 'ausente')) {
      overallStatus = 'ausente'
    } else if (studentRecords.some((r) => r.status === 'tarde')) {
      overallStatus = 'tarde'
    } else if (studentRecords.some((r) => r.status === 'justificado')) {
      overallStatus = 'justificado'
    }

    const subjectNames = studentRecords
      .map((r) => (r.subjects as any)?.name)
      .filter(Boolean) as string[]

    const notes = studentRecords
      .map((r) => r.notes)
      .filter(Boolean)
      .join(' | ')

    return {
      student_id: st.id,
      full_name: st.full_name,
      cedula: st.cedula,
      list_number: st.list_number,
      course_id: st.course_id,
      course_name: st.courses?.name || `${st.courses?.grade_level ?? ''}° ${st.courses?.section ?? ''}`,
      grade_level: st.courses?.grade_level || 0,
      section: st.courses?.section || '',
      parent_id: st.parent_id,
      parent_name: parent?.full_name || null,
      parent_phone: parent?.phone || null,
      relationship: st.relationship || null,
      status: overallStatus,
      notes: notes || null,
      subject_names: Array.from(new Set(subjectNames)),
      records_count: studentRecords.length,
    }
  })

  // 5. Procesar vista SEMANAL
  const weeklyData: StudentAttendanceWeekly[] = rawStudents.map((st) => {
    const studentRecords = attendanceByStudent.get(st.id) || []
    const parent = st.parent_id ? parentMap.get(st.parent_id) : null

    let present_count = 0
    let absent_count = 0
    let justified_count = 0
    let tardy_count = 0

    const days: StudentAttendanceWeeklyDay[] = weekInfo.days.map((day) => {
      const dayRecords = studentRecords.filter((r) => r.attendance_date === day.date)
      if (dayRecords.length === 0) {
        return {
          date: day.date,
          dayName: day.dayName,
          shortName: day.shortName,
          status: 'sin_registro',
          notes: null,
        }
      }

      let dayStatus: AttendanceStatus = 'presente'
      if (dayRecords.some((r) => r.status === 'ausente')) {
        dayStatus = 'ausente'
        absent_count++
      } else if (dayRecords.some((r) => r.status === 'tarde')) {
        dayStatus = 'tarde'
        tardy_count++
      } else if (dayRecords.some((r) => r.status === 'justificado')) {
        dayStatus = 'justificado'
        justified_count++
      } else {
        present_count++
      }

      const notes = dayRecords.map((r) => r.notes).filter(Boolean).join(' | ')

      return {
        date: day.date,
        dayName: day.dayName,
        shortName: day.shortName,
        status: dayStatus,
        notes: notes || null,
      }
    })

    const total_records = present_count + absent_count + justified_count + tardy_count
    const attendance_percentage =
      total_records > 0
        ? Math.round(((present_count + justified_count + tardy_count) / total_records) * 100)
        : 100

    return {
      student_id: st.id,
      full_name: st.full_name,
      cedula: st.cedula,
      list_number: st.list_number,
      course_id: st.course_id,
      course_name: st.courses?.name || `${st.courses?.grade_level ?? ''}° ${st.courses?.section ?? ''}`,
      grade_level: st.courses?.grade_level || 0,
      section: st.courses?.section || '',
      parent_id: st.parent_id,
      parent_name: parent?.full_name || null,
      parent_phone: parent?.phone || null,
      relationship: st.relationship || null,
      days,
      present_count,
      absent_count,
      justified_count,
      tardy_count,
      total_records,
      attendance_percentage,
    }
  })

  // 6. Procesar vista MENSUAL
  const monthlyData: StudentAttendanceMonthly[] = rawStudents.map((st) => {
    const studentRecords = attendanceByStudent.get(st.id) || []
    const parent = st.parent_id ? parentMap.get(st.parent_id) : null

    const present_count = studentRecords.filter((r) => r.status === 'presente').length
    const absent_count = studentRecords.filter((r) => r.status === 'ausente').length
    const justified_count = studentRecords.filter((r) => r.status === 'justificado').length
    const tardy_count = studentRecords.filter((r) => r.status === 'tarde').length

    const total_records = present_count + absent_count + justified_count + tardy_count
    const attendance_percentage =
      total_records > 0
        ? Math.round(((present_count + justified_count + tardy_count) / total_records) * 100)
        : 100

    let risk_level: 'normal' | 'advertencia' | 'critico' = 'normal'
    if (total_records > 0) {
      if (attendance_percentage < 75) {
        risk_level = 'critico'
      } else if (attendance_percentage < 85) {
        risk_level = 'advertencia'
      }
    }

    return {
      student_id: st.id,
      full_name: st.full_name,
      cedula: st.cedula,
      list_number: st.list_number,
      course_id: st.course_id,
      course_name: st.courses?.name || `${st.courses?.grade_level ?? ''}° ${st.courses?.section ?? ''}`,
      grade_level: st.courses?.grade_level || 0,
      section: st.courses?.section || '',
      parent_id: st.parent_id,
      parent_name: parent?.full_name || null,
      parent_phone: parent?.phone || null,
      relationship: st.relationship || null,
      present_count,
      absent_count,
      justified_count,
      tardy_count,
      total_records,
      attendance_percentage,
      risk_level,
    }
  })

  // 7. Calcular KPIs generales
  const totalStudents = rawStudents.length
  let totalEvaluated = 0
  let totalPresents = 0
  let totalAbsences = 0
  let totalJustified = 0
  let totalTardies = 0
  let studentsAtRisk = 0

  if (tab === 'diario') {
    const evaluatedDaily = dailyData.filter((d) => d.status !== 'sin_registro')
    totalEvaluated = evaluatedDaily.length
    totalPresents = evaluatedDaily.filter((d) => d.status === 'presente').length
    totalAbsences = evaluatedDaily.filter((d) => d.status === 'ausente').length
    totalJustified = evaluatedDaily.filter((d) => d.status === 'justificado').length
    totalTardies = evaluatedDaily.filter((d) => d.status === 'tarde').length
    studentsAtRisk = totalAbsences
  } else if (tab === 'semanal') {
    weeklyData.forEach((w) => {
      totalEvaluated += w.total_records
      totalPresents += w.present_count
      totalAbsences += w.absent_count
      totalJustified += w.justified_count
      totalTardies += w.tardy_count
      if (w.attendance_percentage < 75 && w.total_records > 0) {
        studentsAtRisk++
      }
    })
  } else {
    monthlyData.forEach((m) => {
      totalEvaluated += m.total_records
      totalPresents += m.present_count
      totalAbsences += m.absent_count
      totalJustified += m.justified_count
      totalTardies += m.tardy_count
      if (m.risk_level === 'critico') {
        studentsAtRisk++
      }
    })
  }

  const globalRate =
    totalEvaluated > 0
      ? Math.round(((totalPresents + totalJustified + totalTardies) / totalEvaluated) * 100)
      : 100

  const kpis: AttendanceKPIsData = {
    total_students: totalStudents,
    evaluated_records: totalEvaluated,
    global_attendance_rate: globalRate,
    total_absences: totalAbsences,
    total_justified: totalJustified,
    total_tardies: totalTardies,
    students_at_risk: studentsAtRisk,
    absent_today_count: dailyData.filter((d) => d.status === 'ausente').length,
  }

  return {
    schoolName,
    schoolRif,
    tab,
    targetDate,
    weekStartStr: weekInfo.weekStartStr,
    weekEndStr: weekInfo.weekEndStr,
    month,
    year,
    monthName,
    selectedCourseId,
    courses,
    kpis,
    dailyData,
    weeklyData,
    monthlyData,
  }
}
