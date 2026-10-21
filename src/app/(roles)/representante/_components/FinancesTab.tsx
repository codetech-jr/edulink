'use client'

import React, { useOptimistic } from 'react'
import { TrendingUp } from 'lucide-react'
import { ReportPaymentForm } from './ReportPaymentForm'
import { PaymentInstructions } from './PaymentInstructions'
import { StudentFinanceCard } from './StudentFinanceCard'

export interface RepresentedStudent {
  id: string
  full_name: string
  cedula: string
  courses: {
    id: string
    name: string
    grade_level: number | string
    section: string
  } | {
    id: string
    name: string
    grade_level: number | string
    section: string
  }[] | null
  totalFacturado: number
  totalPagado: number
  totalPendiente: number
  saldoPendiente: number
  saldoPendienteVes: number
  status: 'al_dia' | 'pendiente' | 'moroso'
  payments: Array<{
    id: string
    student_id: string
    amount_usd: number
    amount_ves?: number | null
    payment_method: string
    status: 'confirmado' | 'pendiente' | 'rechazado'
    reference_number?: string | null
    transaction_date: string
    created_at?: string
    rejection_reason?: string | null
    billing_concepts?: {
      name: string
    } | null
  }>
}

interface BillingConcept {
  id: string
  name: string
  amount_usd: number
}

interface FinancesTabProps {
  students: RepresentedStudent[]
  billingConcepts: BillingConcept[]
  bcvRate: number
  school: {
    name: string
    rif?: string
  }
}

interface OptimisticPayment {
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
  billing_concepts?: {
    name: string
  } | null
}

export function FinancesTab({
  students,
  billingConcepts,
  bcvRate,
  school,
}: FinancesTabProps) {
  // Manejo optimista de pagos para feedback instantáneo
  const [optimisticPayments, addOptimisticPayment] = useOptimistic<
    OptimisticPayment[],
    OptimisticPayment
  >([], (state, newPayment) => [newPayment, ...state])

  // Métricas financieras globales
  const totalDebtOverall = students.reduce((sum, s) => sum + s.saldoPendiente, 0)
  const totalDebtOverallVes = students.reduce((sum, s) => sum + s.saldoPendienteVes, 0)
  const totalPaidOverall = students.reduce((sum, s) => sum + s.totalPagado, 0)
  const allAlDia = totalDebtOverall <= 0

  return (
    <div className="space-y-6">
      {/* ── Banner de Estado de Cuenta Consolidado ────────────────── */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-2xs font-extrabold uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
              Estado de Cuenta Familiar
            </span>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">
                ${totalDebtOverall.toFixed(2)}
              </span>
              <span className="text-sm font-mono text-indigo-200">
                Bs. {totalDebtOverallVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-indigo-200/90 max-w-md">
              {allAlDia
                ? '¡Felicitaciones! Todas tus mensualidades están al día en la institución.'
                : 'Monto total pendiente acumulado entre tus representados matriculados.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-xs space-y-1">
              <span className="text-indigo-200 block text-2xs">Total Aportado en el Período</span>
              <span className="font-bold text-white font-mono text-sm">${totalPaidOverall.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reporte de Pago ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">
                ¿Realizaste una Transferencia o Pago Móvil?
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Regístrala aquí para que administración la verifique y emita tu recibo.
              </p>
            </div>
          </div>

          {/* Indicador Tasa Oficial BCV del Día */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 shrink-0 self-start sm:self-auto font-mono">
            <span>Tasa BCV: {bcvRate.toFixed(2)} Bs/$</span>
          </div>
        </div>

        {/* Formulario de Reporte de Pago */}
        <ReportPaymentForm
          students={students}
          billingConcepts={billingConcepts}
          bcvRate={bcvRate}
          onOptimisticPayment={addOptimisticPayment}
        />
      </div>

      {/* ── Cuentas Bancarias del Colegio ──────────────────────── */}
      <PaymentInstructions schoolName={school.name} schoolRif={school.rif || 'J-00000000-0'} />

      {/* ── Listado de Representados con Estado Real ───────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Mis Representados ({students.length})
          </h2>
          <span className="text-2xs text-zinc-400">
            Cálculo al día de mensualidades
          </span>
        </div>

        {students.map((student) => (
          <StudentFinanceCard
            key={student.id}
            student={student}
            optimisticPayments={optimisticPayments}
            bcvRate={bcvRate}
          />
        ))}
      </div>
    </div>
  )
}
