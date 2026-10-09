'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useRef } from 'react'
import {
  Megaphone,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Bell,
  Info,
  AlertTriangle,
  Send,
} from 'lucide-react'
import { createAnnouncementAction } from '@/actions/communication-actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Publicando Comunicado…
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          Publicar Comunicado
        </>
      )}
    </button>
  )
}

export function AnnouncementForm() {
  const [state, formAction] = useFormState(createAnnouncementAction, { error: null, success: false })
  const formRef = useRef<HTMLFormElement>(null)

  // Limpiar el formulario si el comunicado se guardó con éxito
  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset()
    }
  }, [state?.success])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="bg-emerald-600 w-1.5 h-5 rounded-full inline-block" />
          Nuevo Comunicado Oficial
        </h2>
        <p className="text-gray-500 text-xs mt-1 font-medium">
          Publica un anuncio en tiempo real para todos los representantes y estudiantes de la institución.
        </p>
      </div>

      <form action={formAction} ref={formRef} className="p-6 space-y-5">
        {/* Mensaje de Error */}
        {state?.error && (
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-semibold animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Mensaje de Éxito */}
        {state?.success && (
          <div className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-semibold animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>¡Comunicado publicado con éxito! El feed y los portales se han actualizado.</span>
          </div>
        )}

        {/* Título del Comunicado */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Megaphone className="w-3.5 h-3.5 text-emerald-600" />
            Título del Comunicado
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Ej: Reunión General de Representantes"
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
          />
        </div>

        {/* Categoría */}
        <div className="space-y-1.5">
          <label htmlFor="category" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Bell className="w-3.5 h-3.5 text-emerald-600" />
            Categoría del Aviso
          </label>
          <div className="relative">
            <select
              id="category"
              name="category"
              required
              defaultValue="informativo"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 cursor-pointer appearance-none"
            >
              <option value="urgente">🚨 Urgente (Borde Rojo)</option>
              <option value="informativo">ℹ️ Informativo (Borde Azul)</option>
              <option value="recordatorio">📅 Recordatorio (Borde Amarillo)</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs font-bold">
              ▼
            </div>
          </div>
        </div>

        {/* Mensaje / Cuerpo */}
        <div className="space-y-1.5">
          <label htmlFor="body" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            Mensaje / Detalles
          </label>
          <textarea
            id="body"
            name="body"
            required
            rows={5}
            placeholder="Escribe el cuerpo del mensaje aquí..."
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 resize-y"
          />
        </div>

        {/* Botón de Envío */}
        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}
