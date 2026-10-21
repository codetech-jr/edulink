'use client'

import React from 'react'
import { Search, Download, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export type FilterStatus = 'todos' | 'al_dia' | 'pendiente' | 'moroso'

export interface CourseOption {
  id: string
  label: string
}

interface MorosidadFiltersProps {
  selectedStatus: FilterStatus
  onStatusChange: (status: FilterStatus) => void
  statusCounts: {
    todos: number
    al_dia: number
    pendiente: number
    moroso: number
  }
  selectedCourse: string
  onCourseChange: (courseId: string) => void
  courses: CourseOption[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onExportCSV: () => void
}

export function MorosidadFilters({
  selectedStatus,
  onStatusChange,
  statusCounts,
  selectedCourse,
  onCourseChange,
  courses,
  searchQuery,
  onSearchChange,
  onExportCSV,
}: MorosidadFiltersProps) {
  const tabs: Array<{
    id: FilterStatus
    label: string
    count: number
    icon?: React.ElementType
    activeBadgeClass: string
  }> = [
    {
      id: 'todos',
      label: 'Todos',
      count: statusCounts.todos,
      activeBadgeClass: 'bg-zinc-200 text-zinc-800',
    },
    {
      id: 'al_dia',
      label: 'Al día',
      count: statusCounts.al_dia,
      icon: CheckCircle2,
      activeBadgeClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'pendiente',
      label: 'Por verificar',
      count: statusCounts.pendiente,
      icon: Clock,
      activeBadgeClass: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'moroso',
      label: 'Morosos',
      count: statusCounts.moroso,
      icon: AlertCircle,
      activeBadgeClass: 'bg-rose-100 text-rose-800',
    },
  ]

  return (
    <div className="space-y-3">
      {/* Barra Superior: Tabs de Estado + Botón CSV */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs de Estado */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 rounded-xl overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = selectedStatus === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[44px] sm:min-h-[36px] ${
                  isActive
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
                aria-pressed={isActive}
              >
                {Icon && (
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isActive
                        ? tab.id === 'al_dia'
                          ? 'text-emerald-600'
                          : tab.id === 'pendiente'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                        : 'text-zinc-400'
                    }`}
                  />
                )}
                <span>{tab.label}</span>
                <span
                  className={`ml-0.5 px-1.5 py-0.5 rounded-full text-2xs font-mono font-medium ${
                    isActive ? tab.activeBadgeClass : 'bg-zinc-200/70 text-zinc-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Botón Exportar CSV */}
        <Button
          type="button"
          variant="secondary"
          onClick={onExportCSV}
          className="gap-1.5 self-start sm:self-auto min-h-[44px] sm:min-h-[38px] text-xs font-semibold"
          title="Exportar listado actual a formato CSV"
        >
          <Download className="h-4 w-4 text-zinc-500" />
          <span>Exportar CSV</span>
        </Button>
      </div>

      {/* Barra Inferior: Buscador + Dropdown de Grado */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Buscador */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por alumno, cédula o representante..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 rounded-xl bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors min-h-[44px] sm:min-h-[38px]"
          />
        </div>

        {/* Selector de Grado / Sección */}
        <div className="sm:w-64">
          <select
            value={selectedCourse}
            onChange={(e) => onCourseChange(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-white text-zinc-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors min-h-[44px] sm:min-h-[38px]"
            aria-label="Filtrar por grado o sección"
          >
            <option value="todos">Todos los Grados / Secciones</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
