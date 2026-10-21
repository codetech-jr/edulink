import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SelectorHeader } from './_components/SelectorHeader'
import { EvaluationPlanForm } from './_components/EvaluationPlanForm'
import { GradingSheet } from './_components/GradingSheet'

interface PageProps {
  searchParams: Promise<{
    subjectId?: string
    termId?: string
  }>
}

export const metadata = {
  title: 'Cuaderno de Calificaciones | EduLink',
  description: 'Gestión y carga de calificaciones escolares.',
}

export default async function CalificacionesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // 1. Validar sesión del usuario
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Validar perfil y rol de docente
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id, role, full_name')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'docente') {
    redirect('/login')
  }

  // 3. Obtener asignaturas y año escolar activo en paralelo
  const [subjectsResult, schoolYearResult] = await Promise.all([
    supabase
      .from('subjects')
      .select(`
        id,
        name,
        courses (
          id,
          name,
          grade_level,
          section
        )
      `)
      .eq('teacher_id', user.id),
    supabase
      .from('school_years')
      .select('id')
      .eq('school_id', profile.school_id)
      .eq('is_active', true)
      .single(),
  ])

  const subjects = subjectsResult.data
  if (subjectsResult.error) {
    console.error('Error al cargar materias:', subjectsResult.error)
  }

  const normalizedSubjects = (subjects || []).map((sub: any /* TODO: tipado pendiente */) => {
    let courseData = sub.courses
    if (Array.isArray(courseData)) {
      courseData = courseData[0] || null
    }
    return {
      id: sub.id,
      name: sub.name,
      courses: courseData
        ? {
            id: courseData.id,
            name: courseData.name,
            grade_level: courseData.grade_level,
            section: courseData.section,
          }
        : null,
    }
  })

  // 4. Obtener los lapsos (terms) del año escolar
  const schoolYear = schoolYearResult.data
  let terms: any[] = [] /* TODO: tipado pendiente */
  if (schoolYear) {
    const { data: termsData } = await supabase
      .from('terms')
      .select('id, name, term_number')
      .eq('school_year_id', schoolYear.id)
      .order('term_number', { ascending: true })
    terms = termsData || []
  }

  // 5. Determinar materia y lapso seleccionados por defecto
  const selectedSubjectId = params.subjectId || normalizedSubjects[0]?.id || ''
  const selectedTermId = params.termId || terms[0]?.id || ''

  const selectedSubject = normalizedSubjects.find((s) => s.id === selectedSubjectId)
  const selectedTerm = terms.find((t) => t.id === selectedTermId)

  // 6. Consultar plan de evaluación y estudiantes en paralelo
  let students: any[] = [] /* TODO: tipado pendiente */
  let evaluations: any[] = [] /* TODO: tipado pendiente */
  let grades: any[] = [] /* TODO: tipado pendiente */
  let totalWeight = 0
  let isPlanComplete = false

  if (selectedSubjectId && selectedTermId) {
    const courseId = selectedSubject?.courses?.id

    const [studentsResult, evResult] = await Promise.all([
      courseId
        ? supabase
            .from('students')
            .select('id, full_name, list_number')
            .eq('course_id', courseId)
            .eq('is_active', true)
            .order('list_number', { ascending: true })
        : Promise.resolve({ data: [] }),
      supabase
        .from('evaluations')
        .select('id, name, weight, is_published, evaluation_date')
        .eq('subject_id', selectedSubjectId)
        .eq('term_id', selectedTermId)
        .order('created_at', { ascending: true }),
    ])

    students = studentsResult.data || []
    evaluations = evResult.data || []

    totalWeight = evaluations.reduce((sum, ev) => sum + Number(ev.weight || 0), 0)
    isPlanComplete = totalWeight === 100

    const evaluationIds = evaluations.map((e) => e.id)
    if (evaluationIds.length > 0) {
      const { data: gradesData } = await supabase
        .from('grades')
        .select('id, evaluation_id, student_id, score, is_absent, notes')
        .in('evaluation_id', evaluationIds)
      grades = gradesData || []
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50/50 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        
        {/* Cabecera con selector */}
        <SelectorHeader
          subjects={normalizedSubjects}
          terms={terms}
          selectedSubjectId={selectedSubjectId}
          selectedTermId={selectedTermId}
        />

        {/* Sección de carga */}
        {selectedSubjectId && selectedTermId ? (
          students.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 font-bold flex items-center justify-center mx-auto text-lg">
                ⚠️
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">No hay estudiantes</h3>
              <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                No se encontraron estudiantes activos inscritos en la sección o curso de esta asignatura.
              </p>
            </div>
          ) : !isPlanComplete ? (
            <EvaluationPlanForm
              subjectId={selectedSubjectId}
              termId={selectedTermId}
              subjectName={selectedSubject?.name || 'Materia'}
              termName={selectedTerm?.name || 'Lapso'}
            />
          ) : (
            <GradingSheet
              students={students}
              evaluations={evaluations}
              initialGrades={grades}
              subjectId={selectedSubjectId}
              termId={selectedTermId}
              subjectName={selectedSubject?.name || 'Materia'}
              termName={selectedTerm?.name || 'Lapso'}
              teacherName={profile.full_name || 'Docente'}
              courseName={selectedSubject?.courses ? `${selectedSubject.courses.name} (${selectedSubject.courses.grade_level}° - "${selectedSubject.courses.section}")` : 'Curso'}
            />
          )
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 font-bold flex items-center justify-center mx-auto text-lg">
              🔍
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">Falta Información</h3>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
              Asegúrate de tener materias asignadas en tu panel y de seleccionar una asignatura/lapso.
            </p>
          </div>
        )}

      </div>
    </main>
  )
}
