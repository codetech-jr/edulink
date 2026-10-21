'use client'

import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  FileDown,
  User,
  GraduationCap,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  X,
} from 'lucide-react'

export interface PaymentRecord {
  id: string
  amount_usd: number
  amount_ves?: number | null
  status: 'confirmado' | 'pendiente' | 'rechazado'
  payment_method: string
  reference_number?: string | null
  transaction_date: string
  concept_name: string
}

export interface StudentMorosidadRecord {
  id: string
  list_number?: number | null
  full_name: string
  cedula: string
  course_id?: string | null
  course_name: string
  grade_level: number | string
  section: string
  parent_id?: string | null
  representative_name: string
  representative_phone?: string
  status: 'al_dia' | 'pendiente' | 'moroso'
  debt_usd: number
  debt_ves: number
  paid_usd: number
  pending_usd: number
  payments: PaymentRecord[]
}

interface AccountStatementModalProps {
  student: StudentMorosidadRecord | null
  isOpen: boolean
  onClose: () => void
  bcvRate: number
}

const methodNames: Record<string, string> = {
  pago_movil: 'Pago Móvil',
  zelle: 'Zelle',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo USD',
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'confirmado':
      return (
        <Badge variant="success" size="sm" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>Confirmado</span>
        </Badge>
      )
    case 'pendiente':
      return (
        <Badge variant="warning" size="sm" className="gap-1">
          <Clock className="h-3 w-3" />
          <span>Por verificar</span>
        </Badge>
      )
    case 'rechazado':
      return (
        <Badge variant="danger" size="sm" className="gap-1">
          <XCircle className="h-3 w-3" />
          <span>Rechazado</span>
        </Badge>
      )
    default:
      return <Badge variant="default" size="sm">{status}</Badge>
  }
}

export function AccountStatementModal({
  student,
  isOpen,
  onClose,
  bcvRate,
}: AccountStatementModalProps) {
  if (!student) return null

  const isAlDia = student.status === 'al_dia'

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div>
            <Modal.Title>Estado de Cuenta Escolar</Modal.Title>
            <Modal.Description>
              Historial de movimientos y saldo del año escolar
            </Modal.Description>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="space-y-5">
        {/* Ficha rápida del estudiante */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-zinc-50/80 rounded-xl border border-zinc-200/70 text-xs">
          <div>
            <span className="text-zinc-400 block font-medium">Estudiante:</span>
            <span className="font-semibold text-zinc-900 text-sm">
              {student.full_name}
            </span>
            <span className="text-zinc-500 block text-2xs mt-0.5">
              C.I. {student.cedula || 'Sin cédula'} • {student.grade_level}° &ldquo;{student.section}&rdquo;
            </span>
          </div>

          <div>
            <span className="text-zinc-400 block font-medium">Representante:</span>
            <span className="font-semibold text-zinc-800">
              {student.representative_name}
            </span>
            {student.representative_phone && (
              <span className="text-zinc-500 block text-2xs mt-0.5">
                Tlf: {student.representative_phone}
              </span>
            )}
          </div>
        </div>

        {/* Balance Financiero */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
            <span className="text-2xs font-semibold uppercase tracking-wider text-emerald-800 block">
              Total Pagado
            </span>
            <span className="text-lg font-bold text-emerald-950 mt-1 block">
              ${student.paid_usd.toFixed(2)}
            </span>
            <span className="text-2xs text-emerald-700 mt-0.5 block">
              Pagos confirmados
            </span>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
            <span className="text-2xs font-semibold uppercase tracking-wider text-amber-800 block">
              En Revisión
            </span>
            <span className="text-lg font-bold text-amber-950 mt-1 block">
              ${student.pending_usd.toFixed(2)}
            </span>
            <span className="text-2xs text-amber-700 mt-0.5 block">
              Comprobantes en espera
            </span>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              isAlDia
                ? 'bg-zinc-50 border-zinc-200/80'
                : 'bg-rose-50/60 border-rose-200/80'
            }`}
          >
            <span
              className={`text-2xs font-semibold uppercase tracking-wider block ${
                isAlDia ? 'text-zinc-500' : 'text-rose-800'
              }`}
            >
              Saldo Deudor
            </span>
            <span
              className={`text-lg font-bold mt-1 block ${
                isAlDia ? 'text-zinc-900' : 'text-rose-950'
              }`}
            >
              ${student.debt_usd.toFixed(2)}
            </span>
            <span
              className={`text-2xs mt-0.5 block ${
                isAlDia ? 'text-zinc-500' : 'text-rose-700'
              }`}
            >
              Bs. {student.debt_ves.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-2xs opacity-75 font-mono ml-1">({bcvRate.toFixed(2)} Bs/$)</span>
            </span>
          </div>
        </div>

        {/* Tabla de Historial de Pagos */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5" />
            <span>Movimientos del Período</span>
          </h4>

          {student.payments.length === 0 ? (
            <div className="text-center py-8 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 text-xs">
              No se han registrado pagos para este estudiante en el año escolar en curso.
            </div>
          ) : (
            <div className="border border-zinc-200/80 rounded-xl overflow-hidden">
              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 sticky top-0 border-b border-zinc-200 text-2xs font-semibold text-zinc-500 uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="py-2.5 px-3">Fecha</th>
                      <th scope="col" className="py-2.5 px-3">Concepto</th>
                      <th scope="col" className="py-2.5 px-3">Método / Ref</th>
                      <th scope="col" className="py-2.5 px-3 text-right">Monto</th>
                      <th scope="col" className="py-2.5 px-3 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {student.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-2 px-3 text-zinc-600 whitespace-nowrap">
                          {p.transaction_date}
                        </td>
                        <td className="py-2 px-3 font-medium text-zinc-800">
                          {p.concept_name}
                        </td>
                        <td className="py-2 px-3 text-zinc-500">
                          <span>{methodNames[p.payment_method] || p.payment_method}</span>
                          {p.reference_number && (
                            <span className="font-mono text-2xs text-zinc-400 ml-1">
                              #{p.reference_number}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-zinc-900">
                          ${p.amount_usd.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {getStatusBadge(p.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="justify-between">
        <a
          href={`/api/estado-cuenta/${student.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors min-h-[44px] sm:min-h-[38px]"
        >
          <FileDown className="h-4 w-4" />
          <span>Descargar Estado de Cuenta PDF</span>
        </a>

        <Button variant="secondary" onClick={onClose} className="min-h-[44px] sm:min-h-[38px]">
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
