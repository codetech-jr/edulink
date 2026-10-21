'use client'

import React, { useState } from 'react'
import { Smartphone, Download, X, Share, PlusSquare } from 'lucide-react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export function PWAInstallBanner() {
  const { canInstall, isInstalled, isIOS, installApp } = usePWAInstall()
  const [isDismissed, setIsDismissed] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)

  // Si ya está instalado o el usuario descartó el banner en la sesión, ocultar
  if (isInstalled || isDismissed) {
    return null
  }

  // Si no está disponible el prompt ni es iOS, ocultar
  if (!canInstall && !isIOS) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-sm border border-indigo-800/80 transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        {/* Lado izquierdo: Ícono e Información */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs font-black text-lg">
            E
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">
                EduLink en tu Teléfono
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                PWA Nativa
              </span>
            </div>
            <p className="text-[11px] text-indigo-200/90 truncate mt-0.5 font-medium">
              Acceso rápido sin gastar megas y disponible sin conexión.
            </p>
          </div>
        </div>

        {/* Lado derecho: Botón de Instalación y Descartar */}
        <div className="flex items-center gap-2 shrink-0">
          {canInstall ? (
            <button
              type="button"
              onClick={installApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-xs shadow-sm transition-all active:scale-95 min-h-[44px] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App →</span>
            </button>
          ) : isIOS ? (
            <button
              type="button"
              onClick={() => setShowIosGuide(!showIosGuide)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 transition-all min-h-[44px] cursor-pointer"
            >
              <Share className="w-3.5 h-3.5" />
              <span>Cómo instalar</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Cerrar sugerencia de instalación"
            className="p-2 text-indigo-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mini Guía para iOS Safari */}
      {showIosGuide && (
        <div className="mt-3 pt-3 border-t border-indigo-800/80 text-xs text-indigo-200 space-y-1.5 animate-in fade-in duration-200">
          <p className="font-semibold text-white flex items-center gap-1.5">
            <PlusSquare className="w-3.5 h-3.5 text-indigo-400" />
            Para instalar en iPhone / iPad:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-indigo-200/90 pl-1">
            <li>Toca el botón <strong>Compartir</strong> (ícono cuadrado con flecha hacia arriba) en Safari.</li>
            <li>Desliza hacia abajo y selecciona <strong>"Agregar al inicio"</strong>.</li>
            <li>Toca <strong>"Agregar"</strong> en la esquina superior derecha.</li>
          </ol>
        </div>
      )}
    </div>
  )
}
