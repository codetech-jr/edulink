'use client'

import { createStudent, updateStudent } from '@/actions/student-actions'
import { useFormStatus } from 'react-dom'
import { User, CreditCard, Loader2, BookOpen } from 'lucide-react'
import { useState } from 'react'

interface Course {
  id: string
  name: string
  section: string
}

interface StudentInitialData {
  id: string
  full_name: string
  cedula: string
  course_id: string
}

interface StudentFormProps {
  courses: Course[]
  initialData?: StudentInitialData
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed group"
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {isEdit ? 'Guardando cambios...' : 'Procesando inscripción...'}
        </>
      ) : (
        <>
          {isEdit ? 'Guardar Cambios' : 'Confirmar Inscripción'}
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </>
      )}
    </button>
  )
}

export function StudentForm({ courses, initialData }: StudentFormProps) {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    try {
      if (initialData?.id) {
        await updateStudent(initialData.id, formData)
      } else {
        await createStudent(formData)
      }
    } catch (e: any /* TODO: tipado pendiente */) {
      setError(e.message || 'Ocurrió un error inesperado')
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {/* Campo: Nombre Completo */}
      <div className="space-y-2">
        <label htmlFor="full_name" className="block text-sm font-bold text-gray-700 ml-1">
          Nombre Completo del Estudiante
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
            <User className="w-5 h-5" />
          </div>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            defaultValue={initialData?.full_name}
            placeholder="Ej: Juan Pérez González"
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-gray-900 placeholder:text-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Campo: Cédula / ID */}
      <div className="space-y-2">
        <label htmlFor="cedula" className="block text-sm font-bold text-gray-700 ml-1">
          Cédula de Identidad o ID Escolar
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
            <CreditCard className="w-5 h-5" />
          </div>
          <input
            id="cedula"
            name="cedula"
            type="text"
            required
            defaultValue={initialData?.cedula}
            placeholder="Ej: V-25123456"
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-gray-900 placeholder:text-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Campo: Selección de Curso */}
      <div className="space-y-2">
        <label htmlFor="course_id" className="block text-sm font-bold text-gray-700 ml-1">
          Asignación de Curso / Sección
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
            <BookOpen className="w-5 h-5" />
          </div>
          <select
            id="course_id"
            name="course_id"
            required
            defaultValue={initialData?.course_id || ""}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium appearance-none"
          >
            <option value="" disabled>Selecciona un curso...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} - Sección {course.section}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <span className="text-xs">▼</span>
          </div>
        </div>
        {courses.length === 0 && (
          <p className="text-xs text-amber-600 ml-1">
            ⚠️ No hay cursos disponibles. Debes crear un curso primero.
          </p>
        )}
      </div>

      <div className="pt-4">
        <SubmitButton isEdit={!!initialData?.id} />
      </div>
    </form>
  )
}

