'use client'

import React from 'react'
import { User, Users, FileText, CheckCircle2 } from 'lucide-react'

export const ENROLLMENT_STEPS = [
  { id: 1, label: 'Alumno', icon: User, title: 'Datos del Aspirante' },
  { id: 2, label: 'Representante', icon: Users, title: 'Datos del Representante' },
  { id: 3, label: 'Recaudos', icon: FileText, title: 'Documentos y Notas' },
  { id: 4, label: 'Confirmar', icon: CheckCircle2, title: 'Revisión Final' },
]

interface EnrollmentStepIndicatorProps {
  currentStep: number
  onStepClick: (stepId: number) => void
}

export function EnrollmentStepIndicator({
  currentStep,
  onStepClick,
}: EnrollmentStepIndicatorProps) {
  return (
    <div className="border-b border-slate-200/90 bg-slate-50/70 px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {ENROLLMENT_STEPS.map((step, idx) => {
          const Icon = step.icon
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => {
                  if (step.id < currentStep) {
                    onStepClick(step.id)
                  }
                }}
                disabled={step.id > currentStep}
                className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-left group transition-all"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : isCurrent
                      ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-600 ring-offset-2'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="text-center sm:text-left">
                  <span
                    className={`text-[11px] sm:text-xs font-bold block ${
                      isCurrent
                        ? 'text-slate-900'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </button>

              {idx < ENROLLMENT_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                    currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
