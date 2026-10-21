'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState<boolean>(false)
  const [isIOS, setIsIOS] = useState<boolean>(false)

  useEffect(() => {
    // 1. Detectar si el dispositivo está en modo standalone (ya instalado)
    const checkStandalone = () => {
      if (typeof window === 'undefined') return
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://')

      setIsInstalled(isStandalone)

      // Detectar iOS
      const userAgent = window.navigator.userAgent.toLowerCase()
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
      setIsIOS(isIosDevice)
    }

    checkStandalone()

    // 2. Escuchar cambios de display-mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches)
    }
    mediaQuery.addEventListener('change', handleMediaChange)

    // 3. Capturar evento beforeinstallprompt en Chromium / Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    // 4. Capturar evento appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!installPrompt) return false
    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setIsInstalled(true)
        setInstallPrompt(null)
        return true
      }
      return false
    } catch (err) {
      console.error('Error al solicitar instalación PWA:', err)
      return false
    }
  }

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    isIOS: isIOS && !isInstalled,
    installApp,
  }
}
