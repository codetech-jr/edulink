'use client'

import React from 'react'
import { WifiOff, Wifi, RefreshCw } from 'lucide-react'
import { useOfflineSync, type OfflineCacheData } from '@/hooks/useOfflineSync'

interface OfflineStatusBannerProps {
  currentData?: Partial<OfflineCacheData>
}

export function OfflineStatusBanner({ currentData }: OfflineStatusBannerProps) {
  const { isOffline, wasOffline, lastSyncDate } = useOfflineSync(currentData)

  const formatSyncTime = (isoString: string | null) => {
    if (!isoString) return 'sesión anterior'
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString('es-VE', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return 'sesión anterior'
    }
  }

  // Si está offline: mostrar banner prominente
  if (isOffline) {
    return (
      <div className="bg-amber-500 text-zinc-950 px-4 py-2.5 rounded-2xl shadow-sm border border-amber-600/30 flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in duration-200">
        <div className="flex items-center gap-2 min-w-0">
          <WifiOff className="w-4 h-4 shrink-0 text-zinc-950" />
          <span className="truncate">
            Sin conexión · Datos del último sync ({formatSyncTime(lastSyncDate)})
          </span>
        </div>
        <span className="px-2 py-0.5 bg-black/10 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
          Modo Offline
        </span>
      </div>
    )
  }

  // Si recuperó la conexión recientemente: mostrar feedback de reconexión
  if (wasOffline) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-sm flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in duration-200">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-emerald-100" />
          <span>¡Conexión restablecida! Actualizando datos en tiempo real…</span>
        </div>
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-100" />
      </div>
    )
  }

  return null
}
