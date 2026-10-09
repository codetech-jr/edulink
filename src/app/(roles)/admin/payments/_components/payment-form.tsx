'use client'

import { useFormState, useFormStatus } from 'react-dom'
import {
  CreditCard,
  DollarSign,
  Hash,
  Users,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Receipt,
} from 'lucide-react'
import Link from 'next/link'
import { createPaymentAction } from '@/actions/payment-actions'

interface Student {
  id: string
  full_name: string
}

interface BillingConcept {
  id: string
  name: string
  amount_usd: number
}

interface PaymentFormProps {
  students: Student[]
  billingConcepts: BillingConcept[]
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-emerald-600 text-white rounded-xl font-bold text-base hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-100"
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Registrando pago…
        </>
      ) : (
        <>
          <Receipt className="w-5 h-5" />
          Registrar Pago
        </>
      )}
    </button>
  )
}

export function PaymentForm({ students, billingConcepts }: PaymentFormProps) {
  const [state, formAction] = useFormState(createPaymentAction, { error: null })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="bg-emerald-600 w-2 h-8 rounded-full inline-block" />
            Registrar Pago
          </h1>
          <p className="text-gray-500 mt-1.5 font-medium">
            Ingresa los datos de la transacción para registrar el pago manualmente.
          </p>
        </div>
        <Link
          href="/admin/payments"
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>

      {/* Formulario */}
      <form action={formAction} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 lg:p-8 space-y-6">

          {/* Error Global */}
          {state?.error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Estudiante */}
          <div className="space-y-2">
            <label htmlFor="student_id" className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <Users className="w-4 h-4 text-emerald-600" />
              Estudiante
            </label>
            <select
              id="student_id"
              name="student_id"
              required
              defaultValue=""
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>
                Seleccionar estudiante…
              </option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name}
                </option>
              ))}
            </select>
            {students.length === 0 && (
              <p className="text-xs text-amber-600 font-medium">
                No hay estudiantes activos registrados.{' '}
                <Link href="/admin/students/new" className="underline hover:text-amber-700">
                  Inscribir uno primero
                </Link>
              </p>
            )}
          </div>

          {/* Concepto de Facturación */}
          <div className="space-y-2">
            <label htmlFor="billing_concept_id" className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <Receipt className="w-4 h-4 text-emerald-600" />
              Concepto de Facturación
            </label>
            <select
              id="billing_concept_id"
              name="billing_concept_id"
              required
              defaultValue=""
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>
                Seleccionar concepto…
              </option>
              {billingConcepts.map((concept) => (
                <option key={concept.id} value={concept.id}>
                  {concept.name} — ${parseFloat(String(concept.amount_usd)).toFixed(2)}
                </option>
              ))}
            </select>
            {billingConcepts.length === 0 && (
              <p className="text-xs text-amber-600 font-medium">
                No hay conceptos de facturación activos.{' '}
                <Link href="/admin/billing" className="underline hover:text-amber-700">
                  Crear uno primero
                </Link>
              </p>
            )}
          </div>

          {/* Método de Pago + Monto (Grid 2 cols en desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Método de Pago */}
            <div className="space-y-2">
              <label htmlFor="payment_method" className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Método de Pago
              </label>
              <select
                id="payment_method"
                name="payment_method"
                required
                defaultValue=""
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Seleccionar método…
                </option>
                <option value="pago_movil">Pago Móvil</option>
                <option value="zelle">Zelle</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>

            {/* Monto USD */}
            <div className="space-y-2">
              <label htmlFor="amount_usd" className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Monto (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                <input
                  id="amount_usd"
                  name="amount_usd"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Referencia + Estado (Grid 2 cols en desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Referencia */}
            <div className="space-y-2">
              <label htmlFor="reference_number" className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <Hash className="w-4 h-4 text-emerald-600" />
                Referencia
              </label>
              <input
                id="reference_number"
                name="reference_number"
                type="text"
                placeholder="Ej: 00012345678"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Estado Inicial */}
            <div className="space-y-2">
              <label htmlFor="status" className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Estado Inicial
              </label>
              <select
                id="status"
                name="status"
                required
                defaultValue="pendiente"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado (Efectivo directo)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer con botón */}
        <div className="px-6 lg:px-8 py-5 bg-gray-50 border-t border-gray-100">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}
