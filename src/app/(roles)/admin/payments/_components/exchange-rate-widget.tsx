'use client'

import { useState, useTransition } from 'react'
import { Landmark, Edit2, Check, X, RefreshCw } from 'lucide-react'
import { updateExchangeRateAction } from '@/actions/payment-actions'

interface ExchangeRateWidgetProps {
  currentRate: number | null
}

export function ExchangeRateWidget({ currentRate }: ExchangeRateWidgetProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [rateValue, setRateValue] = useState(currentRate?.toString() || '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const parsedRate = parseFloat(rateValue)
    if (isNaN(parsedRate) || parsedRate <= 0) {
      setError('La tasa debe ser un número válido mayor a 0.')
      return
    }

    startTransition(async () => {
      try {
        await updateExchangeRateAction(parsedRate)
        setIsEditing(false)
      } catch (err: any) {
        setError(err.message || 'Error al actualizar la tasa')
      }
    })
  }

  return (
    <div className="bg-white px-5 py-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 max-w-sm w-full relative">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 flex-shrink-0">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tasa BCV del Día</p>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-1.5 mt-1">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={rateValue}
                onChange={(e) => setRateValue(e.target.value)}
                className="w-24 px-2 py-1 text-sm font-bold text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all"
                disabled={isPending}
                required
                autoFocus
              />
              <span className="text-xs font-bold text-gray-500">Bs.</span>
            </form>
          ) : (
            <p className="text-lg font-black text-gray-950 mt-0.5">
              {currentRate ? `${Number(currentRate).toFixed(2)} Bs.` : 'No registrada'}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsEditing(false)
                setRateValue(currentRate?.toString() || '')
                setError(null)
              }}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
              disabled={isPending}
              type="button"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSubmit}
              className="p-1 text-white bg-emerald-600 hover:bg-emerald-700 transition-all rounded-lg flex items-center justify-center"
              disabled={isPending}
              type="submit"
              title="Guardar"
            >
              {isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all rounded-xl"
          >
            <Edit2 className="w-3 h-3" />
            Actualizar
          </button>
        )}
      </div>

      {error && (
        <span className="text-[10px] text-red-600 font-bold mt-1 absolute -bottom-5 left-5 bg-red-50 border border-red-100 px-2 py-0.5 rounded shadow-sm z-10 animate-in fade-in slide-in-from-top-1">
          {error}
        </span>
      )}
    </div>
  )
}
