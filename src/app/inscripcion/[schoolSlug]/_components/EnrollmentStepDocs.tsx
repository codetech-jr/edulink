'use client'

import React from 'react'
import { FileText, Upload, FileCheck, X, AlertCircle } from 'lucide-react'

interface EnrollmentStepDocsProps {
  documents: File[]
  notes: string
  fieldErrors: Record<string, string>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
  onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export function EnrollmentStepDocs({
  documents,
  notes,
  fieldErrors,
  onFileChange,
  onRemoveFile,
  onNotesChange,
}: EnrollmentStepDocsProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          Documentos Probatorios y Observaciones
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Puedes adjuntar hasta 3 recaudos en formato PDF o imagen (máx. 5 MB cada uno).
        </p>
      </div>

      {/* Zona de subida de archivos */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Recaudos Opcionales (Partida de Nacimiento, C.I., Boleta Anterior)
        </label>

        <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer relative">
          <input
            type="file"
            multiple
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={onFileChange}
            disabled={documents.length >= 3}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 shadow-2xs text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-900">
            {documents.length >= 3
              ? 'Límite máximo de 3 documentos alcanzado'
              : 'Haz clic o arrastra tus documentos aquí'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Formatos admitidos: PDF, JPG, PNG o WebP (hasta 5 MB por archivo)
          </p>
        </div>

        {fieldErrors.documents && (
          <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {fieldErrors.documents}
          </p>
        )}

        {/* Lista de archivos seleccionados */}
        {documents.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Documentos listos para subir ({documents.length}/3):
            </p>
            {documents.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs font-medium"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="truncate text-slate-900 font-semibold">{file.name}</span>
                  <span className="text-slate-400 flex-shrink-0">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2"
                  title="Eliminar archivo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notas y Observaciones */}
      <div>
        <label
          htmlFor="notes"
          className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2"
        >
          Observaciones o Condiciones Médicas / Especiales <span className="text-slate-400 font-normal lowercase">(opcional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          value={notes}
          onChange={onNotesChange}
          placeholder="Indica cualquier antecedente médico, condición alérgica, talento deportivo o información relevante para el equipo docente..."
          className="w-full px-4 py-3 bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>
    </div>
  )
}
