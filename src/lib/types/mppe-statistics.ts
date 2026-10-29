/**
 * EduLink — Tipos y Estructuras para la Estadística de Matrícula MPPE
 * Formato oficial: "Estadística de Matrícula por Edad y Sexo"
 */

export interface AgeGenderCount {
  age: number | string
  varones: number // V
  hembras: number // H
  total: number   // T = V + H
}

export interface CourseStatisticRow {
  courseId: string
  courseName: string
  gradeLevel: number
  section: string
  shift?: string | null
  // Distribución por cada edad estándar (11..19) más especiales si aplican
  byAge: Record<string, AgeGenderCount>
  totalVarones: number
  totalHembras: number
  totalStudents: number
  incompleteDataCount: number // Alumnos sin fecha de nacimiento o sin sexo
}

export interface InstitutionalSummary {
  byAge: Record<string, AgeGenderCount>
  totalVarones: number
  totalHembras: number
  totalStudents: number
  percentVarones: number
  percentHembras: number
  percentTotal: number
  incompleteDataTotal: number
}

export interface MppeStatisticsReport {
  school: {
    id: string
    name: string
    rif: string
    state?: string | null
    municipality?: string | null
    address?: string | null
  }
  schoolYear: {
    id: string
    name: string
  }
  cutOffDate: string // YYYY-MM-DD
  monthNumber: number // 1..12
  monthName: string // e.g. "Septiembre"
  standardAges: number[] // [11, 12, 13, 14, 15, 16, 17, 18, 19]
  hasUnder11: boolean
  hasOver19: boolean
  rows: CourseStatisticRow[]
  summary: InstitutionalSummary
  generatedAt: string
}
