'use client'

import { createStudent, updateStudent } from '@/actions/student-actions'
import { useFormStatus } from 'react-dom'
import {
  User,
  CreditCard,
  Loader2,
  BookOpen,
  Calendar,
  Users,
  ShieldCheck,
  Phone,
  Globe2,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

export const GUARDIAN_RELATIONSHIPS = [
  { value: 'madre', label: 'Madre' },
  { value: 'padre', label: 'Padre' },
  { value: 'abuela', label: 'Abuela' },
  { value: 'abuelo', label: 'Abuelo' },
  { value: 'tia', label: 'Tía' },
  { value: 'tio', label: 'Tío' },
  { value: 'hermana', label: 'Hermana mayor' },
  { value: 'hermano', label: 'Hermano mayor' },
  { value: 'tutor_legal', label: 'Tutor(a) Legal (LOPNNA / Poder Notariado)' },
  { value: 'otro', label: 'Otro familiar / Responsable' },
]

export interface RepresentativeOption {
  id: string
  full_name: string
  cedula?: string | null
  phone?: string | null
}

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
  birth_date?: string | null
  gender?: string | null
  parent_id?: string | null
  relationship?: string | null
  secondary_guardian_name?: string | null
  secondary_guardian_phone?: string | null
  secondary_guardian_relationship?: string | null
}

