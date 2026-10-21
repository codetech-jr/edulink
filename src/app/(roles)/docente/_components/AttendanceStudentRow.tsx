'use client'

import React from 'react'
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react'

export type AttendanceStatus = 'presente' | 'ausente' | 'tarde' | 'justificado'

interface Student {
  id: string
  full_name: string
  cedula: string | null
  list_number: number | null
}

interface AttendanceStudentRowProps {
  student: Student
  status: AttendanceStatus
  notes: string
  isNotesOpen: boolean
  onStatusChange: (id: string, status: AttendanceStatus) => void
  onToggleNotes: (id: string) => void
  onNotesChange: (id: string, notes: string) => void
}

export function AttendanceStudentRow({
  student,
  status,
  notes,
  isNotesOpen,
  onStatusChange,
  onToggleNotes,
  onNotesChange,
}: AttendanceStudentRowProps) {
  const hasNote = Boolean(notes)

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 p-4 space-y-3 shadow-sm ${
        status === 'presente'
          ? 'border-emerald-100 hover:border-emerald-200'
          : status === 'ausente'
          ? 'border-rose-100 hover:border-rose-200'
          : status === 'tarde'
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
          {/* Presente */}
          <button
            type="button"
            onClick={() => onStatusChange(student.id, 'presente')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-150 ${
              status === 'presente'
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-[1.04]'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
            aria-label="Presente"
            title="Presente"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>

          {/* Ausente */}
          <button
            type="button"
            onClick={() => onStatusChange(student.id, 'ausente')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-150 ${
              status === 'ausente'
                ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20 scale-[1.04]'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
            aria-label="Ausente"
            title="Ausente"
          >
            <XCircle className="w-5 h-5" />
          </button>

          {/* Tarde */}
          <button
            type="button"
            onClick={() => onStatusChange(student.id, 'tarde')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-150 ${
              status === 'tarde'
                ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.04]'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
            aria-label="Tarde"
            title="Tarde"
          >
            <Clock className="w-5 h-5" />
          </button>

          {/* Justificado */}
          <button
            type="button"
            onClick={() => onStatusChange(student.id, 'justificado')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-150 ${
              status === 'justificado'
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
            onClick={() => onToggleNotes(student.id)}
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
            value={notes || ''}
            onChange={(e) => onNotesChange(student.id, e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
      )}
    </div>
  )
}
