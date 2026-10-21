import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logoutAction } from '@/actions/auth-actions'
import { StudentDashboard } from './_components/StudentDashboard'
import { AlertCircle, User, LogOut } from 'lucide-react'

export const metadata = {
  title: 'Portal de Estudiante | EduLink',
  description: 'Consulta tus materias, evaluaciones, calificaciones y asistencia.',
}

export default async function EstudiantePortalPage() {
  const supabase = await createClient()

  // 1. Validar sesión del usuario
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Validar perfil y rol de estudiante en la base de datos
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name, school_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'estudiante') {
    redirect('/login')
  }

  // 3. Buscar la información del estudiante en la tabla "students"
  // Vinculando por profile_id = user.id o id = user.id (primaria/común en base de datos)
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select(`
      id,
      full_name,
      cedula,
      school_id,
      course_id,
      courses (
        id,
        name,
        grade_level,
        section
      )
    `)
    .or(`id.eq.${user.id},profile_id.eq.${user.id}`)
    .single()

  // 4. Si el estudiante no está enlazado en la base de datos, mostramos un Empty State instructivo
  if (studentError || !student) {
    console.warn('Estudiante no enlazado:', studentError)
    return (
      <main className="flex min-h-screen flex-col bg-zinc-50 text-zinc-800 p-4 font-sans selection:bg-indigo-100">
        <div className="mx-auto w-full max-w-md flex flex-col justify-center items-center min-h-[80vh] space-y-6">
          <div className="w-14 h-14 bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-2xl flex items-center justify-center shadow-inner">
            <User className="w-6 h-6 animate-pulse" />
          </div>
          
          <div className="text-center space-y-2 px-4">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
              Hola, {profile.full_name}
            </h1>
            <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
              Portal Estudiantil en Espera
            </p>
            <p className="text-xs text-zinc-400 mt-2">
              Tu cuenta de usuario ha sido registrada pero aún no está asociada a ningún registro de estudiante de la institución.
            </p>
            <div className="p-4 bg-zinc-100 border border-zinc-200 rounded-2xl text-xs text-zinc-500 font-normal text-left mt-6 flex gap-3">
              <AlertCircle className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>¿Cómo solucionarlo?</strong> Pide a tu representante o acude a la secretaría del colegio para asociar tu cédula escolar al correo de tu cuenta.
              </span>
            </div>
          </div>

          <form action={logoutAction} className="w-full pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full shadow-sm hover:shadow transition-all text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </main>
    )
  }

  // ── Parallel Stage 1: Datos independientes del estudiante ───
  const [
    { data: school },
    { data: schoolYear },
    { data: subjects },
    { data: attendanceData },
    { data: communicationsData },
  ] = await Promise.all([
    supabase
      .from('schools')
      .select('name, rif')
      .eq('id', student.school_id)
      .single(),
    supabase
      .from('school_years')
      .select('id')
      .eq('school_id', student.school_id)
      .eq('is_active', true)
      .single(),
    supabase
      .from('subjects')
      .select(`
        id,
        name,
        start_time,
        end_time,
        weekly_hours,
        profiles:teacher_id (
          full_name
        )
      `)
      .eq('course_id', student.course_id),
    supabase
      .from('attendance')
      .select(`
        id,
        status,
        attendance_date,
        subject_id
      `)
      .eq('student_id', student.id)
      .gte('attendance_date', '2026-06-08')
      .lte('attendance_date', '2026-06-12'),
    supabase
      .from('communications')
      .select('*')
      .eq('school_id', student.school_id)
      .order('created_at', { ascending: false }),
  ])

  const defaultSchool = school || { name: 'U.E. Liceo Matalinda', rif: 'J-12345678-9' }
  const activeSubjects = subjects || []
  const attendance = attendanceData || []
  const communications = (communicationsData ?? []).filter((c: any) => !c.is_archived) /* TODO: tipado pendiente */

  // ── Parallel Stage 2: Lapsos y Evaluaciones ─────────────────
  const subjectIds = activeSubjects.map((s) => s.id)

  const [termsData, evData] = await Promise.all([
    schoolYear
      ? supabase
          .from('terms')
          .select('id, name, term_number')
          .eq('school_year_id', schoolYear.id)
          .order('term_number', { ascending: true })
          .then((res) => res.data)
      : Promise.resolve(null),
    subjectIds.length > 0
      ? supabase
          .from('evaluations')
          .select(`
            id,
            subject_id,
            name,
            weight,
            evaluation_date,
            term_id,
            is_published
          `)
          .in('subject_id', subjectIds)
          .order('created_at', { ascending: true })
          .then((res) => res.data)
      : Promise.resolve(null),
  ])

  const terms = termsData || []
  const evaluations = evData || []

  // ── Parallel Stage 3: Calificaciones ────────────────────────
  let grades: any[] = [] /* TODO: tipado pendiente */
  const evaluationIds = evaluations.map((e) => e.id)

  if (evaluationIds.length > 0) {
    const { data: gradesData } = await supabase
      .from('grades')
      .select(`
        id,
        evaluation_id,
        score,
        is_absent,
        notes
      `)
      .eq('student_id', student.id)
      .in('evaluation_id', evaluationIds)
    grades = gradesData || []
  }

  return (
    <StudentDashboard
      student={student}
      school={defaultSchool}
      subjects={activeSubjects}
      evaluations={evaluations}
      grades={grades}
      attendance={attendance}
      terms={terms}
      communications={communications}
    />
  )
}
