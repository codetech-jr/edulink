'use client'

import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { XCircle } from 'lucide-react'
import type { EnrollmentRequest } from './EnrollmentManagementClient'

interface EnrollmentRejectModalProps {
  request: EnrollmentRequest | null
  onClose: () => void
  rejectionReason: string
  setRejectionReason: (reason: string) => void
  isPending: boolean
  onConfirmReject: () => void
}

export function EnrollmentRejectModal({
  request,
  onClose,
  rejectionReason,
  setRejectionReason,
  isPending,
  onConfirmReject,
}: EnrollmentRejectModalProps) {
  if (!request) return null

  return (
    <Modal open={Boolean(request)} onClose={onClose} size="md">
      <Modal.Header onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <Modal.Title>Rechazar Solicitud de Ingreso</Modal.Title>
            <Modal.Description>
              Indica el motivo formal de la declinación.
            </Modal.Description>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-6">
        <p className="text-xs text-gray-600 mb-3">
          Aspirante: <strong className="text-gray-900">{request.student_name}</strong>
        </p>

        <div className="mb-2">
          <label
            htmlFor="rejection_reason"
            className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
          >
            Motivo del Rechazo <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="rejection_reason"
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Ej: Cupos agotados para el grado solicitado en el año escolar en curso..."
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors min-h-[44px]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirmReject}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 min-h-[44px]"
          >
            {isPending ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span>Confirmar Rechazo</span>
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}
