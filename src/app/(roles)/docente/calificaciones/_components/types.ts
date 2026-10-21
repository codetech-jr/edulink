import type { Student, Evaluation } from './GradingTable'

export interface Grade {
  id?: string
  evaluation_id: string
  student_id: string
  score: number | null
  is_absent: boolean
  notes?: string
}

export interface GradingSheetProps {
  students: Student[]
  evaluations: Evaluation[]
  initialGrades: Grade[]
  subjectId: string
  termId: string
  subjectName: string
  termName: string
  teacherName: string
  courseName: string
}

export interface GradePayload {
  student_id: string
  evaluation_id: string
  score: number | null
  is_absent: boolean
  notes: string | null
}
