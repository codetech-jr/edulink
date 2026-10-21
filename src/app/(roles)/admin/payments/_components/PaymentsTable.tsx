import React from 'react'
import { Calendar, CreditCard, CheckCircle2, Clock, XCircle, FileDown } from 'lucide-react'
import { PaymentRowActions } from './payment-row-actions'

export interface PaymentItem {
  id: string
  reference_number?: string | null
  transaction_date?: string | null
  student_id?: string
  payment_method: string
  phone_number?: string | null
  bank_origin?: string | null
  amount_usd?: number | null
  amount_ves?: number | null
  exchange_rate_used?: number | null
  status: 'confirmado' | 'pendiente' | 'rechazado'
  rejection_reason?: string | null
  students?: {
    full_name?: string
  } | null
}

const methodNames: Record<string, string> = {
  pago_movil: 'Pago Móvil (C2P)',
  zelle: 'Zelle',
  transferencia: 'Transferencia Bancaria',
  efectivo: 'Efectivo USD',
}

interface PaymentsTableProps {
  paymentsList: PaymentItem[]
}

export function PaymentsTable({ paymentsList }: PaymentsTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Referencia</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiante</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Método</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Monto</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Recibo</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paymentsList && paymentsList.length > 0 ? (
              paymentsList.map((payment) => (
                <tr key={payment.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-gray-700 block">
                      {payment.reference_number || 'S/R'}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {payment.transaction_date}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900 block">
                      {payment.students?.full_name || 'Estudiante no registrado'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-gray-700">
                        <CreditCard className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm font-bold">
                          {methodNames[payment.payment_method] || payment.payment_method}
                        </span>
                      </div>
                      {(payment.phone_number || payment.bank_origin) && (
                        <span className="text-xs text-gray-400 font-medium mt-0.5">
                          {payment.bank_origin} {payment.phone_number ? `(${payment.phone_number})` : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-gray-950 block">
                      ${Number(payment.amount_usd || 0).toFixed(2)}
                    </span>
                    {payment.amount_ves && (
                      <span className="text-xs text-emerald-600 font-bold block mt-0.5">
                        {Number(payment.amount_ves).toFixed(2)} Bs. 
                        {payment.exchange_rate_used && (
                          <span className="text-[10px] text-gray-400 font-normal"> (a {payment.exchange_rate_used} Bs.)</span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      payment.status === 'confirmado' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : payment.status === 'pendiente'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-red-50 text-red-600'
                    }`}>
                      {payment.status === 'confirmado' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {payment.status === 'pendiente' && <Clock className="w-3.5 h-3.5" />}
                      {payment.status === 'rechazado' && <XCircle className="w-3.5 h-3.5" />}
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {payment.status === 'confirmado' ? (
                      <a
                        href={`/api/recibo/${payment.id}`}
                        download
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                        title="Descargar Recibo Oficial en PDF"
                      >
                        <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Recibo PDF</span>
                      </a>
                    ) : (
                      <span className="text-gray-300 text-xs font-medium">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <PaymentRowActions
                      paymentId={payment.id}
                      studentName={payment.students?.full_name || 'Estudiante'}
                      status={payment.status}
                      rejectionReason={payment.rejection_reason}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium bg-gray-50/50">
                  No se encontraron reportes de pago para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
