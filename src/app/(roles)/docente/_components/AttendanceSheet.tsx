'use client'

import React, { useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import {
  Search,
  Save,
  Loader2,
  AlertCircle,
  X,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react'
import { saveDailyAttendanceAction } from '@/actions/teacher-actions'
import { AttendanceHeaderControls } from './AttendanceHeaderControls'
import { AttendanceStudentRow, type AttendanceStatus } from './AttendanceStudentRow'

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
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(() => {
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

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId)
  
  const students = React.useMemo(() => {
    if (!selectedSubject?.courses?.students) return []
    return selectedSubject.courses.students
      .filter((s) => s.is_active)
      .sort((a, b) => (a.list_number || 0) - (b.list_number || 0))
  }, [selectedSubject])

  const filteredStudents = React.useMemo(() => {
    if (!searchTerm) return students
    return students.filter((s) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [students, searchTerm])

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

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleNoteChange = (studentId: string, value: string) => {
    setNotes((prev) => ({ ...prev, [studentId]: value }))
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
    } catch {
      setNotification({
        type: 'error',
        message: 'Error de red o de servidor al intentar guardar la asistencia.'
      })
    }
  }

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
          role="status"
          aria-live="polite"
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
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Panel Superior: Selección de Clase e Info */}
      <AttendanceHeaderControls
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        totalStudents={totalStudents}
        presentCount={presentCount}
        absentCount={absentCount}
        tardyCount={tardyCount}
        justifiedCount={justifiedCount}
      />

      {/* Lista de Estudiantes */}
      {selectedSubjectId ? (
        <form action={handleFormSubmit} className="space-y-4">
          {totalStudents > 0 ? (
            <div className="space-y-3.5">
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

              <div className="space-y-2.5">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <AttendanceStudentRow
                      key={student.id}
                      student={student}
                      status={attendance[student.id] || 'presente'}
                      notes={notes[student.id] || ''}
                      isNotesOpen={openNotesId === student.id}
                      onStatusChange={handleStatusChange}
                      onToggleNotes={toggleNoteInput}
                      onNotesChange={handleNoteChange}
                    />
                  ))
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

          <SubmitButton disabled={totalStudents === 0} />
        </form>
      ) : (
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
