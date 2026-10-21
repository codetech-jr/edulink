'use client'

import React from 'react'
import { CheckCircle2, Clock } from 'lucide-react'

interface EnrollmentSuccessViewProps {
  schoolName: string
  submittedData: {
    requestId: string
    studentName: string
  }
  gradeRequested: string
  parentPhone: string
  onReset: () => void
}

export function EnrollmentSuccessView({
  schoolName,
  submittedData,
  gradeRequested,
  parentPhone,
  onReset,
}: EnrollmentSuccessViewProps) {
  const formattedCode = `INS-${new Date().getFullYear()}-${submittedData.requestId.slice(0, 6).toUpperCase()}`

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 mb-6 shadow-xs">
        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
        Solicitud Registrada con Éxito
      </span>

      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
        ¡Gracias por postularte a {schoolName}!
      </h3>

      <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
        Hemos recibido la postulación de{' '}
        <strong className="text-slate-900">{submittedData.studentName}</strong> para el grado{' '}
        <strong className="text-slate-900">{gradeRequested}</strong>.
      </p>

      {/* Tarjeta de Código de Solicitud */}
      <div className="my-6 p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Número de Solicitud
        </p>
        <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-600 tracking-tight mt-1">
          {formattedCode}
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Guarda este número para consultar el estado de tu trámite.
        </p>
      </div>

      {/* Próximos Pasos */}
      <div className="text-left bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-5 max-w-lg mx-auto mb-8">
        <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-emerald-700" />
          ¿Qué sucede a continuación?
        </h4>
        <ol className="space-y-2.5 text-xs sm:text-sm text-emerald-950 font-medium list-decimal list-inside leading-relaxed">
          <li>
            El departamento de coordinación y admisión revisará los antecedentes pedagógicos.
          </li>
          <li>
            Nos comunicaremos vía WhatsApp o llamada telefónica al número{' '}
            <strong className="text-emerald-900">{parentPhone}</strong> para coordinar la entrevista.
          </li>
          <li>
            Recibirás las indicaciones formales para formalizar la matrícula escolar.
          </li>
        </ol>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all min-h-[44px]"
      >
        Registrar otra postulación
      </button>
    </div>
  )
}
