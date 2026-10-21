import React from 'react'
import { TrendingUp, Clock, XCircle } from 'lucide-react'

interface PaymentsKPICardsProps {
  totalRecaudado: number
  totalPendiente: number
  countPendiente: number
  countMorosos: number
}

export function PaymentsKPICards({
  totalRecaudado,
  totalPendiente,
  countPendiente,
  countMorosos,
}: PaymentsKPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recaudación Confirmada</p>
        </div>
        <p className="text-3xl font-black text-gray-900">
          ${totalRecaudado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-gray-400 font-bold mt-1">Monto acumulado en conciliaciones</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-amber-50 rounded-xl">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Por Confirmar</p>
        </div>
        <p className="text-3xl font-black text-gray-900">
          ${totalPendiente.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-amber-600 font-bold mt-1">
          {countPendiente} pago{countPendiente === 1 ? '' : 's'} pendiente{countPendiente === 1 ? '' : 's'} de revisión
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Morosidad</p>
        </div>
        <p className="text-3xl font-black text-gray-900">{countMorosos}</p>
        <p className="text-xs text-red-600 font-bold mt-1">
          Alumno{countMorosos === 1 ? '' : 's'} con reportes pendientes
        </p>
      </div>
    </div>
  )
}
