export type AttendanceStatus = 'presente' | 'ausente' | 'tarde' | 'justificado'

export type AttendanceRiskLevel = 'normal' | 'advertencia' | 'critico'

export type AttendanceViewTab = 'diario' | 'semanal' | 'mensual'

export interface AttendanceRawRecord {
  id: string
  student_id: string
  subject_id: string | null
  teacher_id: string | null
  attendance_date: string // YYYY-MM-DD
  status: AttendanceStatus
  notes: string | null
  created_at?: string
  subjects?: {
    id: string
    name: string
  } | null
}

export interface StudentAttendanceDaily {
  student_id: string
  full_name: string
  cedula: string | null
  list_number: number | null
  course_id: string
  course_name: string
  grade_level: number
  section: string
  parent_id: string | null
  parent_name: string | null
  parent_phone: string | null
  relationship: string | null
  status: AttendanceStatus | 'sin_registro'
  notes: string | null
  subject_names: string[]
  records_count: number
}

export interface StudentAttendanceWeeklyDay {
  date: string // YYYY-MM-DD
  dayName: string // 'Lunes', 'Martes', etc.
  shortName: string // 'Lun', 'Mar', etc.
  status: AttendanceStatus | 'sin_registro'
  notes: string | null
}

export interface StudentAttendanceWeekly {
  student_id: string
  full_name: string
  cedula: string | null
  list_number: number | null
  course_id: string
  course_name: string
  grade_level: number
  section: string
  parent_id: string | null
  parent_name: string | null
  parent_phone: string | null
  relationship: string | null
  days: StudentAttendanceWeeklyDay[]
  present_count: number
  absent_count: number
  justified_count: number
  tardy_count: number
  total_records: number
  attendance_percentage: number
}

export interface StudentAttendanceMonthly {
  student_id: string
  full_name: string
  cedula: string | null
  list_number: number | null
  course_id: string
  course_name: string
  grade_level: number
  section: string
  parent_id: string | null
  parent_name: string | null
  parent_phone: string | null
  relationship: string | null
  present_count: number
  absent_count: number
  justified_count: number
  tardy_count: number
  total_records: number
  attendance_percentage: number
  risk_level: AttendanceRiskLevel // 'normal' (>=85%), 'advertencia' (75-84%), 'critico' (<75%)
}

export interface AttendanceKPIsData {
  total_students: number
  evaluated_records: number
  global_attendance_rate: number
  total_absences: number
  total_justified: number
  total_tardies: number
  students_at_risk: number
  absent_today_count?: number
}

export interface CourseOption {
  id: string
  name: string
  grade_level: number
  section: string
}

export interface AdminAttendanceReport {
  schoolName: string
  schoolRif: string
  tab: AttendanceViewTab
  targetDate: string // YYYY-MM-DD
  weekStartStr: string // YYYY-MM-DD
  weekEndStr: string // YYYY-MM-DD
  month: number
  year: number
  monthName: string
  selectedCourseId: string
  courses: CourseOption[]
  kpis: AttendanceKPIsData
  dailyData: StudentAttendanceDaily[]
  weeklyData: StudentAttendanceWeekly[]
  monthlyData: StudentAttendanceMonthly[]
}
