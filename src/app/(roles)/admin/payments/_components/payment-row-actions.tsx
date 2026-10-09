'use client'

import { useState, useTransition } from 'react'
import { Check, X, AlertTriangle, MessageSquare, Info } from 'lucide-react'
import { approvePaymentAction, rejectPaymentAction } from '@/actions/payment-actions'

interface PaymentRowActionsProps {
  paymentId: string
  studentName: string
  status: 'pendiente' | 'confirmado' | 'rechazado'
  rejectionReason?: string | null
}

export function PaymentRowActions({ 
  paymentId, 
  studentName, 
  status,
  rejectionReason 
}: PaymentRowActionsProps) {
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleApprove = () => {
    setError(null)
    if (confirm(`¿Estás seguro de aprobar el pago de ${studentName}?`)) {
      startTransition(async () => {
        try {
          await approvePaymentAction(paymentId)
        } catch (err: any) {
          setError(err.message || 'Error al aprobar el pago')
          alert(err.message || 'Error al aprobar el pago')
        }
      })
    }
  }

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('El motivo del rechazo es obligatorio.')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        await rejectPaymentAction(paymentId, reason)
        setShowRejectModal(false)
        setReason('')
      } catch (err: any) {
        setError(err.message || 'Error al rechazar el pago')
      }
    })
  }

  if (status === 'confirmado') {
    return <span className="text-xs text-emerald-600 font-bold bg-emerald-50/50 px-2.5 py-1 rounded-lg">Conciliado</span>
  }

  if (status === 'rechazado') {
    return (
      <div className="flex items-center justify-end gap-1.5">
        {rejectionReason && (
          <button
            onClick={() => setShowReasonModal(true)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-lg flex items-center gap-1 text-xs"
            title="Ver motivo de rechazo"
          >
            <Info className="w-4 h-4 text-red-500" />
            <span className="font-semibold">Ver Motivo</span>
          </button>
        )}
        
        {showReasonModal && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-red-600" />
                Motivo de Rechazo
              </h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Estudiante</p>
              <p className="text-gray-950 font-bold mb-4">{studentName}</p>
              
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Motivo</p>
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm font-medium mb-6 leading-relaxed">
                {rejectionReason}
              </div>

              <button
                onClick={() => setShowReasonModal(false)}
                className="w-full px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Botón Aprobar */}
      <button
        onClick={handleApprove}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-xs hover:bg-emerald-100 active:scale-95 transition-all disabled:opacity-50"
        title="Aprobar Pago"
      >
        <Check className="w-3.5 h-3.5" />
        <span>Aprobar</span>
      </button>

      {/* Botón Rechazar */}
      <button
        onClick={() => {
          setError(null)
          setShowRejectModal(true)
        }}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 font-bold rounded-xl text-xs hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50"
        title="Rechazar Pago"
      >
        <X className="w-3.5 h-3.5" />
        <span>Rechazar</span>
      </button>

      {/* Modal para Rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-100 p-3 rounded-xl flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Rechazar Pago</h3>
                <p className="text-sm text-gray-500">Esta acción invalidará el comprobante.</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Indique el motivo por el cual rechaza el pago de <strong className="text-gray-900">{studentName}</strong>. El representante será notificado de este motivo.
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Motivo de Rechazo</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej. Referencia incorrecta o depósito no recibido en cuenta..."
                  className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all h-24 resize-none"
                  required
                  disabled={isPending}
                />
                {error && <p className="text-xs text-red-600 font-bold mt-1">{error}</p>}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false)
                    setReason('')
                    setError(null)
                  }}
                  className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                  disabled={isPending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-5 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Rechazar Pago'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
