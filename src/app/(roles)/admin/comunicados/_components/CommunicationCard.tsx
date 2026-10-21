'use client'

import React from 'react'
import {
  AlertTriangle,
  Bell,
  Info,
  Calendar,
  Clock,
  Archive,
  ArchiveRestore,
  RefreshCw,
  Trash2,
  Users,
  Loader2,
} from 'lucide-react'
import type { CommunicationItem } from './CommunicationsList'

interface CommunicationCardProps {
  comm: CommunicationItem
  isLoading: boolean
  isPending: boolean
  onRepublish: (id: string) => void
  onArchive: (id: string) => void
  onUnarchive: (id: string) => void
  onDelete: (id: string, title: string) => void
}

function getTypeConfig(type: string) {
  switch (type) {
    case 'urgente':
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        color: 'bg-rose-50 text-rose-700 border-rose-200/80',
        iconBg: 'bg-rose-100 text-rose-600',
        label: 'Urgente',
        accentBar: 'bg-rose-500',
      }
    case 'recordatorio':
      return {
        icon: <Bell className="w-4 h-4" />,
        color: 'bg-amber-50 text-amber-700 border-amber-200/80',
        iconBg: 'bg-amber-100 text-amber-600',
        label: 'Recordatorio',
        accentBar: 'bg-amber-500',
      }
    default:
      return {
        icon: <Info className="w-4 h-4" />,
        color: 'bg-blue-50 text-blue-700 border-blue-200/80',
        iconBg: 'bg-blue-100 text-blue-600',
        label: 'Informativo',
        accentBar: 'bg-blue-500',
      }
  }
}

function getRelativeTimeBadge(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  if (diffMinutes < 1) return 'Justo ahora'
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return 'Hoy'

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`

  return new Date(dateStr).toLocaleDateString('es-VE', {
    day: 'numeric',
    month: 'short',
  })
}

export function CommunicationCard({
  comm,
  isLoading,
  isPending,
  onRepublish,
  onArchive,
  onUnarchive,
  onDelete,
}: CommunicationCardProps) {
  const config = getTypeConfig(comm.category)
  const dateObj = new Date(comm.created_at)
  const dateFormatted = dateObj.toLocaleDateString('es-VE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeFormatted = dateObj.toLocaleTimeString('es-VE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const relativeTime = getRelativeTimeBadge(comm.created_at)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden relative transition-all hover:shadow-sm">
      {/* Barra de Acento Lateral */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${config.accentBar}`} />

      <div className="pl-6 pr-5 py-4 space-y-3">
        {/* Cabecera del Comunicado con Título, Badges y Acciones */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${config.iconBg}`}
            >
              {config.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  {comm.title}
                </h3>
                {/* Categoría */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold border rounded-full shrink-0 ${config.color}`}
                >
                  {config.label}
                </span>
                {/* Audiencia */}
                {comm.target_audience && comm.target_audience !== 'todos' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-full shrink-0">
                    <Users className="w-2.5 h-2.5" />
                    {comm.target_audience}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-zinc-100 text-zinc-600 rounded-full shrink-0">
                    🌐 Toda la institución
                  </span>
                )}
                {/* Badge de Tiempo Relativo */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full shrink-0">
                  <Clock className="w-2.5 h-2.5" />
                  {relativeTime}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            {/* Botón Republicar */}
            <button
              type="button"
              disabled={isLoading || isPending}
              onClick={() => onRepublish(comm.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-lg text-xs font-bold transition-all disabled:opacity-50 min-h-[36px]"
              title="Crear una copia y republicar con fecha actual"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span className="hidden md:inline">Republicar</span>
            </button>

            {/* Botón Archivar / Desarchivar */}
            {comm.is_archived ? (
              <button
                type="button"
                disabled={isLoading || isPending}
                onClick={() => onUnarchive(comm.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all disabled:opacity-50 min-h-[36px]"
                title="Restaurar a comunicados activos"
              >
                <ArchiveRestore className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden md:inline">Desarchivar</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isLoading || isPending}
                onClick={() => onArchive(comm.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-800 border border-slate-200 hover:border-amber-200 rounded-lg text-xs font-bold transition-all disabled:opacity-50 min-h-[36px]"
                title="Archivar comunicado"
              >
                <Archive className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Archivar</span>
              </button>
            )}

            {/* Botón Eliminar */}
            <button
              type="button"
              disabled={isLoading || isPending}
              onClick={() => onDelete(comm.id, comm.title)}
              className="inline-flex items-center justify-center p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg transition-all disabled:opacity-50 min-h-[36px] min-w-[36px]"
              title="Eliminar comunicado permanentemente"
              aria-label="Eliminar comunicado permanentemente"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Mensaje */}
        <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed whitespace-pre-wrap font-normal">
          {comm.body}
        </p>

        {/* Metadatos en el pie */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {dateFormatted}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {timeFormatted}
          </span>
          {comm.is_archived && (
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
              Archivado
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
