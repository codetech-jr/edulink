import Link from 'next/link'
import { ChevronLeft, GraduationCap } from 'lucide-react'
import { StudentForm } from './_components/student-form'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Inscribir Estudiante | EduLink',
  description: 'Formulario de registro para nuevos alumnos.',
}

export default async function NewStudentPage() {
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

  // 2. Cargar cursos disponibles para esta institución
  const { data: courses } = await supabase
    .from('courses')
    .select('id, name, section')
    .eq('school_id', profile.school_id)
    .order('name', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header simplificado para enfoque en el formulario */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link 
            href="/admin/students" 
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al listado
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">EduLink Admin</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Inscribir Nuevo Alumno</h1>
            <p className="text-gray-600 mt-2">Completa los datos básicos para iniciar el registro académico.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-8 md:p-10">
            <StudentForm courses={courses || []} />
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Los datos de contacto de representantes y asignación de cursos se realizarán en los siguientes pasos.
          </p>
        </div>
      </main>
    </div>
  )
}

