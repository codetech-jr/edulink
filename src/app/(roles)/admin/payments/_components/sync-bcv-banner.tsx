'use client'

import { useTransition, useState } from 'react'
import { RefreshCw, AlertCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { triggerBcvSyncAction } from '@/actions/payment-actions'

interface SyncBcvBannerProps {
  currentRate: number | null
  rateDate: string | null
  lastUpdated?: string | null
  detectedRate?: number | null
}

export function SyncBcvBanner({
  currentRate,
  rateDate,
  lastUpdated,
  detectedRate,
}: SyncBcvBannerProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // 1. Calcular antigüedad de la tasa
  const now = new Date()
  let elapsedHours: number | null = null

  if (lastUpdated) {
    const updatedTime = new Date(lastUpdated).getTime()
    if (!isNaN(updatedTime)) {
      elapsedHours = Math.max(0, Math.floor((now.getTime() - updatedTime) / (1000 * 60 * 60)))
    }
  } else if (rateDate) {
    const todayStr = now.toISOString().split('T')[0]
    if (rateDate === todayStr) {
      elapsedHours = 0
    } else {
      const rateTime = new Date(`${rateDate}T12:00:00`).getTime()
      if (!isNaN(rateTime)) {
        elapsedHours = Math.max(0, Math.floor((now.getTime() - rateTime) / (1000 * 60 * 60)))
      }
    }
  }

  // 2. Determinar estado visual (OK, WARNING, CRITICAL)
  let status: 'ok' | 'warning' | 'critical' = 'critical'

  if (currentRate !== null && rateDate !== null) {
    if (elapsedHours !== null && elapsedHours < 24) {
      status = 'ok'
    } else if (elapsedHours !== null && elapsedHours < 48) {
      status = 'warning'
    } else {
      status = 'critical'
    }
  }

  const handleSync = () => {
    setError(null)
    setSuccessMessage(null)
    startTransition(async () => {
      try {
        const result = await triggerBcvSyncAction()
        if (result.error) {
          setError(result.error)
        } else if (result.success) {
          setSuccessMessage(
            `Tasa oficial actualizada a ${Number(result.rate).toFixed(2)} Bs/$ (${result.date})`
          )
        }
      } catch (err: any /* TODO: tipado pendiente */) {
        setError(err.message || 'Error al conectar con el servidor para sincronizar.')
      }
    })
  }

  // Helper para texto de tiempo
  const formatTimeAgo = () => {
    if (elapsedHours === null || elapsedHours === 0) {
      return 'Actualizado hoy'
    }
    if (elapsedHours === 1) {
      return 'Actualizado hace 1 hora'
    }
    if (elapsedHours < 24) {
      return `Actualizado hace ${elapsedHours} horas`
    }
    const days = Math.floor(elapsedHours / 24)
    if (days === 1) {
      return 'Actualizado hace 1 día'
    }
    return `Actualizado hace ${days} días`
  }

  return (
    <div className="flex flex-col gap-2 mb-6" aria-live="polite">
      {/* ── ESTADO OK (<24h): Badge zinc neutro, tasa actual y tiempo ── */}
      {status === 'ok' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-zinc-50 border border-zinc-200/90 rounded-2xl text-zinc-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-200/70 text-zinc-700 rounded-xl flex-shrink-0" aria-hidden="true">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-zinc-900">
                  Tasa BCV oficial: {Number(currentRate).toFixed(2)} Bs/$
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-200/80 text-zinc-700 border border-zinc-300/60">
                  {formatTimeAgo()}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Vigente para el cálculo automático de recibos y cobros escolares.
              </p>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 font-semibold rounded-xl text-xs border border-zinc-300/80 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-h-[44px] sm:min-h-[38px]"
            title="Volver a sincronizar con la fuente oficial del BCV"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
            {isPending ? 'Sincronizando...' : 'Actualizar'}
          </button>
        </div>
      )}

      {/* ── ESTADO WARNING (24-48h): Fondo ámbar suave y botón Sincronizar ahora ── */}
      {status === 'warning' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl flex-shrink-0" aria-hidden="true">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-sm text-amber-900">
                  Tasa registrada: {Number(currentRate).toFixed(2)} Bs/$
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  {formatTimeAgo()}
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-0.5 font-medium">
                La tasa no se ha actualizado hoy. Se recomienda sincronizar para reflejar la cotización oficial más reciente.
              </p>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-h-[44px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
            {isPending ? 'Sincronizando...' : 'Sincronizar ahora'}
          </button>
        </div>
      )}

      {/* ── ESTADO CRÍTICO (>48h o sin tasa): Fondo rose, advertencia y botón ── */}
      {status === 'critical' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-950 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl flex-shrink-0" aria-hidden="true">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-200/80 text-rose-900 border border-rose-300">
                  ⚠️ Tasa desactualizada — cobros en Bs pueden ser incorrectos
                </span>
              </div>
              <p className="text-xs text-rose-800/90 mt-1 font-medium">
                {currentRate !== null
                  ? `Última tasa registrada: ${Number(currentRate).toFixed(2)} Bs/$ (${formatTimeAgo()}). Actualízala urgentemente para evitar pérdidas o discrepancias bancarias.`
                  : 'No hay ninguna tasa oficial registrada en el sistema. Debe sincronizarse antes de registrar transacciones en Bolívares.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-h-[44px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
            {isPending ? 'Sincronizando...' : 'Sincronizar ahora'}
          </button>
        </div>
      )}

      {/* Feedback de error */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Feedback de éxito */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  )
}
