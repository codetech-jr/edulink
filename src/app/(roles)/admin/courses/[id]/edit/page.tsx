import Link from 'next/link'
import { ChevronLeft, BookOpen } from 'lucide-react'
import { CourseForm } from '../../new/_components/course-form'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Editar Curso | EduLink',
  description: 'Modificar configuración de grado o sección académica.',
}

interface EditCoursePageProps {
  params: {
    id: string
  }
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const supabase = await createClient()

  // 1. Obtener usuario y su perfil para el school_id
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) {
    redirect('/admin')
  }

  // 2. Obtener datos del curso a editar
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, name, grade_level, section')
    .eq('id', params.id)
    .eq('school_id', profile.school_id)
    .single()

  if (courseError || !course) {
    redirect('/admin/courses')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/admin/courses" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium text-sm">
            <ChevronLeft className="w-4 h-4" />
            Volver a cursos
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Configuración Académica</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Editar Curso</h1>
            <p className="text-gray-600 mt-2">Modifica el nombre, grado o sección del aula.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-8 md:p-10">
            <CourseForm initialData={course} />
          </div>
        </div>
      </main>
    </div>
  )
}
