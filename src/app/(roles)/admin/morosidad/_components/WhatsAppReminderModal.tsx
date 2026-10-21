'use client'

import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { MessageSquare } from 'lucide-react'
import type { StudentMorosidadRecord } from './AccountStatementModal'
import { WhatsAppReminder } from './WhatsAppReminder'

interface WhatsAppReminderModalProps {
  student: StudentMorosidadRecord | null
  isOpen: boolean
  onClose: () => void
  conceptName: string
  bcvRate: number
}

export function WhatsAppReminderModal({
  student,
  isOpen,
  onClose,
  conceptName,
}: WhatsAppReminderModalProps) {
  if (!student) return null

  return (
    <Modal open={isOpen} onClose={onClose} size="md">
      <Modal.Header onClose={onClose}>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <Modal.Title>Recordatorio por WhatsApp</Modal.Title>
            <Modal.Description>
              Generador de cobranza con plantilla oficial y datos en tiempo real
            </Modal.Description>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-5">
        <WhatsAppReminder
          student={{
            id: student.id,
            full_name: student.full_name,
            representative_name: student.representative_name,
            representative_phone: student.representative_phone,
            grade_level: student.grade_level,
            section: student.section,
            debt_usd: student.debt_usd,
            concept_name: conceptName,
          }}
          onClose={onClose}
        />
      </Modal.Body>
    </Modal>
  )
}
