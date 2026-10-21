import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AttendanceSheet } from '../_components/AttendanceSheet'
import { ClipboardCheck } from 'lucide-react'

export const metadata = {
  title: 'Control de Asistencia | EduLink',
  description: 'Gestión de asistencias diarias para docentes.',
}

export default async function DocenteAsistenciaPage() {
  const supabase = await createClient()

  // Auth is handled by layout.tsx — we just need the user for data queries
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

  // ── Fetch subjects with courses and students ───────────
  const { data: subjects, error: subjectsError } = await supabase
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
          list_number,
          is_active
        )
      )
    `)
    .eq('teacher_id', user.id)

  if (subjectsError) {
    console.error('Error cargando materias y alumnos:', subjectsError)
  }

  // Normalize data for safe client-side typing
  const normalizedSubjects = (subjects || []).map((sub: any /* TODO: tipado pendiente */) => {
    let courseData = sub.courses
    if (Array.isArray(courseData)) {
      courseData = courseData[0] || null
    }

    const studentsList = Array.isArray(courseData?.students)
      ? courseData.students
      : []

    return {
      id: sub.id,
      name: sub.name,
      courses: courseData
        ? {
            id: courseData.id,
            name: courseData.name,
            grade_level: courseData.grade_level,
            section: courseData.section,
            students: studentsList,
          }
        : null,
    }
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── Title ────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Control de Asistencia
        </h1>
        <p className="mt-1 text-[14px] text-zinc-400">
          Selecciona una materia para registrar la asistencia del día.
        </p>
      </div>

      {/* ── Attendance Section ────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-zinc-400" strokeWidth={1.8} />
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-400">
              Asistenciario Diario
            </h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-emerald-600 border border-emerald-100">
            Activo
          </span>
        </div>
        <AttendanceSheet subjects={normalizedSubjects} />
      </div>
    </div>
  )
}
