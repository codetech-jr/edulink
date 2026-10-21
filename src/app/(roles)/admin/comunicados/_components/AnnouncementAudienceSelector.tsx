'use client'

import React from 'react'
import { Users } from 'lucide-react'
import type { CourseOption } from './announcement-form'

interface AnnouncementAudienceSelectorProps {
  audienceType: 'todos' | 'grado' | 'seccion'
  setAudienceType: (val: 'todos' | 'grado' | 'seccion') => void
  selectedGrade: string
  setSelectedGrade: (val: string) => void
  selectedSection: string
  setSelectedSection: (val: string) => void
  courses: CourseOption[]
  distinctGrades: string[]
}

export function AnnouncementAudienceSelector({
  audienceType,
  setAudienceType,
  selectedGrade,
  setSelectedGrade,
  selectedSection,
  setSelectedSection,
  courses,
  distinctGrades,
}: AnnouncementAudienceSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="audience_type" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          Audiencia
        </label>
        <div className="relative">
          <select
            id="audience_type"
            value={audienceType}
            onChange={(e) =>
              setAudienceType(e.target.value as 'todos' | 'grado' | 'seccion')
            }
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all cursor-pointer appearance-none min-h-[44px]"
          >
            <option value="todos">🌐 Toda la institución</option>
            <option value="grado">🎓 Por grado / año</option>
            <option value="seccion">🏫 Por sección</option>
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs font-bold">
            ▼
          </div>
        </div>
      </div>

      {audienceType === 'grado' && (
        <div className="space-y-1.5 animate-in fade-in duration-200">
          <label htmlFor="audience_grade" className="block text-xs font-bold text-zinc-700">
            Seleccionar Grado Específico:
          </label>
          {distinctGrades.length > 0 ? (
            <select
              id="audience_grade"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px]"
            >
              <option value="">-- Todos los grados --</option>
              {distinctGrades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="audience_grade"
              type="text"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              placeholder="Ej: 4to Grado o 1er Año"
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 min-h-[44px]"
            />
          )}
        </div>
      )}

      {audienceType === 'seccion' && (
        <div className="space-y-1.5 animate-in fade-in duration-200">
          <label htmlFor="audience_section" className="block text-xs font-bold text-zinc-700">
            Seleccionar Sección Específica:
          </label>
          {courses.length > 0 ? (
            <select
              id="audience_section"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px]"
            >
              <option value="">-- Seleccionar sección --</option>
              {courses.map((c) => (
                <option key={c.id} value={`${c.name} (${c.section})`}>
                  {c.name} - Sección "{c.section}"
                </option>
              ))}
            </select>
          ) : (
            <input
              id="audience_section"
              type="text"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              placeholder="Ej: 4to Grado A"
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 min-h-[44px]"
            />
          )}
        </div>
      )}
    </div>
  )
}
