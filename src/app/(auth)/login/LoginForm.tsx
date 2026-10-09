'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import { loginAction, type AuthState } from '@/actions/auth-actions'
import { cn } from '@/utils/cn'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'

const initialState: AuthState = {
  error: null,
}

/* ─────────────────────────────────────────────
 * Submit Button — isolated to read useFormStatus
 * ───────────────────────────────────────────── */
function SubmitButton() {
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
          <span>Verificando credenciales…</span>
        </>
      ) : (
        <>
          <span>Iniciar Sesión</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  )
}

/* ─────────────────────────────────────────────
 * Login Form — Main export
 * ───────────────────────────────────────────── */
export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState)
  const currentState = state || initialState

  const [showPassword, setShowPassword] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* ── Error Banner — Soft corporate style ── */}
      {currentState.error && (
        <div
          className={cn(
            'flex items-start gap-3 rounded-xl px-4 py-3.5',
            'bg-red-50 text-sm leading-relaxed text-red-700',
            'ring-1 ring-inset ring-red-100',
            'animate-fade-in-up'
          )}
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <span>{currentState.error}</span>
        </div>
      )}

      {/* ── Email Field ── */}
      <div className="space-y-1.5">
        <label
          htmlFor="login-email"
          className="block text-[13px] font-medium text-zinc-700"
        >
          Correo Electrónico
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Mail
              className={cn(
                'h-4 w-4 transition-colors duration-200',
                emailFocused ? 'text-indigo-500' : 'text-zinc-300'
              )}
            />
          </div>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nombre@institución.edu"
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            className={cn(
              'input-focus-ring block w-full rounded-xl border bg-white py-2.5 pl-10 pr-4',
              'text-sm text-zinc-900 placeholder:text-zinc-300',
              'border-zinc-200',
              'focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/12'
            )}
          />
        </div>
      </div>

      {/* ── Password Field ── */}
      <div className="space-y-1.5">
        <label
          htmlFor="login-password"
          className="block text-[13px] font-medium text-zinc-700"
        >
          Contraseña
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Lock
              className={cn(
                'h-4 w-4 transition-colors duration-200',
                passwordFocused ? 'text-indigo-500' : 'text-zinc-300'
              )}
            />
          </div>
          <input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            className={cn(
              'input-focus-ring block w-full rounded-xl border bg-white py-2.5 pl-10 pr-11',
              'text-sm text-zinc-900 placeholder:text-zinc-300',
              'border-zinc-200',
              'focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/12'
            )}
          />
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
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="mt-1">
        <SubmitButton />
      </div>
    </form>
  )
}
