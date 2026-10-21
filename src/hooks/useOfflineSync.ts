'use client'

import { useState, useEffect, useCallback } from 'react'

const CACHE_KEY = 'edulink_representante_offline_cache'

export interface OfflineCacheData {
  timestamp: string
  totalPagado?: number
  totalDeuda?: number
  bcvRate?: number
  studentsCount?: number
}

export function useOfflineSync(currentData?: Partial<OfflineCacheData>) {
  const [isOffline, setIsOffline] = useState(false)
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null)
  const [cachedData, setCachedData] = useState<OfflineCacheData | null>(null)
  const [wasOffline, setWasOffline] = useState(false)

  // Guardar snapshot local
  const saveSnapshot = useCallback((data: Partial<OfflineCacheData>) => {
    if (typeof window === 'undefined') return
    try {
      const now = new Date().toISOString()
      const payload: OfflineCacheData = {
        timestamp: now,
        ...data,
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
      setLastSyncDate(now)
      setCachedData(payload)
    } catch (err) {
      console.warn('No se pudo guardar la caché local offline:', err)
    }
  }, [])

  // Cargar caché previa e inicializar listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Verificar estado inicial de conexión
    setIsOffline(!navigator.onLine)

    // 2. Cargar datos de caché si existen
    try {
      const stored = localStorage.getItem(CACHE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as OfflineCacheData
        setCachedData(parsed)
        setLastSyncDate(parsed.timestamp)
      }
    } catch (err) {
      console.warn('Error leyendo caché offline:', err)
    }

    // 3. Manejadores de conectividad
    const handleOnline = () => {
      setIsOffline(false)
      setWasOffline(true)
      setTimeout(() => setWasOffline(false), 4000)
    }

    const handleOffline = () => {
      setIsOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Guardar snapshot cuando los datos del servidor cambian y hay conexión
  useEffect(() => {
    if (!isOffline && currentData && typeof window !== 'undefined') {
      saveSnapshot(currentData)
    }
  }, [isOffline, currentData, saveSnapshot])

  return {
    isOffline,
    wasOffline,
    lastSyncDate,
    cachedData,
    saveSnapshot,
  }
}
