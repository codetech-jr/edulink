'use client'

import React from 'react'
import { Eye, EyeOff, FileDown, Loader2, Save } from 'lucide-react'

interface GradingActionsBarProps {
  isPublished: boolean
  isPublishing: boolean
  isSaving: boolean
  isResetting: boolean
  isDownloadingZip: boolean
  zipProgress: string | null
  studentsCount: number
  onPublishToggle: () => void
  onDownloadZip: () => void
  onSaveGrades: () => void
}

export function GradingActionsBar({
  isPublished,
  isPublishing,
  isSaving,
  isResetting,
  isDownloadingZip,
  zipProgress,
  studentsCount,
  onPublishToggle,
  onDownloadZip,
  onSaveGrades,
}: GradingActionsBarProps) {
  const isAnyActionPending = isSaving || isPublishing || isResetting || isDownloadingZip

  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4 border-t border-slate-50">
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Publicar / Ocultar */}
        <button
          type="button"
          onClick={onPublishToggle}
          disabled={isAnyActionPending}
          className={`flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.98] border min-h-[44px] ${
            isPublished
              ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100'
          }`}
        >
          {isPublishing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isPublished ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              Ocultar Notas del Lapso
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              Publicar Notas del Lapso
            </>
          )}
        </button>

        {/* Descargar Boletines ZIP */}
        <button
          type="button"
          onClick={onDownloadZip}
          disabled={isDownloadingZip || studentsCount === 0}
          className="flex items-center justify-center gap-1.5 px-5 py-3 bg-white hover:bg-indigo-50/50 text-indigo-700 font-extrabold text-xs uppercase tracking-wider rounded-2xl border border-indigo-200 shadow-xs active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
        >
          {isDownloadingZip ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{zipProgress || 'Generando ZIP...'}</span>
            </>
          ) : (
            <>
              <FileDown className="w-3.5 h-3.5" />
              Descargar Boletines (ZIP)
            </>
          )}
        </button>
      </div>

      {/* Guardar Notas */}
      <button
        type="button"
        onClick={onSaveGrades}
        disabled={isAnyActionPending}
        className="flex items-center justify-center gap-1.5 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all min-h-[44px]"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Guardando Calificaciones...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Guardar Calificaciones
          </>
        )}
      </button>
    </div>
  )
}
