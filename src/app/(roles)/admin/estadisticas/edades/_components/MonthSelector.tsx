'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Download, RefreshCw } from 'lucide-react'

const SPANISH_MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

interface MonthSelectorProps {
  currentMonth: number
  currentYear: number
  schoolYearName: string
  cutOffDate: string
}

export function MonthSelector({
  currentMonth,
  currentYear,
  schoolYearName,
  cutOffDate,
}: MonthSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = React.useTransition()

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', newMonth)
    params.set('year', String(currentYear))

    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  const pdfUrl = `/api/estadisticas/edades/pdf?month=${currentMonth}&year=${currentYear}`

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Selector de Mes y Año Escolar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Mes de Estadística:</span>
        </div>

        <div className="relative">
          <select
            value={currentMonth}
            onChange={handleMonthChange}
            disabled={isPending}
            aria-label="Seleccionar mes de estadística"
            className="pl-4 pr-10 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer disabled:opacity-50 appearance-none"
          >
            {SPANISH_MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label} ({currentYear})
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
            ▼
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100/50">
          <span>Año Escolar: {schoolYearName}</span>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Corte: <span className="font-bold text-gray-700">{cutOffDate}</span>
        </div>
      </div>

      {/* Botón de Exportación a PDF Oficial MPPE */}
      <div className="flex items-center gap-3">
        {isPending && (
          <div className="flex items-center gap-2 text-xs text-gray-400 animate-pulse font-medium">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Recalculando...
          </div>
        )}

        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 transition-all active:scale-95 whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>Descargar Planilla Oficial MPPE</span>
        </a>
      </div>
    </div>
  )
}
