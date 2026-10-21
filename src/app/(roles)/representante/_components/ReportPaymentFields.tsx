import React from 'react'
import { User, Receipt, CreditCard, DollarSign, Hash } from 'lucide-react'
import type { RepresentedStudent } from './FinancesTab'

interface BillingConcept {
  id: string
  name: string
  amount_usd: number
}

interface ReportPaymentFieldsProps {
  students: RepresentedStudent[]
  billingConcepts: BillingConcept[]
  bcvRate: number
  defaultStudentId: string
  paymentMethod: string
  setPaymentMethod: (val: string) => void
  amountUsd: string
  setAmountUsd: (val: string) => void
}

export function ReportPaymentFields({
  students,
  billingConcepts,
  bcvRate,
  defaultStudentId,
  paymentMethod,
  setPaymentMethod,
  amountUsd,
  setAmountUsd,
}: ReportPaymentFieldsProps) {
  return (
    <>
      {/* Campo Estudiante */}
      <div className="space-y-1">
        <label
          htmlFor="student_id"
          className="flex items-center gap-1.5 text-2xs font-semibold text-zinc-500 uppercase tracking-wider"
        >
          <User className="w-3.5 h-3.5 text-zinc-400" />
          Estudiante
        </label>
        <div className="relative">
          <select
            id="student_id"
            name="student_id"
            required
            defaultValue={defaultStudentId}
            className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[44px]"
          >
            <option value="" disabled>Selecciona el estudiante</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Campo Concepto / Arancel */}
      <div className="space-y-1">
        <label
          htmlFor="billing_concept_id"
          className="flex items-center gap-1.5 text-2xs font-semibold text-zinc-500 uppercase tracking-wider"
        >
          <Receipt className="w-3.5 h-3.5 text-zinc-400" />
          Arancel / Concepto
        </label>
        <div className="relative">
          <select
            id="billing_concept_id"
            name="billing_concept_id"
            required
            className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[44px]"
          >
            <option value="" disabled defaultValue="">Selecciona el arancel</option>
            {billingConcepts.map((concept) => (
              <option key={concept.id} value={concept.id}>
                {concept.name} (${Number(concept.amount_usd || 0).toFixed(2)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Campo Método de Pago */}
      <div className="space-y-1">
        <label
          htmlFor="payment_method"
          className="flex items-center gap-1.5 text-2xs font-semibold text-zinc-500 uppercase tracking-wider"
        >
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
            className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[44px]"
          >
            <option value="" disabled>Selecciona el método</option>
            <option value="pago_movil">Pago Móvil (C2P)</option>
            <option value="transferencia">Transferencia Bancaria</option>
            <option value="zelle">Zelle</option>
            <option value="efectivo">Efectivo en Caja</option>
          </select>
        </div>
      </div>

      {/* Campo Monto USD con inputMode="decimal" */}
      <div className="space-y-1">
        <label
          htmlFor="amount_usd"
          className="flex items-center gap-1.5 text-2xs font-semibold text-zinc-500 uppercase tracking-wider"
        >
          <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
          Monto Enviado (USD)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-xs">$</span>
          <input
            id="amount_usd"
            name="amount_usd"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            value={amountUsd}
            onChange={(e) => setAmountUsd(e.target.value)}
            placeholder="0.00"
            className="w-full pl-7 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all min-h-[44px]"
          />
        </div>
        {amountUsd && parseFloat(amountUsd) > 0 && (paymentMethod === 'pago_movil' || paymentMethod === 'transferencia') && (
          <p className="text-2xs text-indigo-600 font-semibold mt-1">
            Equivale a: {(parseFloat(amountUsd) * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs. (Tasa BCV: {bcvRate.toFixed(2)} Bs/$)
          </p>
        )}
      </div>

      {/* Campo Referencia con inputMode="numeric" */}
      <div className="space-y-1">
        <label
          htmlFor="reference_number"
          className="flex items-center gap-1.5 text-2xs font-semibold text-zinc-500 uppercase tracking-wider"
        >
          <Hash className="w-3.5 h-3.5 text-zinc-400" />
          Número de Referencia
        </label>
        <input
          id="reference_number"
          name="reference_number"
          type="text"
          inputMode="numeric"
          required
          placeholder="Ej: 847293"
          className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all min-h-[44px]"
        />
      </div>
    </>
  )
}
