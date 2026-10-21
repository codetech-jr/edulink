export interface EnrollmentDocument {
  name: string
  path: string
  size: number
  type: string
  uploaded_at?: string
}

export interface EnrollmentRequest {
  id: string
  school_id: string
  student_name: string
  student_cedula: string | null
  student_birth_date: string | null
  grade_requested: string
  parent_name: string
  parent_cedula: string
  parent_phone: string
  parent_email: string | null
  notes: string | null
  status: 'pendiente' | 'aprobado' | 'rechazado' | string
  rejection_reason: string | null
  documents: EnrollmentDocument[] | null
  created_at: string
}

export interface CourseOption {
  id: string
  name: string
  grade_level: number
  section: string
}
