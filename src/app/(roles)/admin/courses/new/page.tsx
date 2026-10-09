import Link from 'next/link'
import { ChevronLeft, BookOpen } from 'lucide-react'
import { CourseForm } from './_components/course-form'

export const metadata = {
  title: 'Nuevo Curso | EduLink',
  description: 'Crear un nuevo grado o sección académica.',
}

export default function NewCoursePage() {
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
            <h1 className="text-3xl font-extrabold text-gray-900">Crear Nuevo Curso</h1>
            <p className="text-gray-600 mt-2">Define el nombre, grado y sección del nuevo aula.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-8 md:p-10">
            <CourseForm />
          </div>
        </div>
      </main>
    </div>
  )
}
