'use client'

import React from 'react'
import { CheckCircle2, GraduationCap } from 'lucide-react'

interface EnrollmentStepReviewProps {
  formData: {
    student_name: string
    student_cedula: string
    student_birth_date: string
    grade_requested: string
    parent_name: string
    parent_cedula: string
    parent_phone: string
    parent_email: string
    notes: string
  }
  documentsCount: number
  schoolName: string
}

export function EnrollmentStepReview({
  formData,
  documentsCount,
  schoolName,
}: EnrollmentStepReviewProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Resumen de tu Solicitud
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Por favor verifica que todos los datos sean correctos antes de enviar la postulación.
        </p>
      </div>

      {/* Ficha Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 text-xs sm:text-sm">
        <div className="p-3 bg-white rounded-xl border border-slate-200/70">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aspirante</p>
          <p className="font-bold text-slate-900 text-base mt-0.5">{formData.student_name}</p>
          <p className="text-slate-600 mt-1">
            Cédula: <span className="font-medium">{formData.student_cedula || 'No registrada'}</span>
          </p>
          <p className="text-slate-600">
            Nacimiento:{' '}
            <span className="font-medium">
              {formData.student_birth_date ? formData.student_birth_date : 'No indicada'}
            </span>
          </p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/70">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nivel Solicitado</p>
          <div className="flex items-center gap-1.5 mt-1 text-emerald-700 font-bold text-base">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <span>{formData.grade_requested}</span>
          </div>
          <p className="text-slate-500 text-xs mt-1">Colegio: {schoolName}</p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/70 sm:col-span-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Representante</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
            <div>
              <span className="text-slate-500 block text-xs">Nombre:</span>
              <span className="font-bold text-slate-900">{formData.parent_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Cédula:</span>
              <span className="font-bold text-slate-900">{formData.parent_cedula}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">WhatsApp / Teléfono:</span>
              <span className="font-bold text-emerald-700">{formData.parent_phone}</span>
            </div>
          </div>
          {formData.parent_email && (
            <p className="text-slate-600 mt-2 text-xs">
              Correo: <span className="font-medium text-slate-900">{formData.parent_email}</span>
            </p>
          )}
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/70 sm:col-span-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recaudos y Notas</p>
          <p className="text-slate-700 mt-1">
            Documentos adjuntos:{' '}
            <strong className="text-slate-900">{documentsCount} archivo(s)</strong>
          </p>
          {formData.notes && (
            <p className="text-slate-600 mt-1 italic text-xs">"{formData.notes}"</p>
          )}
        </div>
      </div>
    </div>
  )
}
