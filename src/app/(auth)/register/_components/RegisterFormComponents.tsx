'use client'

import React, { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { cn } from '@/utils/cn'
import {
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

export function StepIndicator({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      {/* Step 1 pill */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
            currentStep >= 1
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-zinc-100 text-zinc-400'
          )}
        >
          {currentStep > 1 ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            '1'
          )}
        </div>
        <span
          className={cn(
            'text-[13px] font-medium transition-colors duration-300',
            currentStep >= 1 ? 'text-zinc-900' : 'text-zinc-400'
          )}
        >
          Institución
        </span>
      </div>

      {/* Connector */}
      <div className="flex-1">
        <div className="h-px w-full bg-zinc-200">
          <div
            className={cn(
              'h-px bg-indigo-600 transition-all duration-500 ease-out',
              currentStep >= 2 ? 'w-full' : 'w-0'
            )}
          />
        </div>
      </div>

      {/* Step 2 pill */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
            currentStep >= 2
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-zinc-100 text-zinc-400'
          )}
        >
          2
        </div>
        <span
          className={cn(
            'text-[13px] font-medium transition-colors duration-300',
            currentStep >= 2 ? 'text-zinc-900' : 'text-zinc-400'
          )}
        >
          Administrador
        </span>
      </div>
    </div>
  )
}

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'group relative flex w-full items-center justify-center gap-2',
        'rounded-xl px-4 py-3 text-sm font-semibold text-white',
        'bg-indigo-600 shadow-sm shadow-indigo-600/25',
        'transition-all duration-200 ease-out',
        'hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30',
        'active:scale-[0.98] active:bg-indigo-700 active:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none'
      )}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Registrando tu colegio…</span>
        </>
      ) : (
        <>
          <span>Crear Cuenta e Institución</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  )
}

export function InputField({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  required = true,
  autoComplete,
  icon: Icon,
  error,
  rightElement,
}: {
  id: string
  name: string
  label: string
  type?: string
  placeholder: string
  required?: boolean
  autoComplete?: string
  icon: React.ComponentType<{ className?: string }>
  error?: string
  rightElement?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-zinc-700"
      >
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Icon
            className={cn(
              'h-4 w-4 transition-colors duration-200',
              error
                ? 'text-red-400'
                : focused
                  ? 'text-indigo-500'
                  : 'text-zinc-300'
            )}
          />
        </div>
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'block w-full rounded-xl border bg-white py-2.5 pl-10',
            rightElement ? 'pr-11' : 'pr-4',
            'text-sm text-zinc-900 placeholder:text-zinc-300',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-500/12'
              : 'border-zinc-200 focus:border-indigo-400 focus:ring-indigo-500/12',
            'focus:outline-none focus:ring-2'
          )}
        />
        {rightElement}
      </div>
      {error && (
        <p className="text-[12px] text-red-500 animate-fade-in-up">{error}</p>
      )}
    </div>
  )
}
