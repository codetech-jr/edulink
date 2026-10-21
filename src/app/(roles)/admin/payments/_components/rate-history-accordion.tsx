'use client'

import { useState } from 'react'
import { ChevronDown, History, Calendar, CheckCircle2 } from 'lucide-react'

export interface ExchangeRateItem {
  id: string
  rate_date: string
  rate: number
  source?: string | null
  created_at?: string | null
}

interface RateHistoryAccordionProps {
  rates: ExchangeRateItem[]
}

// Función auxiliar para formatear la fecha escolar venezolana
function formatRateDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-')
    if (year && month && day) {
      const dateObj = new Date(Number(year), Number(month) - 1, Number(day))
      return dateObj.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    }
    return dateStr
  } catch {
    return dateStr
  }
}

// Función auxiliar para formatear la marca de tiempo de registro
function formatRegisteredAt(timestamp?: string | null): string {
  if (!timestamp) return 'No registrado'
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return timestamp
    return date.toLocaleString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return timestamp
  }
}

export function RateHistoryAccordion({ rates }: RateHistoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden mb-8 transition-all">
      {/* Botón de cabecera colapsable */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50/80 transition-colors cursor-pointer min-h-[52px]"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 text-zinc-700 rounded-xl" aria-hidden="true">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Historial de Tasas BCV (últimos 30 días)
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                {rates.length} {rates.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Auditoría y trazabilidad de cotizaciones aplicadas a la facturación institucional.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold text-gray-500 hidden sm:inline">
            {isOpen ? 'Ocultar' : 'Ver historial'}
          </span>
          <div
            className={`p-1.5 rounded-lg bg-gray-100 text-gray-600 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Contenido desplegable */}
      {isOpen && (
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/40 animate-in fade-in duration-200">
          {rates.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-xs">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/90 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 font-bold">
                      Fecha
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-bold text-right">
                      Tasa (Bs/$)
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-bold text-center">
                      Fuente
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-bold text-right">
                      Cuándo se registró
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {rates.map((item, index) => {
                    const isLatest = index === 0
                    const sourceText = item.source || 'BCV'
                    const isAutoSync = sourceText.toLowerCase().includes('dolarapi')

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50/80 transition-colors ${
                          isLatest ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{formatRateDate(item.rate_date)}</span>
                            {isLatest && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Más reciente
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-gray-900 text-right whitespace-nowrap">
                          {Number(item.rate).toFixed(2)}{' '}
                          <span className="text-xs font-normal text-gray-500">Bs/$</span>
                        </td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              isAutoSync
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                                : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                            }`}
                          >
                            {sourceText}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-gray-500 whitespace-nowrap text-xs">
                          {formatRegisteredAt(item.created_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm bg-white rounded-xl border border-gray-200">
              No se han registrado cotizaciones en los últimos 30 días.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
