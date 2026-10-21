'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useRef, useState, useOptimistic } from 'react'
import {
  X,
  DollarSign,
  CreditCard,
  User,
  Receipt,
  Hash,
  Loader2,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import { reportPaymentAction, type ReportPaymentState } from '@/actions/representative-actions'
import { ReportPaymentFields } from './ReportPaymentFields'

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
  isOpen?: boolean
  onClose?: () => void
  hideDefaultButton?: boolean
  onOptimisticPayment?: (payment: any) => void /* TODO: tipado pendiente */
}

const initialState: ReportPaymentState = {
  error: null,
  success: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-xs hover:shadow transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-xs tracking-wide active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 min-h-[44px]"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Procesando Reporte…</span>
        </>
      ) : (
        <span>Confirmar y Reportar Pago</span>
      )}
    </button>
  )
}

export function ReportPaymentForm({
  students,
  billingConcepts,
  bcvRate,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  hideDefaultButton = false,
  onOptimisticPayment,
}: ReportPaymentFormProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isControlled = typeof controlledIsOpen === 'boolean'
  const isModalOpen = isControlled ? controlledIsOpen : internalIsOpen

  const [state, formAction] = useFormState(reportPaymentAction, initialState)
  const [optimisticState, setOptimisticState] = useOptimistic(
    { isPending: false, message: '' },
    (current, update: { isPending: boolean; message: string }) => update
  )
  const formRef = useRef<HTMLFormElement>(null)
  const [amountUsd, setAmountUsd] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

  const closeModal = () => {
    if (isControlled) {
      controlledOnClose?.()
    } else {
      setInternalIsOpen(false)
    }
  }

  const openModal = () => {
    if (!isControlled) {
      setInternalIsOpen(true)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    const studentId = formData.get('student_id') as string
    const conceptId = formData.get('billing_concept_id') as string
    const amountVal = formData.get('amount_usd') as string
    const methodVal = formData.get('payment_method') as string
    const refNum = formData.get('reference_number') as string

    const student = students.find((s) => s.id === studentId)
    const concept = billingConcepts.find((c) => c.id === conceptId)

    setOptimisticState({
      isPending: true,
      message: `Procesando pago de $${amountVal} USD para ${student?.full_name || 'el estudiante'}…`,
    })

    if (onOptimisticPayment) {
      onOptimisticPayment({
        id: 'optimistic-' + Date.now(),
        student_id: studentId,
        amount_usd: Number(amountVal || 0),
        payment_method: methodVal || 'pago_movil',
        status: 'pendiente',
        isOptimistic: true,
        reference_number: refNum || null,
        transaction_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        billing_concepts: {
          name: concept?.name || 'Mensualidad Escolar',
        },
      })
    }

    await formAction(formData)
  }

  // Ocultar modal al reportar con éxito
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        closeModal()
        setAmountUsd('')
        setPaymentMethod('')
        if (formRef.current) formRef.current.reset()
      }, 2200)
      return () => clearTimeout(timer)
    }
  }, [state?.success])

  // Cerrar modal al presionar Escape
  useEffect(() => {
    if (!isModalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  // Pre-seleccionar estudiante si solo hay uno
  const defaultStudentId = students.length === 1 ? students[0].id : ''

  return (
    <>
      {/* Botón trigger interno si no está oculto */}
      {!hideDefaultButton && (
        <button
          type="button"
          onClick={openModal}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs hover:shadow-sm active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Reportar Pago</span>
        </button>
      )}

      {/* Modal Overlay con Backdrop Blur */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          {/* Modal Container */}
          <div
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200/80 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 id="modal-title" className="text-sm font-semibold text-zinc-900">
                  Reportar Pago Realizado
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Registra tu transferencia o pago móvil.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {state?.success ? (
                <div
                  className="py-8 flex flex-col items-center justify-center text-center space-y-3"
                  role="status"
                  aria-live="polite"
                >
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center animate-bounce border border-emerald-100 shadow-inner">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">¡Pago Reportado con Éxito!</h4>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                      Tu reporte ha sido registrado en estado <strong>por verificar</strong>. El colegio lo validará para emitir tu recibo.
                    </p>
                  </div>
                </div>
              ) : (
                <form action={handleSubmit} ref={formRef} className="space-y-4">
                  {/* Banner Optimista de Procesamiento */}
                  {optimisticState.isPending && (
                    <div
                      className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-bold animate-pulse"
                      role="status"
                      aria-live="polite"
                    >
                      <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                      <span>{optimisticState.message}</span>
                    </div>
                  )}

                  {/* Mensaje de Error */}
                  {state?.error && (
                    <div
                      className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium"
                      role="alert"
                      aria-live="polite"
                    >
                      <span>{state.error}</span>
                    </div>
                  )}

                  <ReportPaymentFields
                    students={students as unknown as import('./FinancesTab').RepresentedStudent[]}
                    billingConcepts={billingConcepts}
                    bcvRate={bcvRate}
                    defaultStudentId={defaultStudentId}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    amountUsd={amountUsd}
                    setAmountUsd={setAmountUsd}
                  />

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
