'use client'

import React, { useRef } from 'react'
import { Info, Edit3, Eye } from 'lucide-react'
import { substituteWithSampleData } from '@/lib/constants/communication-templates'

interface AnnouncementEditorPreviewProps {
  body: string
  setBody: (val: string) => void
  title: string
  textareaRef: React.RefObject<HTMLTextAreaElement>
  activeTab: 'editor' | 'preview'
  setActiveTab: (val: 'editor' | 'preview') => void
}

export function AnnouncementEditorPreview({
  body,
  setBody,
  title,
  textareaRef,
  activeTab,
  setActiveTab,
}: AnnouncementEditorPreviewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="body" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
          <Info className="w-3.5 h-3.5 text-emerald-600" />
          Mensaje / Cuerpo del Comunicado
        </label>
        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'editor'
                ? 'bg-white text-gray-900 shadow-2xs font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'preview'
                ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Eye className="w-3 h-3 text-emerald-600" />
            Vista Previa
          </button>
        </div>
      </div>

      <div className={activeTab === 'editor' ? 'block' : 'hidden'}>
        <textarea
          id="body"
          name="body"
          ref={textareaRef}
          required
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe el cuerpo del comunicado aquí o haz clic en las variables de arriba..."
          className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all resize-y leading-relaxed"
        />
      </div>

      {activeTab === 'preview' && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-200">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              Simulación Representante
            </span>
            <span className="text-slate-400">Datos simulados en vivo</span>
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-900">
              {title || '(Sin título ingresado)'}
            </div>
            <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
              {body ? (
                substituteWithSampleData(body)
              ) : (
                <span className="text-slate-400 italic">
                  Ingresa el cuerpo del mensaje en la pestaña de Editor para previsualizarlo aquí.
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
