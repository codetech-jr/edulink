import React from 'react'
import {
  GraduationCap,
  FileDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  CreditCard,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { RepresentedStudent } from './FinancesTab'

const methodNames: Record<string, string> = {
  pago_movil: 'Pago Móvil',
  zelle: 'Zelle',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
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
          <AlertCircle className="h-3 w-3" />
          <span>Rechazado</span>
        </Badge>
      )
    default:
      return <Badge variant="default" size="sm">{status}</Badge>
  }
}

function formatMonthYear(dateStr?: string | null): string {
  if (!dateStr) return 'Fecha no especificada'
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('es-VE', { month: 'long', year: 'numeric' }).format(d)
  } catch {
    return dateStr
  }
}

interface StudentFinanceCardProps {
  student: RepresentedStudent
  optimisticPayments: Array<{
    id: string
    student_id: string
    amount_usd: number
    amount_ves?: number | null
    payment_method: string
    status: 'confirmado' | 'pendiente' | 'rechazado'
    reference_number?: string | null
    transaction_date: string
    created_at?: string
    isOptimistic?: boolean
    billing_concepts?: { name: string } | null
  }>
  bcvRate: number
}

export function StudentFinanceCard({
  student,
  optimisticPayments,
  bcvRate,
}: StudentFinanceCardProps) {
  const studentCourse = Array.isArray(student.courses) ? student.courses[0] : student.courses
  const isAlDia = student.saldoPendiente <= 0
  const hasPendingReview = student.totalPendiente > 0

  // Agrupar los pagos de este estudiante por mes cronológico (incluyendo optimistas)
  const studentOptimistic = optimisticPayments.filter((op) => op.student_id === student.id)
  const allPayments = [...studentOptimistic, ...student.payments]

  const paymentsByMonth = new Map<string, typeof allPayments>()
  allPayments.forEach((p) => {
    const monthLabel = formatMonthYear(p.transaction_date || p.created_at)
    const list = paymentsByMonth.get(monthLabel) || []
    list.push(p)
    paymentsByMonth.set(monthLabel, list)
  })

  const monthsList = Array.from(paymentsByMonth.entries())

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
      {/* Encabezado del Estudiante */}
      <div className="p-5 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/60 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar con Iniciales Grandes */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
            {student.full_name
              .split(' ')
              .filter(Boolean)
              .map((n: string) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-zinc-900 truncate">
              {student.full_name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
              <GraduationCap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>
                {studentCourse?.name
                  ? `${studentCourse.name} (${studentCourse.grade_level}° "${studentCourse.section}")`
                  : 'Curso no asignado'}
              </span>
              {student.cedula && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span className="font-mono text-2xs">C.I. {student.cedula}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Badge de Deuda Real + Botón Estado de Cuenta */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
          {isAlDia ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saldo al día ✓ ($0.00)</span>
            </span>
          ) : hasPendingReview ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>En verificación (${student.totalPendiente.toFixed(2)})</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>
                Pendiente: ${student.saldoPendiente.toFixed(2)}
                <span className="text-2xs font-mono opacity-80 ml-1">
                  (Bs. {student.saldoPendienteVes.toLocaleString('es-VE', { maximumFractionDigits: 0 })})
                </span>
              </span>
            </span>
          )}

          {/* Descarga Estado de Cuenta */}
          <a
            href={`/api/estado-cuenta/${student.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl shadow-2xs transition-colors min-h-[44px] sm:min-h-[34px]"
            title="Descargar estado de cuenta consolidado en PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-zinc-500" />
            <span>Estado de Cuenta</span>
          </a>
        </div>
      </div>

      {/* Historial de Pagos Agrupado por Mes */}
      <div className="p-5">
        <span className="text-2xs font-bold text-zinc-400 uppercase tracking-wider block mb-3">
          Historial de Transacciones
        </span>

        {monthsList.length === 0 ? (
          <div className="py-8 text-center bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 text-xs">
            No se registran transacciones para este estudiante.
          </div>
        ) : (
          <div className="space-y-5">
            {monthsList.map(([monthName, monthPayments]) => (
              <div key={monthName} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 border-b border-zinc-100 pb-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{monthName}</span>
                  <span className="text-2xs font-normal text-zinc-400">
                    ({monthPayments.length} pago{monthPayments.length === 1 ? '' : 's'})
                  </span>
                </div>

                <div className="divide-y divide-zinc-100">
                  {monthPayments.map((p) => {
                    const conceptTitle = p.billing_concepts?.name || 'Mensualidad Escolar'
                    const methodName = methodNames[p.payment_method] || p.payment_method
                    const amountUsd = Number(p.amount_usd || 0)
                    const amountVes = p.amount_ves
                      ? Number(p.amount_ves)
                      : Math.round(amountUsd * bcvRate * 100) / 100

                    return (
                      <div
                        key={p.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/60 -mx-2 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0 mt-0.5">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-zinc-900 truncate">
                              {conceptTitle}
                            </p>
                            <p className="text-2xs text-zinc-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                              <span>{methodName}</span>
                              {p.reference_number && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono">Ref: {p.reference_number}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{p.transaction_date || p.created_at?.split('T')[0]}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div className="text-left sm:text-right">
                            <p className="text-xs font-bold text-zinc-900 font-mono">
                              ${amountUsd.toFixed(2)}
                            </p>
                            <p className="text-2xs text-zinc-400 font-mono">
                              Bs. {amountVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>

                          <div>
                            {(p as { isOptimistic?: boolean }).isOptimistic ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                                <span>Procesando...</span>
                              </span>
                            ) : (
                              getStatusBadge(p.status)
                            )}
                          </div>

                          {p.status === 'confirmado' && (
                            <a
                              href={`/api/recibo/${p.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg border border-indigo-100 text-xs font-semibold transition-colors min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-0 sm:px-2.5 sm:py-1"
                              title="Descargar Recibo Oficial de Pago (PDF)"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Recibo</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
