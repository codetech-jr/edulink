'use client'

import React from 'react'
import { ChevronRight, ChevronLeft, AlertCircle, Sparkles } from 'lucide-react'
import { useEnrollmentForm } from './useEnrollmentForm'
import { EnrollmentSuccessView } from './EnrollmentSuccessView'
import { EnrollmentStepIndicator } from './EnrollmentStepIndicator'
import { EnrollmentStepStudent } from './EnrollmentStepStudent'
import { EnrollmentStepParent } from './EnrollmentStepParent'
import { EnrollmentStepDocs } from './EnrollmentStepDocs'
import { EnrollmentStepReview } from './EnrollmentStepReview'

interface PublicEnrollmentFormProps {
  schoolSlug: string
  schoolName: string
}

export function PublicEnrollmentForm({ schoolSlug, schoolName }: PublicEnrollmentFormProps) {
  const {
    currentStep,
    setCurrentStep,
    isPending,
    serverError,
    submittedData,
    formData,
    documents,
    fieldErrors,
    handleChange,
    handleNext,
    handlePrev,
    handleFileChange,
    removeFile,
    handleSubmit,
    handleReset,
  } = useEnrollmentForm(schoolSlug)

  if (submittedData) {
    return (
      <EnrollmentSuccessView
        schoolName={schoolName}
        submittedData={submittedData}
        gradeRequested={formData.grade_requested}
        parentPhone={formData.parent_phone}
        onReset={handleReset}
      />
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      <EnrollmentStepIndicator
        currentStep={currentStep}
        onStepClick={(stepId) => setCurrentStep(stepId)}
      />

      <form onSubmit={handleSubmit} className="p-6 sm:p-10">
        {serverError && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs sm:text-sm font-semibold flex items-start gap-3 animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">No se pudo procesar la solicitud</p>
              <p className="text-rose-800/90 font-normal mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <EnrollmentStepStudent
            formData={formData}
            fieldErrors={fieldErrors}
            onChange={handleChange}
          />
        )}

        {currentStep === 2 && (
          <EnrollmentStepParent
            formData={formData}
            fieldErrors={fieldErrors}
            onChange={handleChange}
          />
        )}

        {currentStep === 3 && (
          <EnrollmentStepDocs
            documents={documents}
            notes={formData.notes}
            fieldErrors={fieldErrors}
            onFileChange={handleFileChange}
            onRemoveFile={removeFile}
            onNotesChange={handleChange}
          />
        )}

        {currentStep === 4 && (
          <EnrollmentStepReview
            formData={formData}
            documentsCount={documents.length}
            schoolName={schoolName}
          />
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all active:scale-[0.98] min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98] min-h-[44px]"
            >
              Continuar
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando solicitud...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enviar Solicitud de Cupo</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
