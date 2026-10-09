'use client'

import { useTransition, useState } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { updateExchangeRateAction } from '@/actions/payment-actions'

interface SyncBcvBannerProps {
  bcvRate: number
}

export function SyncBcvBanner({ bcvRate }: SyncBcvBannerProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSync = () => {
    setError(null)
    startTransition(async () => {
      try {
        await updateExchangeRateAction(bcvRate)
      } catch (err: any) {
        setError(err.message || 'Error al actualizar la tasa')
      }
    })
  }

  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 flex-shrink-0">
            <RefreshCw className={`w-5 h-5 ${isPending ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <p className="font-bold text-sm">
              Tasa BCV del día detectada: {Number(bcvRate).toFixed(2)} Bs/$. ¿Desea actualizar la tasa del colegio?
            </p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-h-[40px]"
        >
          {isPending ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Sincronizando...
            </>
          ) : (
            'Sincronizar'
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
