'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useRef } from 'react'
import {
  Receipt,
  DollarSign,
  Calendar,
  PlusCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { createBillingConceptAction } from '@/actions/billing-actions'

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
          Registrando Arancel…
        </>
      ) : (
        <>
          <PlusCircle className="w-4 h-4" />
          Crear Arancel
        </>
      )}
    </button>
  )
}

export function BillingForm() {
  const [state, formAction] = useFormState(createBillingConceptAction, { error: null, success: false })
  const formRef = useRef<HTMLFormElement>(null)

  // Limpiar el formulario si la acción fue exitosa
  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset()
    }
  }, [state?.success])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="bg-emerald-600 w-1.5 h-5 rounded-full inline-block" />
          Crear Nuevo Arancel
        </h2>
        <p className="text-gray-500 text-xs mt-1">
          Completa los datos para registrar un nuevo concepto de facturación.
        </p>
      </div>

      <form action={formAction} ref={formRef} className="p-6 space-y-5">
        {/* Mensaje de Error */}
        {state?.error && (
          <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-semibold animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Mensaje de Éxito */}
        {state?.success && (
          <div className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-semibold animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>¡Arancel registrado con éxito! El listado se ha actualizado.</span>
          </div>
        )}

        {/* Nombre del Concepto */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            Nombre del Concepto
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Ej: Mensualidad Junio 2026"
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
          />
        </div>

        {/* Monto USD */}
        <div className="space-y-1.5">
          <label htmlFor="amount_usd" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Monto (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
            <input
              id="amount_usd"
              name="amount_usd"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              className="w-full pl-8 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Fecha de Vencimiento */}
        <div className="space-y-1.5">
          <label htmlFor="due_date" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Fecha de Vencimiento
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            required
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 cursor-pointer"
          />
        </div>

        {/* Botones de acción */}
        <div className="pt-2 space-y-2.5">
          <SubmitButton />
          
          <Link
            href="/admin/payments/new"
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-all duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a Registrar Pago
          </Link>
        </div>
      </form>
    </div>
  )
}
