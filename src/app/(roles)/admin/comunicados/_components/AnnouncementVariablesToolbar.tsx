'use client'

import React from 'react'
import { Code2 } from 'lucide-react'
import { AVAILABLE_VARIABLES } from '@/lib/constants/communication-templates'

interface AnnouncementVariablesToolbarProps {
  body: string
  onInsertVariable: (tag: string) => void
}

export function AnnouncementVariablesToolbar({
  body,
  onInsertVariable,
}: AnnouncementVariablesToolbarProps) {
  const detectedVariables = AVAILABLE_VARIABLES.filter((v) => body.includes(v.tag))

  return (
    <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
          <Code2 className="w-3.5 h-3.5 text-indigo-600" />
          Variables Disponibles
        </span>
        <span className="text-[10px] text-indigo-600 font-medium">
          Haz clic para insertar
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {AVAILABLE_VARIABLES.map((v) => (
          <button
            key={v.tag}
            type="button"
            onClick={() => onInsertVariable(v.tag)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
            title={`Inserta ${v.tag} (${v.label})`}
          >
            <span className="text-indigo-400 font-mono text-[10px]">+</span>
            <span>{v.tag}</span>
          </button>
        ))}
      </div>
      {detectedVariables.length > 0 && (
        <div className="pt-1 border-t border-indigo-100/80 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-semibold text-indigo-700">En uso:</span>
          {detectedVariables.map((v) => (
            <span
              key={v.tag}
              className="px-1.5 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold"
            >
              {v.tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
