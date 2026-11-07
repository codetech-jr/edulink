'use client'

import React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Calendar,
  CalendarRange,
  BarChart3,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { AttendanceViewTab, CourseOption } from '@/lib/types/attendance-admin'

interface AttendanceFiltersProps {
  currentTab: AttendanceViewTab
  targetDate: string
  weekStartStr: string
  weekEndStr: string
  month: number
  year: number
  selectedCourseId: string
  courses: CourseOption[]
  searchTerm: string
  onSearchChange: (val: string) => void
  filterMode: 'all' | 'absent_only' | 'risk_only'
  onFilterModeChange: (mode: 'all' | 'absent_only' | 'risk_only') => void
}

const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

const YEARS = [2024, 2025, 2026, 2027]

export function AttendanceFilters({
  currentTab,
  targetDate,
  weekStartStr,
  weekEndStr,
  month,
  year,
  selectedCourseId,
  courses,
  searchTerm,
  onSearchChange,
  filterMode,
  onFilterModeChange,
}: AttendanceFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleTabChange = (tab: AttendanceViewTab) => {
    updateQueryParams({ tab })
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateQueryParams({ date: e.target.value })
  }

  const handleWeekShift = (offsetDays: number) => {
    // Calcular nueva fecha base desplazada 7 días
    const parts = (targetDate || weekStartStr).split('-').map(Number)
    const baseDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0)
    baseDate.setDate(baseDate.getDate() + offsetDays)
    const newDateStr = baseDate.toISOString().split('T')[0]
    updateQueryParams({ date: newDateStr })
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({ month: e.target.value })
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({ year: e.target.value })
  }

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    updateQueryParams({ course_id: val === 'all' ? null : val })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4 print:hidden">
      {/* 1. Selector de Pestañas (Diario / Semanal / Mensual) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="inline-flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleTabChange('diario')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentTab === 'diario'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Diario</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('semanal')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentTab === 'semanal'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>Semanal</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('mensual')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentTab === 'mensual'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Mensual (Contador MPPE)</span>
          </button>
        </div>

        {/* Controles de Tiempo dinámicos según pestaña */}
        <div className="flex items-center gap-2">
          {currentTab === 'diario' && (
            <div className="flex items-center gap-2">
              <label htmlFor="date-input" className="text-xs font-bold text-slate-500 whitespace-nowrap">
                Fecha:
              </label>
              <input
                id="date-input"
                type="date"
                value={targetDate}
                onChange={handleDateChange}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {currentTab === 'semanal' && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleWeekShift(-7)}
                className="p-1.5 rounded-lg hover:bg-white hover:shadow-xs text-slate-600 transition-all"
                title="Semana anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 px-1">
                {weekStartStr.slice(5)} al {weekEndStr.slice(5)}
              </span>
              <button
                type="button"
                onClick={() => handleWeekShift(7)}
                className="p-1.5 rounded-lg hover:bg-white hover:shadow-xs text-slate-600 transition-all"
                title="Semana siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {currentTab === 'mensual' && (
            <div className="flex items-center gap-2">
              <select
                aria-label="Seleccionar mes"
                value={month}
                onChange={handleMonthChange}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                aria-label="Seleccionar año"
                value={year}
                onChange={handleYearChange}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 2. Filtros de Búsqueda, Cursos y Faltas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Buscador en tiempo real */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre del alumno o cédula..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filtro por Curso */}
        <div className="flex items-center gap-2">
          <select
            aria-label="Filtrar por Curso o Sección"
            value={selectedCourseId}
            onChange={handleCourseChange}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos los Cursos / Secciones</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || `${c.grade_level}° ${c.section}`}
              </option>
            ))}
          </select>
        </div>

        {/* Botones de filtro rápido de riesgo */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onFilterModeChange('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onFilterModeChange('absent_only')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'absent_only'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            Solo con Faltas
          </button>
          <button
            type="button"
            onClick={() => onFilterModeChange('risk_only')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'risk_only'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            En Riesgo (&lt;75%)
          </button>
        </div>
      </div>
    </div>
  )
}
