import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminRole } from '@/lib/permissions'
import { EnrollmentManagementClient } from './_components/EnrollmentManagementClient'

export const metadata = {
  title: 'Gestión de Inscripciones | EduLink',
  description: 'Control, revisión y admisión de solicitudes de nuevo ingreso.',
}

export default async function AdminInscripcionesPage() {
  const supabase = await createClient()

  // 1. Validar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Validar perfil y rol administrativo
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdminRole(profile.role) || !profile.school_id) {
    redirect('/login')
  }

  const schoolId = profile.school_id

  // 3. Consultas en paralelo: Solicitudes de inscripción y cursos disponibles
  const [requestsResult, coursesResult] = await Promise.all([
    supabase
      .from('enrollment_requests')
      .select(`
        id,
        school_id,
        student_name,
        student_cedula,
        student_birth_date,
        grade_requested,
        parent_name,
        parent_cedula,
        parent_phone,
        parent_email,
        notes,
        status,
        rejection_reason,
        documents,
        created_at
      `)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false }),

    supabase
      .from('courses')
      .select('id, name, grade_level, section')
      .eq('school_id', schoolId)
      .order('grade_level', { ascending: true }),
  ])

  const requests = requestsResult.data || []
  const courses = coursesResult.data || []

  return (
    <EnrollmentManagementClient
      initialRequests={requests}
      courses={courses}
      userName={profile.full_name || 'Administrador'}
    />
  )
}
