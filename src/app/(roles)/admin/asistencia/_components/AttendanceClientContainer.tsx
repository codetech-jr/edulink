'use client'

import React, { useState, useMemo } from 'react'
import { AdminAttendanceReport } from '@/lib/types/attendance-admin'
import { AttendanceFilters } from './AttendanceFilters'
import { DailyAttendanceView } from './DailyAttendanceView'
import { WeeklyAttendanceView } from './WeeklyAttendanceView'
import { MonthlyAttendanceView } from './MonthlyAttendanceView'

interface AttendanceClientContainerProps {
  report: AdminAttendanceReport
}

export function AttendanceClientContainer({ report }: AttendanceClientContainerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'absent_only' | 'risk_only'>('all')

  const normalizedSearch = searchTerm.trim().toLowerCase()

  // 1. Filtrado para Vista DIARIA
  const filteredDailyData = useMemo(() => {
    return report.dailyData.filter((item) => {
      // Filtro de búsqueda
      if (normalizedSearch) {
        const matchesName = item.full_name.toLowerCase().includes(normalizedSearch)
        const matchesCedula = item.cedula?.toLowerCase().includes(normalizedSearch)
        const matchesCourse = item.course_name.toLowerCase().includes(normalizedSearch)
        const matchesParent = item.parent_name?.toLowerCase().includes(normalizedSearch)
        if (!matchesName && !matchesCedula && !matchesCourse && !matchesParent) {
          return false
        }
      }

      // Filtro de estado / riesgo
      if (filterMode === 'absent_only' || filterMode === 'risk_only') {
        return item.status === 'ausente'
      }

      return true
    })
  }, [report.dailyData, normalizedSearch, filterMode])

  // 2. Filtrado para Vista SEMANAL
  const filteredWeeklyData = useMemo(() => {
    return report.weeklyData.filter((item) => {
      if (normalizedSearch) {
        const matchesName = item.full_name.toLowerCase().includes(normalizedSearch)
        const matchesCedula = item.cedula?.toLowerCase().includes(normalizedSearch)
        const matchesCourse = item.course_name.toLowerCase().includes(normalizedSearch)
        const matchesParent = item.parent_name?.toLowerCase().includes(normalizedSearch)
        if (!matchesName && !matchesCedula && !matchesCourse && !matchesParent) {
          return false
        }
      }

      if (filterMode === 'absent_only') {
        return item.absent_count > 0
      }

      if (filterMode === 'risk_only') {
        return item.attendance_percentage < 75 && item.total_records > 0
      }

      return true
    })
  }, [report.weeklyData, normalizedSearch, filterMode])

  // 3. Filtrado para Vista MENSUAL
  const filteredMonthlyData = useMemo(() => {
    return report.monthlyData.filter((item) => {
      if (normalizedSearch) {
        const matchesName = item.full_name.toLowerCase().includes(normalizedSearch)
        const matchesCedula = item.cedula?.toLowerCase().includes(normalizedSearch)
        const matchesCourse = item.course_name.toLowerCase().includes(normalizedSearch)
        const matchesParent = item.parent_name?.toLowerCase().includes(normalizedSearch)
        if (!matchesName && !matchesCedula && !matchesCourse && !matchesParent) {
          return false
        }
      }

      if (filterMode === 'absent_only') {
        return item.absent_count > 0
      }

      if (filterMode === 'risk_only') {
        return item.risk_level === 'critico'
      }

      return true
    })
  }, [report.monthlyData, normalizedSearch, filterMode])

  return (
    <div className="space-y-4">
      {/* Filtros superiores */}
      <AttendanceFilters
        currentTab={report.tab}
        targetDate={report.targetDate}
        weekStartStr={report.weekStartStr}
        weekEndStr={report.weekEndStr}
        month={report.month}
        year={report.year}
        selectedCourseId={report.selectedCourseId}
        courses={report.courses}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterMode={filterMode}
        onFilterModeChange={setFilterMode}
      />

      {/* Cabecera institucional para impresión oficial */}
      <div className="hidden print:block mb-4 border-b-2 border-slate-900 pb-3">
        <div className="text-center space-y-0.5">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-700">
            República Bolivariana de Venezuela &bull; Ministerio del Poder Popular para la Educación
          </p>
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
            {report.schoolName}
          </h2>
          <p className="text-[10px] text-slate-600 font-mono">
            RIF: {report.schoolRif} &bull; Coordinación de Control de Estudios y Evaluación
          </p>
          <div className="pt-1.5">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
              REPORTE DE CONTROL DE ASISTENCIA E INASISTENCIAS &bull; MODALIDAD {report.tab.toUpperCase()}
            </h3>
            <p className="text-[10px] text-slate-600 font-semibold">
              {report.tab === 'diario' && `Fecha: ${report.targetDate}`}
              {report.tab === 'semanal' && `Semana del ${report.weekStartStr} al ${report.weekEndStr}`}
              {report.tab === 'mensual' && `Mes: ${report.monthName} ${report.year}`}
              {report.selectedCourseId !== 'all' &&
                ` • Curso: ${report.courses.find((c) => c.id === report.selectedCourseId)?.name || 'Seleccionado'}`}
            </p>
          </div>
        </div>

        {/* Resumen institucional compacto de 1 línea para el expediente */}
        <div className="mt-2.5 pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] font-semibold text-slate-800">
          <span>Matrícula en Reporte: {report.kpis.total_students} alumnos</span>
          <span>Asistencia Global: {report.kpis.global_attendance_rate}%</span>
          <span>Total Inasistencias: {report.kpis.total_absences}</span>
          <span>Alumnos en Riesgo (&lt;75%): {report.kpis.students_at_risk}</span>
        </div>
      </div>

      {/* Contenido según pestaña */}
      {report.tab === 'diario' && (
        <DailyAttendanceView
          data={filteredDailyData}
          schoolName={report.schoolName}
          targetDate={report.targetDate}
        />
      )}

      {report.tab === 'semanal' && (
        <WeeklyAttendanceView
          data={filteredWeeklyData}
          schoolName={report.schoolName}
          weekStartStr={report.weekStartStr}
          weekEndStr={report.weekEndStr}
        />
      )}

      {report.tab === 'mensual' && (
        <MonthlyAttendanceView
          data={filteredMonthlyData}
          schoolName={report.schoolName}
          monthName={report.monthName}
          year={report.year}
        />
      )}

      {/* Pie de firmas para impresión oficial */}
      <div className="hidden print:grid grid-cols-2 gap-16 mt-10 pt-4 text-center text-[10px] break-inside-avoid">
        <div className="border-t border-slate-900 pt-1.5">
          <p className="font-bold text-slate-900">Coordinación de Control de Estudios y Evaluación</p>
          <p className="text-slate-500">Firma y Cédula</p>
        </div>
        <div className="border-t border-slate-900 pt-1.5">
          <p className="font-bold text-slate-900">Dirección del Plantel</p>
          <p className="text-slate-500">Firma y Sello Húmedo</p>
        </div>
      </div>
    </div>
  )
}
