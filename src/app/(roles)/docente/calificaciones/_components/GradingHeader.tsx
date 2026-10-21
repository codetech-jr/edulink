'use client'

import React from 'react'
import {
  BookOpen,
  Calendar,
  FileDown,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react'
import { PrintPlanButton } from '@/components/PrintPlanButton'
import type { Evaluation, Student } from './GradingTable'

interface GradingHeaderProps {
  subjectName: string
  termName: string
  courseName: string
  teacherName: string
  evaluations: Evaluation[]
  students: Student[]
  isPublished: boolean
  isDownloadingZip: boolean
  zipProgress: string | null
  isResetting: boolean
  isSaving: boolean
  onDownloadZip: () => void
  onResetPlan: () => void
}

export function GradingHeader({
  subjectName,
  termName,
  courseName,
  teacherName,
  evaluations,
  students,
  isPublished,
  isDownloadingZip,
  zipProgress,
  isResetting,
  isSaving,
  onDownloadZip,
  onResetPlan,
}: GradingHeaderProps) {
  return (
    <>
      {/* Cabecera del Cuaderno */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-extrabold uppercase tracking-widest">{subjectName}</span>
          </div>
          <h2 className="text-base font-black text-slate-900">Planilla Escolar de Calificaciones</h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{termName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          <button
            type="button"
            onClick={onDownloadZip}
            disabled={isDownloadingZip || students.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 min-h-[36px]"
            title="Descargar todos los boletines de los estudiantes en un archivo ZIP"
          >
            {isDownloadingZip ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="truncate max-w-[150px]">{zipProgress || 'Generando ZIP...'}</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" />
                Descargar Boletines (ZIP)
              </>
            )}
          </button>

          <PrintPlanButton
            termName={termName}
            teacherName={teacherName}
            subjectName={subjectName}
            courseName={courseName}
            evaluations={evaluations}
          />

          {isPublished ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5" />
              Publicado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider">
              <EyeOff className="w-3.5 h-3.5" />
              Borrador
            </span>
          )}
        </div>
      </div>

      {/* Plan de Evaluación Resumen */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Plan de Evaluación Vigente
          </h3>
          <button
            onClick={onResetPlan}
            disabled={isResetting || isSaving}
            className="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors uppercase tracking-wider flex items-center gap-1 disabled:opacity-50 min-h-[36px]"
          >
            {isResetting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Reconfigurar Plan
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {evaluations.map((ev) => (
            <div key={ev.id} className="bg-white border border-slate-200/60 rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-2">
              <span className="text-slate-800 font-bold">{ev.name}</span>
              <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md text-[10px] font-black">{ev.weight}%</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