interface StudentFormProps {
  courses: Course[]
  representatives?: RepresentativeOption[]
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

export function StudentForm({ courses, representatives = [], initialData }: StudentFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [repMode, setRepMode] = useState<'existing' | 'new' | 'none'>(() => {
    if (initialData?.parent_id) return 'existing'
    if (representatives.length > 0) return 'existing'
    return 'new'
  })
  const [showSecondary, setShowSecondary] = useState(
    Boolean(initialData?.secondary_guardian_name)
  )

  async function handleSubmit(formData: FormData) {
    setError(null)
    try {
      if (initialData?.id) {
        await updateStudent(initialData.id, formData)
      } else {
        await createStudent(formData)
      }
    } catch (e: any) {
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

      {/* ── SECCIÓN 1: DATOS DEL ESTUDIANTE ────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-blue-600">
          1. Datos del Alumno
        </h2>

        {/* Nombre Completo */}
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
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-gray-900 placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        {/* Cédula */}
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
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-gray-900 placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        {/* Grid: Fecha de Nacimiento y Sexo MPPE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="birth_date" className="block text-sm font-bold text-gray-700 ml-1">
              Fecha de Nacimiento
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                <Calendar className="w-5 h-5" />
              </div>
              <input
                id="birth_date"
                name="birth_date"
                type="date"
                defaultValue={initialData?.birth_date || ''}
                max={new Date().toISOString().split('T')[0]}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="gender" className="block text-sm font-bold text-gray-700 ml-1">
              Sexo (MPPE)
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                <Users className="w-5 h-5" />
              </div>
              <select
                id="gender"
                name="gender"
                defaultValue={initialData?.gender || ''}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium appearance-none"
              >
                <option value="">Seleccionar sexo...</option>
                <option value="M">Masculino (Varón)</option>
                <option value="F">Femenino (Hembra)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Curso / Sección */}
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
              defaultValue={initialData?.course_id || ''}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium appearance-none"
            >
              <option value="" disabled>Selecciona un curso...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} - Sección {course.section}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 2: REPRESENTANTE LEGAL O TUTOR ──────────────────── */}
      <div className="pt-4 border-t border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-indigo-700">
                2. Representante Legal / Tutor (LOPNNA)
              </h2>
              <p className="text-[11px] text-gray-500">
                Persona responsable en el plantel (abuelo, tía, tutor legal, etc.)
              </p>
            </div>
          </div>
        </div>

        {/* Modos de Selección */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl text-xs font-bold text-gray-600">
          <button
            type="button"
            onClick={() => setRepMode('existing')}
            className={`py-2 rounded-lg transition-all ${
              repMode === 'existing'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'hover:text-gray-900'
            }`}
          >
            Vincular Existente
          </button>
          <button
            type="button"
            onClick={() => setRepMode('new')}
            className={`py-2 rounded-lg transition-all ${
              repMode === 'new'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'hover:text-gray-900'
            }`}
          >
            Registrar Nuevo
          </button>
          <button
            type="button"
            onClick={() => setRepMode('none')}
            className={`py-2 rounded-lg transition-all ${
              repMode === 'none'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'hover:text-gray-900'
            }`}
          >
            Sin Asignar
          </button>
        </div>

        {/* Modo: Vincular Existente */}
        {repMode === 'existing' && (
          <div className="space-y-3 p-4 bg-gray-50/70 border border-gray-200/80 rounded-2xl animate-in fade-in">
            {representatives.length > 0 ? (
              <div className="space-y-2">
                <label htmlFor="parent_id" className="block text-xs font-bold text-gray-700 ml-1">
                  Seleccionar Tutor o Representante Registrado
                </label>
                <div className="relative">
                  <select
                    id="parent_id"
                    name="parent_id"
                    defaultValue={initialData?.parent_id || ''}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 appearance-none"
                  >
                    <option value="">Selecciona un representante...</option>
                    {representatives.map((rep) => (
                      <option key={rep.id} value={rep.id}>
                        {rep.full_name} {rep.cedula ? `(C.I. ${rep.cedula})` : ''} {rep.phone ? `• ${rep.phone}` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                Aún no hay representantes registrados en el sistema. Puedes seleccionar &quot;Registrar Nuevo&quot; arriba.
              </p>
            )}

            {/* Parentesco con el Alumno */}
            <div className="space-y-2">
              <label htmlFor="relationship" className="block text-xs font-bold text-gray-700 ml-1">
                Parentesco / Vínculo con el Alumno
              </label>
              <div className="relative">
                <select
                  id="relationship"
                  name="relationship"
                  defaultValue={initialData?.relationship || 'madre'}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 appearance-none"
                >
                  {GUARDIAN_RELATIONSHIPS.map((rel) => (
                    <option key={rel.value} value={rel.value}>
                      {rel.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modo: Registrar Nuevo Tutor */}
        {repMode === 'new' && (
          <div className="space-y-3 p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="new_parent_name" className="block text-xs font-bold text-gray-700 ml-1">
                  Nombre Completo del Tutor
                </label>
                <input
                  id="new_parent_name"
                  name="new_parent_name"
                  type="text"
                  placeholder="Ej: Rosa Elena Martínez"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="new_parent_cedula" className="block text-xs font-bold text-gray-700 ml-1">
                  Cédula del Tutor
                </label>
                <input
                  id="new_parent_cedula"
                  name="new_parent_cedula"
                  type="text"
                  placeholder="Ej: V-12345678"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="new_parent_phone" className="block text-xs font-bold text-gray-700 ml-1">
                  Teléfono / WhatsApp Local
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="new_parent_phone"
                    name="new_parent_phone"
                    type="tel"
                    placeholder="04121234567"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="new_relationship" className="block text-xs font-bold text-gray-700 ml-1">
                  Parentesco / Vínculo
                </label>
                <select
                  id="new_relationship"
                  name="relationship"
                  defaultValue="abuela"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {GUARDIAN_RELATIONSHIPS.map((rel) => (
                    <option key={rel.value} value={rel.value}>
                      {rel.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── SECCIÓN 3: FAMILIAR EN EL EXTERIOR / CONTACTO SECUNDARIO ── */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowSecondary(!showSecondary)}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Globe2 className="w-4 h-4" />
            <span>
              {showSecondary
                ? '− Ocultar familiar en el exterior o contacto de respaldo'
                : '+ ¿El padre/madre u otro familiar está en el exterior o costea los pagos?'}
            </span>
          </button>

          {showSecondary && (
            <div className="mt-3 p-4 bg-sky-50/50 border border-sky-100 rounded-2xl space-y-3 animate-in fade-in">
              <p className="text-[11px] text-sky-800 font-medium">
                Registra aquí al familiar que envía remesas o actúa como contacto secundario de emergencia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="secondary_guardian_name" className="block text-xs font-bold text-gray-700 ml-1">
                    Nombre del Familiar
                  </label>
                  <input
                    id="secondary_guardian_name"
                    name="secondary_guardian_name"
                    type="text"
                    defaultValue={initialData?.secondary_guardian_name || ''}
                    placeholder="Ej: Carlos Pérez (Papá en Chile)"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="secondary_guardian_phone" className="block text-xs font-bold text-gray-700 ml-1">
                    WhatsApp Internacional o Local
                  </label>
                  <input
                    id="secondary_guardian_phone"
                    name="secondary_guardian_phone"
                    type="tel"
                    defaultValue={initialData?.secondary_guardian_phone || ''}
                    placeholder="Ej: +56 9 1234 5678"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="secondary_guardian_relationship" className="block text-xs font-bold text-gray-700 ml-1">
                  Vínculo / Rol
                </label>
                <input
                  id="secondary_guardian_relationship"
                  name="secondary_guardian_relationship"
                  type="text"
                  defaultValue={initialData?.secondary_guardian_relationship || ''}
                  placeholder="Ej: Padre en el extranjero (Responsable económico)"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <SubmitButton isEdit={!!initialData?.id} />
      </div>
    </form>
  )
}
