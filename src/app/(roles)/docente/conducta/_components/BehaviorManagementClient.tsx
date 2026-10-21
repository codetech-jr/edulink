'use client'

import { useState, useTransition } from 'react'
import {
  Award,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react'
import { CreateBehaviorModal } from './CreateBehaviorModal'
import { deleteBehaviorRecordAction } from '@/actions/behavior-actions'

interface BehaviorRecord {
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
  students?: {
    full_name?: string
    cedula?: string
    courses?: {
      name?: string
      grade_level?: string
      section?: string
    } | null
  } | null
}

interface StudentOption {
  id: string
  full_name: string
  course_name?: string
  cedula?: string
}

interface BehaviorManagementClientProps {
  initialRecords: BehaviorRecord[]
  students: StudentOption[]
  currentUserId: string
  currentUserRole: string
}

const TYPE_CONFIG = {
  merito: {
    label: 'Mérito',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    icon: Award,
  },
  observacion: {
    label: 'Observación',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    icon: Info,
  },
  falta_leve: {
    label: 'Falta Leve',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200/80',
    icon: AlertTriangle,
  },
  falta_grave: {
    label: 'Falta Grave',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
    icon: AlertTriangle,
  },
}

export function BehaviorManagementClient({
  initialRecords,
  students,
  currentUserId,
  currentUserRole,
}: BehaviorManagementClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const filteredRecords = initialRecords.filter((record) => {
    if (filterType !== 'all' && record.type !== filterType) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const studentName = record.students?.full_name?.toLowerCase() || ''
      const title = record.title.toLowerCase()
      const desc = record.description.toLowerCase()
      return studentName.includes(q) || title.includes(q) || desc.includes(q)
    }
    return true
  })

  const handleDelete = (recordId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este reporte de conducta?')) {
      return
    }

    startTransition(async () => {
      await deleteBehaviorRecordAction(recordId)
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
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Conducta y Seguimiento Disciplinario
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Registro formativo de méritos, reconocimientos y novedades disciplinarias de los
            alumnos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Novedad</span>
        </button>
      </div>

      {/* Controls / Filter Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por alumno, motivo o descripción..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
              }`}
            >
              Todos ({initialRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('merito')}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                filterType === 'merito'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70'
              }`}
            >
              Méritos
            </button>
            <button
              type="button"
              onClick={() => setFilterType('observacion')}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                filterType === 'observacion'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100/70'
              }`}
            >
              Observaciones
            </button>
            <button
              type="button"
              onClick={() => setFilterType('falta_leve')}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                filterType === 'falta_leve'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100/70'
              }`}
            >
              Faltas Leves
            </button>
            <button
              type="button"
              onClick={() => setFilterType('falta_grave')}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                filterType === 'falta_grave'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100/70'
              }`}
            >
              Faltas Graves
            </button>
          </div>
        </div>
      </div>

      {/* Records Feed */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-zinc-200/80 p-10 text-center shadow-xs">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-semibold text-zinc-900">
              No hay novedades registradas
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
              Presiona el botón &quot;Registrar Novedad&quot; para crear una nueva observación o
              reconocimiento.
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const cfg = TYPE_CONFIG[record.type] || TYPE_CONFIG.observacion
            const Icon = cfg.icon
            const student = record.students
            const courseName = student?.courses?.name
              ? `${student.courses.name} (${student.courses.grade_level || ''} - ${student.courses.section || ''})`
              : 'Curso no asignado'

            const canDelete =
              currentUserRole === 'admin' ||
              currentUserRole === 'coordinador' ||
              record.created_by === currentUserId

            return (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs transition-all hover:border-zinc-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${cfg.badgeClass}`}
                    >
                      <Icon className="w-4.5 h-4.5" />
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
                      <h3 className="text-sm font-semibold text-zinc-900 mt-1">
                        {record.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 font-medium">
                        <span className="text-zinc-900 font-semibold">
                          {student?.full_name || 'Estudiante'}
                        </span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-zinc-400">{courseName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Status */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {record.requires_parent_signature && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg border ${
                          record.parent_acknowledged_at
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {record.parent_acknowledged_at ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Firmado por representante
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pendiente de firma
                          </>
                        )}
                      </span>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(record.id)}
                        disabled={isPending}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-3 pt-3 border-t border-zinc-100 text-xs text-zinc-600 bg-zinc-50/70 p-3 rounded-xl border border-zinc-100">
                  <p className="leading-relaxed">{record.description}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal */}
      <CreateBehaviorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        students={students}
      />
    </div>
  )
}
