import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BehaviorManagementClient } from './_components/BehaviorManagementClient'

export const metadata = {
  title: 'Conducta y Novedades | EduLink',
  description: 'Gestión y seguimiento disciplinario de estudiantes.',
}

export default async function DocenteConductaPage() {
  const supabase = await createClient()

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'docente') {
    redirect('/login')
  }

  // 2. Fetch teacher's subjects and students
  const { data: subjects } = await supabase
    .from('subjects')
    .select(`
      id,
      name,
      courses (
        id,
        name,
        grade_level,
        section,
        students (
          id,
          full_name,
          cedula,
          is_active
        )
      )
    `)
    .eq('teacher_id', user.id)

  const studentMap = new Map<
    string,
    { id: string; full_name: string; course_name?: string; cedula?: string }
  >()

  ;(subjects || []).forEach((sub: any) => {
    let course = sub.courses
    if (Array.isArray(course)) course = course[0] || null
    if (!course) return

    const courseLabel = `${course.name} (${course.grade_level || ''} - ${course.section || ''})`
    const studentsList = Array.isArray(course.students) ? course.students : []

    studentsList.forEach((s: any) => {
      if (s.is_active && !studentMap.has(s.id)) {
        studentMap.set(s.id, {
          id: s.id,
          full_name: s.full_name,
          course_name: courseLabel,
          cedula: s.cedula,
        })
      }
    })
  })

  const students = Array.from(studentMap.values())

  // 3. Fetch recent behavior records
  const { data: recordsData, error: recordsError } = await supabase
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
      students (
        full_name,
        cedula,
        courses (
          name,
          grade_level,
          section
        )
      )
    `)
    .eq('school_id', profile.school_id)
    .order('incident_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (recordsError) {
    console.error('Error cargando student_behavior_records:', recordsError)
  }

  const initialRecords = recordsData ?? []

  return (
    <div className="mx-auto max-w-4xl">
      <BehaviorManagementClient
        initialRecords={initialRecords as any}
        students={students}
        currentUserId={user.id}
        currentUserRole={profile.role}
      />
    </div>
  )
}
