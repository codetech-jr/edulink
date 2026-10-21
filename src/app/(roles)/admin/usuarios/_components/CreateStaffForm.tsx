'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createStaffMemberAction, type StaffActionState } from '@/actions/staff-actions'
import {
  UserPlus,
  Mail,
  KeyRound,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

const initialState: StaffActionState = { error: null }

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          Creando cuenta…
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" strokeWidth={2} />
          Crear cuenta
        </>
      )}
    </button>
  )
}

export function CreateStaffForm({ schoolId }: { schoolId: string }) {
  const [state, formAction] = useFormState(
    createStaffMemberAction,
    initialState
  )

  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white p-5">
      {/* Success banner */}
      {state.success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-[13px] font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
          Cuenta creada exitosamente.
        </div>
      )}

      {/* Error banner */}
      {state.error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] font-medium text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Nombre completo */}
        <div className="space-y-1.5">
          <label
            htmlFor="staff-full-name"
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-500"
          >
            <User className="h-3.5 w-3.5" strokeWidth={1.8} />
            Nombre completo
          </label>
          <input
            id="staff-full-name"
            name="full_name"
            type="text"
            required
            minLength={3}
            placeholder="Ej: María González"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-[13.5px] text-zinc-800 placeholder:text-zinc-300 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
          />
        </div>

        {/* Correo */}
        <div className="space-y-1.5">
          <label
            htmlFor="staff-email"
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-500"
          >
            <Mail className="h-3.5 w-3.5" strokeWidth={1.8} />
            Correo electrónico
          </label>
          <input
            id="staff-email"
            name="email"
            type="email"
            required
            placeholder="coordinador@colegio.com"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-[13.5px] text-zinc-800 placeholder:text-zinc-300 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
          />
        </div>

        {/* Contraseña */}
        <div className="space-y-1.5">
          <label
            htmlFor="staff-password"
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-500"
          >
            <KeyRound className="h-3.5 w-3.5" strokeWidth={1.8} />
            Contraseña temporal
          </label>
          <input
            id="staff-password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-[13.5px] text-zinc-800 placeholder:text-zinc-300 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
          />
          <p className="text-[11px] text-zinc-400">
            El usuario puede cambiarla después de iniciar sesión.
          </p>
        </div>

        {/* Rol */}
        <div className="space-y-1.5">
          <label
            htmlFor="staff-role"
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-500"
          >
            <UserPlus className="h-3.5 w-3.5" strokeWidth={1.8} />
            Rol a asignar
          </label>
          <select
            id="staff-role"
            name="role"
            required
            defaultValue=""
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-[13.5px] text-zinc-800 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
          >
            <option value="" disabled>
              Selecciona un rol…
            </option>
            <option value="coordinador">
              Coordinador(a) — Acceso administrativo operativo
            </option>
            <option value="docente">
              Docente — Solo calificaciones y asistencia
            </option>
          </select>
          <p className="text-[11px] text-zinc-400">
            Los coordinadores comparten el panel admin contigo, pero no pueden gestionar usuarios ni configuración del colegio.
          </p>
        </div>

        {/* Submit */}
        <SubmitButton />
      </form>
    </div>
  )
}

