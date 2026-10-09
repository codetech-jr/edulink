import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  Plus, 
  ChevronRight, 
  LayoutDashboard, 
  MoreVertical,
  Users
} from 'lucide-react'
import { CourseCardActions } from './_components/course-card-actions'

export const metadata = {
  title: 'Gestión de Cursos | EduLink',
  description: 'Administración de grados y secciones.',
}

export default async function CoursesManagementPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  // Obtener cursos y contar alumnos por curso
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      id,
      name,
      grade_level,
      section,
      students ( id )
    `)
    .eq('school_id', profile?.school_id ?? '')
    .order('grade_level', { ascending: true })

  const courseList = courses ?? []
  const hasCourses = courseList.length > 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Link href="/admin" className="hover:text-blue-600 transition-colors">Admin</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Cursos</span>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Cursos y Secciones</h1>
            <p className="text-gray-600 mt-1">Estructura académica de la institución.</p>
          </div>
          <Link 
            href="/admin/courses/new"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus className="w-5 h-5" />
            Nuevo Curso
          </Link>
        </div>

        {hasCourses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseList.map((course: any) => (
              <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-600 transition-colors">
                    <BookOpen className="w-6 h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <CourseCardActions 
                    courseId={course.id} 
                    courseName={`${course.grade_level}° "${course.section}"`} 
                  />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900">
                  {course.grade_level}° {course.section}
                </h3>
                <p className="text-gray-500 text-sm font-medium mb-4">{course.name}</p>

                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{course.students?.length || 0} alumnos inscritos</span>
                </div>

                <Link 
                  href={`/admin/courses/${course.id}`}
                  className="absolute inset-0 rounded-2xl"
                  aria-label={`Ver detalles de ${course.name}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-6">
              <BookOpen className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay cursos registrados</h3>
            <p className="text-gray-500 max-w-sm mb-8">
              Define los grados y secciones de tu colegio para poder inscribir estudiantes.
            </p>
            <Link 
              href="/admin/courses/new"
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
            >
              Crear primer curso
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
