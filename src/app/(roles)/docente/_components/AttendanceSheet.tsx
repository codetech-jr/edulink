'use client'

import React, { useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  Save,
  Loader2,
  BookOpen,
  Calendar,
  AlertCircle,
  X,
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react'
import { saveDailyAttendanceAction } from '@/actions/teacher-actions'

interface Student {
  id: string
  full_name: string
  cedula: string | null
  list_number: number | null
  is_active: boolean
}

interface Course {
  id: string
  name: string
  grade_level: number
  section: string
  students: Student[]
}

interface Subject {
  id: string
  name: string
  courses: Course | null
}

interface AttendanceSheetProps {
  subjects: Subject[]
}

type AttendanceStatus = 'presente' | 'ausente' | 'tarde' | 'justificado'

// Botón de submit pegajoso que utiliza useFormStatus
function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 flex justify-center shadow-lg">
      <div className="w-full max-w-2xl">
        <button
          type="submit"
          disabled={pending || disabled}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-[0.99] duration-150 text-base ${
            pending || disabled
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-slate-900 hover:bg-slate-800 hover:shadow-lg'
          }`}
        >
          {pending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando asistencia...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Lista de Asistencia
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export function AttendanceSheet({ subjects }: AttendanceSheetProps) {
  // 1. Estados principales
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Inicializar con la fecha local en formato YYYY-MM-DD
    const d = new Date()
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-')
  })
  
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [openNotesId, setOpenNotesId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Encontrar la asignatura seleccionada
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId)
  
  // Filtrar estudiantes activos y ordenar por número de lista
  const students = React.useMemo(() => {
    if (!selectedSubject?.courses?.students) return []
    return selectedSubject.courses.students
      .filter((s) => s.is_active)
      .sort((a, b) => (a.list_number || 0) - (b.list_number || 0))
  }, [selectedSubject])

  // Filtrar estudiantes por término de búsqueda
  const filteredStudents = React.useMemo(() => {
    if (!searchTerm) return students
    return students.filter((s) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [students, searchTerm])

  // 2. Inicializar estado de asistencia al seleccionar asignatura
  useEffect(() => {
    if (selectedSubjectId) {
      const initial: Record<string, AttendanceStatus> = {}
      students.forEach((student) => {
        initial[student.id] = 'presente'
      })
      setAttendance(initial)
      setNotes({})
      setOpenNotesId(null)
      setSearchTerm('')
    } else {
      setAttendance({})
    }
  }, [selectedSubjectId, students])

  // Auto-cerrar notificación después de unos segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // 3. Handlers
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleNoteChange = (studentId: string, value: string) => {
    setNotes((prev) => ({
      ...prev,
      [studentId]: value
    }))
  }

  const toggleNoteInput = (studentId: string) => {
    setOpenNotesId((prev) => (prev === studentId ? null : studentId))
  }

  const handleFormSubmit = async () => {
    if (!selectedSubjectId) return

    const records = Object.entries(attendance).map(([studentId, status]) => ({
      student_id: studentId,
      subject_id: selectedSubjectId,
      status,
      notes: notes[studentId] || undefined
    }))

    try {
      const result = await saveDailyAttendanceAction(selectedDate, records)
      
      if (result.success) {
        setNotification({
          type: 'success',
          message: '¡Asistencia guardada exitosamente en la base de datos!'
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Ocurrió un error inesperado al guardar la asistencia.'
        })
      }
    } catch (error) {
      console.error('Error al guardar asistencia:', error)
      setNotification({
        type: 'error',
        message: 'Error de red o de servidor al intentar guardar la asistencia.'
      })
    }
  }

  // Cálculos rápidos para resúmenes
  const totalStudents = students.length
  const presentCount = Object.values(attendance).filter((s) => s === 'presente').length
  const absentCount = Object.values(attendance).filter((s) => s === 'ausente').length
  const tardyCount = Object.values(attendance).filter((s) => s === 'tarde').length
  const justifiedCount = Object.values(attendance).filter((s) => s === 'justificado').length

  return (
    <div className="space-y-6 pb-28">
      {/* Toast Notificación */}
      {notification && (
        <div
          role="alert"
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-4 rounded-3xl shadow-xl border w-[90%] max-w-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100 shadow-emerald-100/50'
              : 'bg-rose-50 text-rose-800 border-rose-100 shadow-rose-100/50'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span className="text-xs font-bold leading-tight flex-1">{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Panel Superior: Selección de Clase e Info */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selector de Asignatura */}
          <div className="space-y-1.5">
            <label htmlFor="subject-select" className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Asignatura / Curso
            </label>
            <div className="relative">
              <select
                id="subject-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent appearance-none cursor-pointer transition-all"
              >
                <option value="">Seleccione una asignatura...</option>
                {subjects.map((sub) => {
                  const course = sub.courses
                  const courseLabel = course
                    ? `${course.name} (${course.grade_level}° "${course.section}")`
                    : 'Sin salón'
                  return (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} — {courseLabel}
                    </option>
                  )
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Selector de Fecha */}
          <div className="space-y-1.5">
            <label htmlFor="date-select" className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Fecha del Pase de Lista
            </label>
            <div className="relative">
              <input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Resumen de Asistencia de la Sección */}
        {selectedSubjectId && totalStudents > 0 && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Resumen:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-extrabold bg-slate-200/60 text-slate-700 rounded-full">
                Total: {totalStudents}
              </span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                Presentes: {presentCount}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-100 rounded-full">
                Ausentes: {absentCount}
              </span>
              {tardyCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100 rounded-full">
                  Tardes: {tardyCount}
                </span>
              )}
              {justifiedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-100 rounded-full">
                  Justificados: {justifiedCount}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lista de Estudiantes */}
      {selectedSubjectId ? (
        <form action={handleFormSubmit} className="space-y-4">
          {totalStudents > 0 ? (
            <div className="space-y-3.5">
              {/* Barra de Filtro Rápido */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar estudiante por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent shadow-sm"
                />
              </div>

              {/* Contenedor de la lista */}
              <div className="space-y-2.5">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const currentStatus = attendance[student.id] || 'presente'
                    const isNotesOpen = openNotesId === student.id
                    const hasNote = !!notes[student.id]

                    return (
                      <div
                        key={student.id}
                        className={`bg-white rounded-2xl border transition-all duration-200 p-4 space-y-3 shadow-sm ${
                          currentStatus === 'presente'
                            ? 'border-emerald-100 hover:border-emerald-200'
                            : currentStatus === 'ausente'
                            ? 'border-rose-100 hover:border-rose-200'
                            : currentStatus === 'tarde'
                            ? 'border-amber-100 hover:border-amber-200'
                            : 'border-sky-100 hover:border-sky-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Info del Alumno */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                              {student.list_number || '-'}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-xs font-extrabold text-slate-800 truncate">{student.full_name}</h4>
                              {student.cedula && (
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">V-{student.cedula}</p>
                              )}
                            </div>
                          </div>

                          {/* Selector de Asistencia (Mobile Friendly) */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* Segmento Presente */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'presente')}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-150 ${
                                currentStatus === 'presente'
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-[1.04]'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                              }`}
                              aria-label="Presente"
                              title="Presente"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>

                            {/* Segmento Ausente */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'ausente')}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-150 ${
                                currentStatus === 'ausente'
                                  ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20 scale-[1.04]'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                              }`}
                              aria-label="Ausente"
                              title="Ausente"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>

                            {/* Segmento Tarde */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'tarde')}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-150 ${
                                currentStatus === 'tarde'
                                  ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.04]'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                              }`}
                              aria-label="Tarde"
                              title="Tarde"
                            >
                              <Clock className="w-5 h-5" />
                            </button>

                            {/* Segmento Justificado */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'justificado')}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-150 ${
                                currentStatus === 'justificado'
                                  ? 'bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-500/20 scale-[1.04]'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                              }`}
                              aria-label="Justificado"
                              title="Justificado"
                            >
                              <ShieldCheck className="w-5 h-5" />
                            </button>

                            {/* Botón de Comentarios / Notas */}
                            <button
                              type="button"
                              onClick={() => toggleNoteInput(student.id)}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-150 ${
                                isNotesOpen || hasNote
                                  ? 'bg-slate-900 border-slate-900 text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                              }`}
                              aria-label="Notas de asistencia"
                              title="Agregar nota"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Input de Notas Desplegable */}
                        {(isNotesOpen || hasNote) && (
                          <div className="pt-2 border-t border-slate-100 transition-all duration-200">
                            <input
                              type="text"
                              placeholder="Observaciones de inasistencia/tardanza..."
                              value={notes[student.id] || ''}
                              onChange={(e) => handleNoteChange(student.id, e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="bg-white border border-slate-100 rounded-3xl py-12 text-center">
                    <Search className="w-10 h-10 mx-auto text-slate-300" />
                    <h4 className="mt-2.5 text-xs font-bold text-slate-700">Sin resultados</h4>
                    <p className="mt-1 text-[11px] text-slate-400">No hay estudiantes que coincidan con la búsqueda.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl py-14 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="mt-3 text-xs font-bold text-slate-700">Sin estudiantes registrados</h3>
              <p className="mt-1 text-[11px] text-slate-400">No se encontraron estudiantes activos inscritos en este curso.</p>
            </div>
          )}

          {/* Botón flotante pegajoso */}
          <SubmitButton disabled={totalStudents === 0} />
        </form>
      ) : (
        /* Estado vacío: Sin clase seleccionada */
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-10 text-center shadow-sm">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-800">Módulo de Asistencias Diarias</h3>
          <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Por favor, seleccione una asignatura y sección en la parte superior para cargar la lista de alumnos e iniciar el pase de lista.
          </p>
          <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-[10px] font-bold text-slate-400 border border-slate-100">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            La asistencia preseleccionará a todos los alumnos como "Presente".
          </div>
        </div>
      )}
    </div>
  )
}
