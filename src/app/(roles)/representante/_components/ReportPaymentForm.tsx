'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import {
  X,
  DollarSign,
  CreditCard,
  User,
  Receipt,
  Hash,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react'
import { reportPaymentAction, type ReportPaymentState } from '@/actions/representative-actions'

interface Student {
  id: string
  full_name: string
}

interface BillingConcept {
  id: string
  name: string
  amount_usd: number
}

interface ReportPaymentFormProps {
  students: Student[]
  billingConcepts: BillingConcept[]
  bcvRate: number
}

const initialState: ReportPaymentState = {
  error: null,
  success: false
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full shadow-sm hover:shadow transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-xs tracking-wide active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      {pending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Procesando Reporte…
        </>
      ) : (
        'Confirmar y Reportar Pago'
      )}
    </button>
  )
}

export function ReportPaymentForm({ students, billingConcepts, bcvRate }: ReportPaymentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction] = useFormState(reportPaymentAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [amountUsd, setAmountUsd] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

  // Ocultar modal al reportar con éxito
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        setIsOpen(false)
        setAmountUsd('')
        setPaymentMethod('')
        // Reset state
        if (formRef.current) formRef.current.reset()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [state?.success])

  // Limpiar estados de error al abrir/cerrar modal
  const toggleModal = () => {
    setIsOpen(!isOpen)
  }

  // Pre-seleccionar estudiante si solo hay uno
  const defaultStudentId = students.length === 1 ? students[0].id : ''

  return (
    <>
      {/* Botón premium rounded-full e indigo-600 */}
      <button
        onClick={toggleModal}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full shadow-sm hover:shadow active:scale-[0.98] transition-all duration-150 text-sm cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Reportar Pago</span>
      </button>

      {/* Modal Overlay con Backdrop Blur */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Modal Container */}
          <div 
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200/60 shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 id="modal-title" className="text-sm font-semibold text-zinc-900">
                  Reportar Pago Realizado
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Registra los datos de la transferencia o pago móvil.
                </p>
              </div>
              <button
                onClick={toggleModal}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-full transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Formulario */}
            <div className="flex-1 overflow-y-auto p-6">
              {state?.success ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 bg-zinc-50 text-emerald-600 rounded-full flex items-center justify-center animate-bounce border border-zinc-200/50 shadow-inner">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">¡Pago Reportado con Éxito!</h4>
                    <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
                      Tu reporte ha sido ingresado en estado <strong>pendiente</strong>. El colegio lo validará a la brevedad.
                    </p>
                  </div>
                </div>
              ) : (
                <form action={formAction} ref={formRef} className="space-y-4">
                  {/* Mensaje de Error */}
                  {state?.error && (
                    <div className="flex items-start gap-2.5 p-3 bg-red-50/50 border border-red-100/50 rounded-xl text-xs text-red-700 font-medium animate-in fade-in duration-200">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{state.error}</span>
                    </div>
                  )}

                  {/* Campo Estudiante */}
                  {students.length > 1 ? (
                    <div className="space-y-1">
                      <label htmlFor="student_id" className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        Estudiante (Hijo)
                      </label>
                      <div className="relative">
                        <select
                          id="student_id"
                          name="student_id"
                          required
                          defaultValue={defaultStudentId}
                          className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/12 focus:border-indigo-400 focus:bg-white transition-all appearance-none cursor-pointer input-focus-ring"
                        >
                          <option value="" disabled>Selecciona el estudiante</option>
                          {students.map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.full_name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                          <svg className="fill-current h-4.5 w-4.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <input type="hidden" name="student_id" value={defaultStudentId} />
                  )}

                  {/* Campo Arancel/Concepto */}
                  <div className="space-y-1">
                    <label htmlFor="billing_concept_id" className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      <Receipt className="w-3.5 h-3.5 text-zinc-400" />
                      Arancel / Concepto
                    </label>
                    <div className="relative">
                      <select
                        id="billing_concept_id"
                        name="billing_concept_id"
                        required
                        className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/12 focus:border-indigo-400 focus:bg-white transition-all appearance-none cursor-pointer input-focus-ring"
                      >
                        <option value="" disabled selected>Selecciona el arancel</option>
                        {billingConcepts.map((concept) => (
                          <option key={concept.id} value={concept.id}>
                            {concept.name} (${parseFloat(String(concept.amount_usd)).toFixed(2)})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                        <svg className="fill-current h-4.5 w-4.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Campo Método de Pago */}
                  <div className="space-y-1">
                    <label htmlFor="payment_method" className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                      Método de Pago
                    </label>
                    <div className="relative">
                      <select
                        id="payment_method"
                        name="payment_method"
                        required
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/12 focus:border-indigo-400 focus:bg-white transition-all appearance-none cursor-pointer input-focus-ring"
                      >
                        <option value="" disabled>Selecciona el método</option>
                        <option value="pago_movil">Pago Móvil</option>
                        <option value="transferencia">Transferencia Bancaria</option>
                        <option value="zelle">Zelle</option>
                        <option value="efectivo">Efectivo en Secretaría</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                        <svg className="fill-current h-4.5 w-4.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Campo Monto USD */}
                  <div className="space-y-1">
                    <label htmlFor="amount_usd" className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                      Monto Enviado (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-xs">$</span>
                      <input
                        id="amount_usd"
                        name="amount_usd"
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={amountUsd}
                        onChange={(e) => setAmountUsd(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/12 focus:border-indigo-400 focus:bg-white transition-all duration-200 input-focus-ring"
                      />
                    </div>
                    {amountUsd && parseFloat(amountUsd) > 0 && (paymentMethod === 'pago_movil' || paymentMethod === 'transferencia') && (
                      <p className="text-[10px] text-indigo-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in duration-200">
                        Equivale a: {(parseFloat(amountUsd) * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs. (Tasa BCV: {bcvRate.toFixed(2)} Bs/$)
                      </p>
                    )}
                  </div>

                  {/* Campo Referencia */}
                  <div className="space-y-1">
                    <label htmlFor="reference_number" className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      <Hash className="w-3.5 h-3.5 text-zinc-400" />
                      Número de Referencia
                    </label>
                    <input
                      id="reference_number"
                      name="reference_number"
                      type="text"
                      required
                      placeholder="Ej: 847293"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/12 focus:border-indigo-400 focus:bg-white transition-all duration-200 input-focus-ring"
                    />
                  </div>

                  {/* Botón de Envío */}
                  <div className="pt-2">
                    <SubmitButton />
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
