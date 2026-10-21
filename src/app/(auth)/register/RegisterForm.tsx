'use client'

import { useFormState } from 'react-dom'
import { useState } from 'react'
import { registerSchoolAction, type RegisterState } from '@/actions/auth-actions'
import { cn } from '@/utils/cn'
import {
  Building2,
  FileText,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react'
import {
  StepIndicator,
  SubmitButton,
  InputField,
} from './_components/RegisterFormComponents'

const initialState: RegisterState = {
  error: null,
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerSchoolAction, initialState)
  const currentState = state || initialState

  const [step, setStep] = useState<1 | 2>(1)
  const [showPassword, setShowPassword] = useState(false)

  // Client-side validation for step 1 before advancing
  const handleNextStep = () => {
    const schoolInput = document.getElementById('register-schoolName') as HTMLInputElement
    const rifInput = document.getElementById('register-rif') as HTMLInputElement

    if (!schoolInput?.value?.trim() || schoolInput.value.trim().length < 3) {
      schoolInput?.focus()
      return
    }
    if (!rifInput?.value?.trim() || rifInput.value.trim().length < 5) {
      rifInput?.focus()
      return
    }

    setStep(2)
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* ── Error Banner ── */}
      {currentState.error && (
        <div
          className={cn(
            'flex items-start gap-3 rounded-xl px-4 py-3.5',
            'bg-red-50 text-sm leading-relaxed text-red-700',
            'ring-1 ring-inset ring-red-100',
            'animate-fade-in-up'
          )}
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <span>{currentState.error}</span>
        </div>
      )}

      {/* ── Step Indicator ── */}
      <StepIndicator currentStep={step} />

      {/* ── STEP 1: Datos de la Institución ── */}
      <div
        className={cn(
          'flex flex-col gap-5 transition-all duration-300 ease-out',
          step === 1
            ? 'pointer-events-auto max-h-[500px] opacity-100'
            : 'pointer-events-none absolute max-h-0 opacity-0'
        )}
      >
        <InputField
          id="register-schoolName"
          name="schoolName"
          label="Nombre del Colegio"
          placeholder="U.E. Instituto Ejemplo"
          icon={Building2}
          error={currentState.fieldErrors?.schoolName}
        />

        <InputField
          id="register-rif"
          name="rif"
          label="RIF de la Institución"
          placeholder="J-12345678-9"
          icon={FileText}
          error={currentState.fieldErrors?.rif}
        />

        {/* Next step button (client-side only) */}
        <div className="mt-1">
          <button
            type="button"
            onClick={handleNextStep}
            className={cn(
              'group relative flex w-full items-center justify-center gap-2',
              'rounded-xl px-4 py-3 text-sm font-semibold text-white',
              'bg-indigo-600 shadow-sm shadow-indigo-600/25',
              'transition-all duration-200 ease-out',
              'hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30',
              'active:scale-[0.98] active:bg-indigo-700 active:shadow-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
            )}
          >
            <span>Siguiente: Datos del Director</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* ── STEP 2: Datos del Director (Administrador) ── */}
      <div
        className={cn(
          'flex flex-col gap-5 transition-all duration-300 ease-out',
          step === 2
            ? 'pointer-events-auto max-h-[600px] opacity-100'
            : 'pointer-events-none absolute max-h-0 opacity-0'
        )}
      >
        <InputField
          id="register-directorName"
          name="directorName"
          label="Nombre Completo del Director"
          placeholder="María García López"
          autoComplete="name"
          icon={User}
          error={currentState.fieldErrors?.directorName}
        />

        <InputField
          id="register-email"
          name="email"
          label="Correo Electrónico"
          type="email"
          placeholder="director@colegio.edu.ve"
          autoComplete="email"
          icon={Mail}
          error={currentState.fieldErrors?.email}
        />

        <InputField
          id="register-password"
          name="password"
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          icon={Lock}
          error={currentState.fieldErrors?.password}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-300 transition-colors hover:text-zinc-500"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />

        {/* Back + Submit row */}
        <div className="mt-1 flex gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={cn(
              'flex items-center justify-center gap-1.5',
              'rounded-xl border border-zinc-200 bg-white px-4 py-3',
              'text-sm font-medium text-zinc-600',
              'transition-all duration-200 ease-out',
              'hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800',
              'active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Atrás</span>
          </button>
          <div className="flex-1">
            <SubmitButton />
          </div>
        </div>
      </div>
    </form>
  )
}
