'use client'

import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { FileText, ExternalLink } from 'lucide-react'
import type { EnrollmentRequest } from './EnrollmentManagementClient'

interface EnrollmentDocModalProps {
  request: EnrollmentRequest | null
  onClose: () => void
  loadingDocPath: string | null
  onOpenDocument: (path: string) => void
}

export function EnrollmentDocModal({
  request,
  onClose,
  loadingDocPath,
  onOpenDocument,
}: EnrollmentDocModalProps) {
  if (!request) return null

  return (
    <Modal open={Boolean(request)} onClose={onClose} size="md">
      <Modal.Header onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <Modal.Title>Documentos Adjuntos</Modal.Title>
            <Modal.Description>
              Expediente digital consignado para {request.student_name}
            </Modal.Description>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-6">
        <div className="space-y-2.5 max-h-60 overflow-y-auto mb-6">
          {(request.documents || []).length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">No hay documentos adjuntos para esta solicitud.</p>
          ) : (
            (request.documents || []).map((doc, idx) => {
              const isLoadingThis = loadingDocPath === doc.path

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                >
                  <div className="truncate mr-2">
                    <p className="font-bold text-gray-900 truncate">{doc.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {(doc.size / (1024 * 1024)).toFixed(2)} MB • {doc.type.split('/')[1] || doc.type}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenDocument(doc.path)}
                    disabled={isLoadingThis}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex-shrink-0 min-h-[36px]"
                  >
                    {isLoadingThis ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5" />
                    )}
                    <span>Abrir</span>
                  </button>
                </div>
              )
            })
          )}
        </div>

        {request.notes && (
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
            <span className="font-bold block mb-1">Notas u observaciones del representante:</span>
            <p className="italic">"{request.notes}"</p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors min-h-[44px]"
        >
          Cerrar
        </button>
      </Modal.Footer>
    </Modal>
  )
}
