'use client'

import { useState, useTransition } from 'react'
import {
  Award,
  AlertTriangle,
  Info,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  UserCheck,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { acknowledgeBehaviorRecordAction } from '@/actions/behavior-actions'

export interface BehaviorRecord {
  id: string
  student_id: string
  school_id: string
  created_by: string
  type: 'merito' | 'observacion' | 'falta_leve' | 'falta_grave'
  title: string
  description: string
  incident_date: string
  requires_parent_signature: boolean
  parent_acknowledged_at: string | null
  created_at: string
  profiles?: {
    full_name?: string
    role?: string
  } | null
}

interface StudentBehaviorCardProps {
  studentName: string
  records: BehaviorRecord[]
}

const TYPE_CONFIG = {
  merito: {
    label: 'Mérito / Reconocimiento',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    icon: Sparkles,
    iconColor: 'text-emerald-500',
    dotColor: 'bg-emerald-500',
  },
  observacion: {
    label: 'Observación Pedagógica',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    icon: Info,
    iconColor: 'text-amber-500',
    dotColor: 'bg-amber-500',
  },
  falta_leve: {
    label: 'Falta Leve',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200/80',
    icon: AlertTriangle,
    iconColor: 'text-orange-500',
    dotColor: 'bg-orange-500',
  },
  falta_grave: {
    label: 'Falta Grave',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
    icon: AlertTriangle,
    iconColor: 'text-rose-500',
    dotColor: 'bg-rose-500',
  },
}

export function StudentBehaviorCard({ studentName, records = [] }: StudentBehaviorCardProps) {
  const [filter, setFilter] = useState<'todos' | 'merito' | 'observacion' | 'faltas'>('todos')
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ id: string; message: string } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const meritsCount = records.filter((r) => r.type === 'merito').length
  const observationsCount = records.filter((r) => r.type === 'observacion').length
  const faultsCount = records.filter((r) => r.type === 'falta_leve' || r.type === 'falta_grave').length
  const pendingSignaturesCount = records.filter(
    (r) => r.requires_parent_signature && !r.parent_acknowledged_at
  ).length

  const filteredRecords = records.filter((r) => {
    if (filter === 'todos') return true
    if (filter === 'merito') return r.type === 'merito'
    if (filter === 'observacion') return r.type === 'observacion'
    if (filter === 'faltas') return r.type === 'falta_leve' || r.type === 'falta_grave'
    return true
  })

  const handleAcknowledge = (recordId: string) => {
    startTransition(async () => {
      const res = await acknowledgeBehaviorRecordAction(recordId)
      if (res.success) {
        setFeedback({ id: recordId, message: '✓ Notificación firmada exitosamente.' })
      } else {
        setFeedback({ id: recordId, message: res.error || 'Error al firmar la notificación.' })
      }
    })
  }

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        return date.toLocaleDateString('es-VE', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      }
      return dateStr
    } catch {
      return dateStr
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-zinc-800">
                  Conducta y Seguimiento Disciplinario
                </h3>
                {pendingSignaturesCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full animate-pulse">
                    <Clock className="w-3 h-3" />
                    {pendingSignaturesCount} por firmar
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Historial de reconocimientos, notas pedagógicas y novedades de {studentName}.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-lg"
              title="Méritos y felicitaciones"
            >
              <Award className="w-3 h-3 text-emerald-600" />
              {meritsCount}
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 rounded-lg"
              title="Observaciones docentes"
            >
              <Info className="w-3 h-3 text-amber-600" />
              {observationsCount}
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 rounded-lg"
              title="Llamados de atención o faltas"
            >
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              {faultsCount}
            </span>
          </div>
        </div>

        {/* Filters */}
        {records.length > 0 && (
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-zinc-100 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilter('todos')}
              className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                filter === 'todos'
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
              }`}
            >
              Todos ({records.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('merito')}
              className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                filter === 'merito'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70'
              }`}
            >
              Méritos ({meritsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('observacion')}
              className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                filter === 'observacion'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100/70'
              }`}
            >
              Observaciones ({observationsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('faltas')}
              className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                filter === 'faltas'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100/70'
              }`}
            >
              Faltas ({faultsCount})
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {records.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-zinc-200/80 bg-zinc-50/50">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-semibold text-zinc-800">Conducta Ejemplar</h4>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
              No hay llamados de atención ni faltas registradas para {studentName} en el período
              vigente.
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-6 px-4 text-zinc-400 text-xs">
            No hay registros para el filtro seleccionado.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => {
              const cfg = TYPE_CONFIG[record.type] || TYPE_CONFIG.observacion
              const Icon = cfg.icon
              const isExpanded = expandedId === record.id
              const isAcknowledged = !!record.parent_acknowledged_at
              const teacherName = record.profiles?.full_name || 'Personal Docente'

              return (
                <div
                  key={record.id}
                  className="rounded-xl border border-zinc-200/80 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.badgeClass}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-full border ${cfg.badgeClass}`}
                          >
                            {cfg.label}
                          </span>
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3 text-zinc-300" />
                            {formatDate(record.incident_date)}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-zinc-900 mt-1 truncate">
                          {record.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <UserCheck className="w-3 h-3 text-zinc-300" />
                          <span>Registrado por: {teacherName}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : record.id)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
                      aria-label={isExpanded ? 'Contraer detalle' : 'Ver detalle completo'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Body description */}
                  <div className="mt-3 pt-3 border-t border-zinc-100 text-[11px] text-zinc-600 leading-relaxed bg-zinc-50/60 p-3 rounded-lg border border-zinc-100/80">
                    <p className={isExpanded ? '' : 'line-clamp-2'}>{record.description}</p>
                  </div>

                  {/* Signature / Acknowledgment Box */}
                  {record.requires_parent_signature && (
                    <div className="mt-3 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {isAcknowledged ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-lg text-[10px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Notificación firmada por el representante</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-1.5 text-amber-700 text-[10px] font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <span>Requiere confirmación de lectura del representante.</span>
                          </div>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleAcknowledge(record.id)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer flex-shrink-0"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{isPending ? 'Firmando...' : 'Marcar como Enterado(a)'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {feedback?.id === record.id && (
                    <p className="mt-2 text-[10px] text-indigo-600 font-medium">
                      {feedback.message}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
