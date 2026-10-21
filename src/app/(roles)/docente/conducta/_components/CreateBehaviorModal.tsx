'use client'

import { useState, useTransition } from 'react'
import {
  X,
  Sparkles,
  Info,
  AlertTriangle,
  Award,
  Calendar,
  User,
  CheckCircle2,
} from 'lucide-react'
import { createBehaviorRecordAction } from '@/actions/behavior-actions'
import { BehaviorType } from '@/lib/schemas/behavior.schema'

interface StudentOption {
  id: string
  full_name: string
  course_name?: string
  cedula?: string
}

interface CreateBehaviorModalProps {
  isOpen: boolean
  onClose: () => void
  students: StudentOption[]
  defaultStudentId?: string
}

export function CreateBehaviorModal({
  isOpen,
  onClose,
  students,
  defaultStudentId,
}: CreateBehaviorModalProps) {
  const [studentId, setStudentId] = useState(defaultStudentId || students[0]?.id || '')
  const [type, setType] = useState<BehaviorType>('merito')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [incidentDate, setIncidentDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [requiresSignature, setRequiresSignature] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!studentId) {
      setErrorMsg('Debes seleccionar un estudiante.')
      return
    }

    if (!title.trim() || title.length < 3) {
      setErrorMsg('El título debe tener al menos 3 caracteres.')
      return
    }

    if (!description.trim() || description.length < 5) {
      setErrorMsg('La descripción debe tener al menos 5 caracteres.')
      return
    }

    startTransition(async () => {
      const res = await createBehaviorRecordAction({
        student_id: studentId,
        type,
        title: title.trim(),
        description: description.trim(),
        incident_date: incidentDate,
        requires_parent_signature: requiresSignature,
      })

      if (res.success) {
        setTitle('')
        setDescription('')
        setRequiresSignature(false)
        onClose()
      } else {
        setErrorMsg(res.error || 'Error al guardar la novedad.')
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-behavior-title"
    >
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 id="modal-behavior-title" className="text-sm font-semibold text-zinc-900">
                Registrar Novedad o Conducta
              </h3>
              <p className="text-[11px] text-zinc-400">
                Observación formativa, mérito o incidencia para el estudiante.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Student Select */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Estudiante
            </label>
            <div className="relative">
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} {s.course_name ? `(${s.course_name})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type Selector Pills */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Tipo de Registro
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => setType('merito')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  type === 'merito'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-semibold ring-2 ring-emerald-500/20'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px]">Mérito</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('observacion')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  type === 'observacion'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 font-semibold ring-2 ring-amber-500/20'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[11px]">Observación</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('falta_leve')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  type === 'falta_leve'
                    ? 'border-orange-500 bg-orange-50/70 text-orange-900 font-semibold ring-2 ring-orange-500/20'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-[11px]">Falta Leve</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('falta_grave')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  type === 'falta_grave'
                    ? 'border-rose-500 bg-rose-50/70 text-rose-900 font-semibold ring-2 ring-rose-500/20'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-[11px]">Falta Grave</span>
                </div>
              </button>
            </div>
          </div>

          {/* Title & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Motivo / Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Reconocimiento por participación"
                required
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Descripción / Observaciones
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalla los hechos ocurridos, acuerdos pedagógicos o felicitaciones..."
              required
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Signature Required Toggle */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-100 bg-zinc-50/70">
            <input
              type="checkbox"
              id="req-signature"
              checked={requiresSignature}
              onChange={(e) => setRequiresSignature(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 border-zinc-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="req-signature" className="text-xs text-zinc-700 select-none cursor-pointer">
              <span className="font-semibold block">Requiere firma del representante</span>
              <span className="text-[10px] text-zinc-400">
                El representante deberá pulsar &quot;Marcar como enterado(a)&quot; en su portal.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Guardando...' : 'Registrar Novedad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
