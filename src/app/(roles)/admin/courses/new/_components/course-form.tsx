'use client'

import { createCourse, updateCourse } from '@/actions/course-actions'
import { useFormStatus } from 'react-dom'
import { BookOpen, Hash, Layers, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface CourseInitialData {
  id: string
  name: string
  grade_level: number
  section: string
}

interface CourseFormProps {
  initialData?: CourseInitialData
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-70 group"
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {isEdit ? 'Guardando cambios...' : 'Creando curso...'}
        </>
      ) : (
        <>
          {isEdit ? 'Guardar Cambios' : 'Guardar Curso'}
          <span className="group-hover:translate-x-1 transition-transform text-blue-400">→</span>
        </>
      )}
    </button>
  )
}

export function CourseForm({ initialData }: CourseFormProps = {}) {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    try {
      if (initialData?.id) {
        await updateCourse(initialData.id, formData)
      } else {
        await createCourse(formData)
      }
    } catch (e: any) {
      setError(e.message || 'Error al guardar el curso')
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Nombre del Curso */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-bold text-gray-700 ml-1">
          Nombre del Curso / Materia
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialData?.name}
            placeholder="Ej: Educación Primaria o Informática I"
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Grado */}
        <div className="space-y-2">
          <label htmlFor="grade_level" className="block text-sm font-bold text-gray-700 ml-1">
            Grado / Año
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <Hash className="w-5 h-5" />
            </div>
            <input
              id="grade_level"
              name="grade_level"
              type="number"
              min="1"
              max="6"
              required
              defaultValue={initialData?.grade_level}
              placeholder="Ej: 1"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium"
            />
          </div>
        </div>

        {/* Sección */}
        <div className="space-y-2">
          <label htmlFor="section" className="block text-sm font-bold text-gray-700 ml-1">
            Sección
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <input
              id="section"
              name="section"
              type="text"
              maxLength={2}
              required
              defaultValue={initialData?.section}
              placeholder="Ej: A"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <SubmitButton isEdit={!!initialData?.id} />
      </div>
    </form>
  )
}
