import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Users, BookOpen, ArrowUpRight } from 'lucide-react'

interface EnrollmentBarProps {
  schoolId: string
}

interface GradeEnrollment {
  gradeLevel: string
  label: string
  studentCount: number
  sectionCount: number
}

export async function EnrollmentBar({ schoolId }: EnrollmentBarProps) {
  const supabase = await createClient()

  // 1. Consultar cursos y conteo de alumnos de la institución
  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      id,
      name,
      grade_level,
      section,
      students ( id )
    `)
    .eq('school_id', schoolId)
    .order('grade_level', { ascending: true })

  if (error) {
    console.error('Error fetching enrollment courses:', error)
  }

  const courseList = courses ?? []

  // 2. Agrupar la matrícula por nivel académico (Grado / Año)
  const gradeMap = new Map<string, GradeEnrollment>()
  let totalEnrolled = 0

  for (const course of courseList) {
    const gradeKey = String(course.grade_level || 'General')
    const studentsInCourse = Array.isArray(course.students)
      ? course.students.length
      : 0
    totalEnrolled += studentsInCourse

    const existing = gradeMap.get(gradeKey)
    if (existing) {
      existing.studentCount += studentsInCourse
      existing.sectionCount += 1
    } else {
      gradeMap.set(gradeKey, {
        gradeLevel: gradeKey,
        label: course.name?.trim() ? course.name : `${course.grade_level}° Nivel`,
        studentCount: studentsInCourse,
        sectionCount: 1,
      })
    }
  }

  const gradeList = Array.from(gradeMap.values())
  const maxEnrollment = Math.max(...gradeList.map((g) => g.studentCount), 1)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <CardTitle className="text-base font-semibold text-zinc-900">
                Distribución de Matrícula
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-zinc-500 mt-1">
              Capacidad y estudiantes inscritos por grado académico
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-zinc-400">Total: </span>
              <span className="text-sm font-bold text-zinc-900">
                {totalEnrolled} alumno{totalEnrolled === 1 ? '' : 's'}
              </span>
            </div>
            <Link
              href="/admin/courses"
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-indigo-600 transition-colors p-1.5 rounded-lg hover:bg-zinc-100"
              title="Ir a gestión de cursos"
            >
              <span>Ver cursos</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-3">
        {gradeList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-8 w-8 text-zinc-300 mb-2" />
            <p className="text-xs font-medium text-zinc-600">
              No hay cursos configurados en el colegio
            </p>
            <p className="text-2xs text-zinc-400 mt-0.5">
              Cree los grados y secciones para visualizar la distribución.
            </p>
            <Link
              href="/admin/courses/new"
              className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              + Crear primer curso
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {gradeList.map((grade) => {
              const widthPct = Math.min(
                100,
                Math.round((grade.studentCount / maxEnrollment) * 100)
              )
              const sharePct =
                totalEnrolled > 0
                  ? Math.round((grade.studentCount / totalEnrolled) * 100)
                  : 0

              return (
                <div key={grade.gradeLevel} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-700 truncate pr-2">
                      {grade.label}
                      <span className="ml-1.5 text-2xs font-normal text-zinc-400">
                        ({grade.sectionCount} secci{grade.sectionCount === 1 ? 'ón' : 'ones'})
                      </span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-zinc-900">
                        {grade.studentCount}
                      </span>
                      <span className="text-2xs text-zinc-400 font-mono w-9 text-right">
                        {sharePct}%
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso en CSS puro */}
                  <div
                    className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={grade.studentCount}
                    aria-valuemin={0}
                    aria-valuemax={maxEnrollment}
                    aria-label={`Matrícula de ${grade.label}`}
                  >
                    <div
                      className="h-full rounded-full bg-indigo-600/90 transition-all duration-300 ease-out"
                      style={{ width: `${Math.max(widthPct, 2)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
