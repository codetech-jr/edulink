'use client'

import { useState } from 'react'
import {
  CreditCard,
  Phone,
  Building,
  Mail,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'

interface PaymentInstructionsProps {
  schoolName: string
  schoolRif?: string
}

export function PaymentInstructions({ schoolName, schoolRif = 'J-00000000-0' }: PaymentInstructionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const pagoMovilData = {
    banco: 'Banco de Venezuela (0102)',
    telefono: '0412-5551234',
    rif: schoolRif,
  }

  const zelleData = {
    correo: 'pagos@liceomatalinda.edu.ve',
    titular: schoolName,
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden transition-all duration-200">
      {/* Header Colapsable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full p-5 flex items-center justify-between hover:bg-zinc-50/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-50 border border-zinc-200/60 rounded-xl flex items-center justify-center text-zinc-500 flex-shrink-0">
            <Building className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-zinc-800">Cuentas del Colegio</h2>
            <p className="text-[11px] text-zinc-400">Datos para Pago Móvil, Transferencia o Zelle.</p>
          </div>
        </div>
        <div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </div>
      </button>

      {/* Contenido */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-zinc-100 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          
          {/* Sección Pago Móvil / Transferencia */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
              Pago Móvil y Transferencia Bs.
            </h3>
            
            <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-xl p-3.5 space-y-2.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-normal">Banco:</span>
                <span className="font-semibold text-zinc-800">{pagoMovilData.banco}</span>
              </div>
              
              <div className="flex justify-between items-center border-t border-zinc-200/40 pt-2">
                <span className="text-zinc-400 font-normal">Teléfono:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-zinc-800">{pagoMovilData.telefono}</span>
                  <button
                    onClick={() => copyToClipboard(pagoMovilData.telefono, 'telefono')}
                    className="p-1 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 rounded-md transition-all active:scale-95 cursor-pointer"
                    title="Copiar teléfono"
                    aria-label="Copiar teléfono de Pago Móvil"
                  >
                    {copiedField === 'telefono' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-zinc-200/40 pt-2">
                <span className="text-zinc-400 font-normal">RIF:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-zinc-800">{pagoMovilData.rif}</span>
                  <button
                    onClick={() => copyToClipboard(pagoMovilData.rif, 'rif')}
                    className="p-1 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 rounded-md transition-all active:scale-95 cursor-pointer"
                    title="Copiar RIF"
                    aria-label="Copiar RIF del colegio"
                  >
                    {copiedField === 'rif' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Zelle */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
              Transferencia Zelle (USD)
            </h3>
            
            <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-xl p-3.5 space-y-2.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-normal">Correo:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-zinc-800 truncate max-w-[180px]">
                    {zelleData.correo}
                  </span>
                  <button
                    onClick={() => copyToClipboard(zelleData.correo, 'correo')}
                    className="p-1 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 rounded-md transition-all active:scale-95 cursor-pointer"
                    title="Copiar correo"
                    aria-label="Copiar correo de Zelle"
                  >
                    {copiedField === 'correo' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-t border-zinc-200/40 pt-2">
                <span className="text-zinc-400 font-normal">Titular:</span>
                <span className="font-semibold text-zinc-800 truncate max-w-[200px]" title={zelleData.titular}>
                  {zelleData.titular}
                </span>
              </div>
            </div>
          </div>

          {/* Nota Aclaratoria */}
          <div className="flex gap-2.5 p-3 bg-zinc-50 border border-zinc-200/60 rounded-xl text-[10px] text-zinc-500 font-normal">
            <Info className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span>
              Reporta tu referencia de pago móvil en Bolívares usando la tasa BCV oficial que se muestra en pantalla. Los pagos Zelle deben reportarse por el monto exacto en dólares.
            </span>
          </div>

        </div>
      )}
    </div>
  )
}
