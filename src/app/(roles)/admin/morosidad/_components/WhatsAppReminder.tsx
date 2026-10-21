'use client'

import React, { useState, useEffect } from 'react'
import { Copy, Check, ExternalLink, Phone, MessageSquare, Sparkles, RefreshCw } from 'lucide-react'
import { PREDEFINED_TEMPLATES, substituteVariables } from '@/lib/constants/communication-templates'

export interface StudentMorosidadData {
  id: string
  full_name: string
  representative_name?: string | null
  representative_phone?: string | null
  grade_level?: string | number | null
  section?: string | null
  debt_usd: number
  concept_name?: string | null
  school_name?: string | null
}

interface WhatsAppReminderProps {
  student: StudentMorosidadData
  onClose?: () => void
}

/**
 * Normaliza números de teléfono venezolanos a formato internacional WhatsApp (58...).
 */
export function cleanVenezuelanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('0')) {
    return '58' + digits.slice(1)
  }
  if (digits.length === 10 && digits.startsWith('4')) {
    return '58' + digits
  }
  return digits
}

export function WhatsAppReminder({ student, onClose }: WhatsAppReminderProps) {
  const [phone, setPhone] = useState(student.representative_phone || '')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  // Generar texto usando la plantilla oficial "Recordatorio de Pago"
  const generateTemplateMessage = () => {
    const paymentTemplate =
      PREDEFINED_TEMPLATES.find((t) => t.id === 'recordatorio_pago')?.body ||
      'Estimado/a {{representante_nombre}}, le informamos que {{alumno_nombre}} de {{grado}} presenta una mensualidad pendiente de ${{monto}}. Por favor regularizar antes del {{fecha_vencimiento}}. Gracias por su atención.'

    const gradeText = student.grade_level
      ? `${student.grade_level}° "${student.section || 'A'}"`
      : 'su grado escolar'

    return substituteVariables(paymentTemplate, {
      representante_nombre: student.representative_name || 'Representante',
      alumno_nombre: student.full_name,
      grado: gradeText,
      monto: Number(student.debt_usd || 0).toFixed(2),
      fecha_vencimiento: 'la brevedad posible',
      colegio_nombre: student.school_name || 'nuestra institución',
    })
  }

  // Sincronizar mensaje inicial
  useEffect(() => {
    setPhone(student.representative_phone || '')
    setMessage(generateTemplateMessage())
    setCopied(false)
  }, [student])

  // Copiar al portapapeles con feedback de 2 segundos
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error al copiar texto:', err)
    }
  }

  // Abrir en WhatsApp con URL codificada
  const handleOpenWhatsApp = () => {
    const cleanedPhone = cleanVenezuelanPhone(phone)
    const encoded = encodeURIComponent(message)
    const url = cleanedPhone
      ? `https://wa.me/${cleanedPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const isValidPhone = phone.trim().replace(/\D/g, '').length >= 10

  return (
    <div className="space-y-4">
      {/* Ficha Resumen del Alumno */}
      <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/90 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-zinc-500 font-medium">Alumno:</span>
          <span className="font-bold text-zinc-900 ml-1.5">{student.full_name}</span>
          {student.grade_level && (
            <span className="text-zinc-500 ml-1">
              ({student.grade_level}° "{student.section || 'A'}")
            </span>
          )}
        </div>
        <div>
          <span className="text-zinc-500 font-medium">Deuda pendiente:</span>
          <span className="font-black text-rose-600 ml-1.5">
            ${Number(student.debt_usd || 0).toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* Teléfono de Contacto */}
      <div className="space-y-1.5">
        <label
          htmlFor="whatsapp-phone"
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          Teléfono WhatsApp del Representante
        </label>
        <div className="flex items-center gap-2">
          <input
            id="whatsapp-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: 04121234567 o 04141234567"
            className="flex-1 px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs sm:text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all min-h-[44px]"
          />
          <button
            type="button"
            onClick={() => setMessage(generateTemplateMessage())}
            className="px-3 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 min-h-[44px]"
            title="Restablecer plantilla original"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>
        </div>
        <p className="text-[11px] text-zinc-500">
          Formato venezolano: 0412, 0414, 0424, 0416, 0426 (se normalizará a +58 al enviar).
        </p>
      </div>

      {/* Editor del Mensaje Generado */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="whatsapp-message"
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            Mensaje de Cobranza (Plantilla Automática)
          </label>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <Sparkles className="w-3 h-3" />
            Plantilla Activa
          </span>
        </div>
        <textarea
          id="whatsapp-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3.5 bg-emerald-50/30 border border-emerald-200/80 rounded-2xl text-xs sm:text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all leading-relaxed resize-y"
        />
      </div>

      {/* Botones de Acción */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition-colors min-h-[44px]"
          >
            Cerrar
          </button>
        )}

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 font-bold rounded-xl text-xs transition-all shadow-2xs active:scale-[0.98] min-h-[44px]"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">¡Mensaje Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-zinc-500" />
              <span>Copiar Mensaje</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleOpenWhatsApp}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all active:scale-[0.98] min-h-[44px]"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Abrir en WhatsApp</span>
        </button>
      </div>
    </div>
  )
}
