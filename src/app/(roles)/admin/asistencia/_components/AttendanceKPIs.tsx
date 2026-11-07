'use client'

import React from 'react'
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { AttendanceKPIsData, AttendanceViewTab } from '@/lib/types/attendance-admin'

interface AttendanceKPIsProps {
  kpis: AttendanceKPIsData
  tab: AttendanceViewTab
}

export function AttendanceKPIs({ kpis, tab }: AttendanceKPIsProps) {
  const getPeriodLabel = () => {
    if (tab === 'diario') return 'del día'
    if (tab === 'semanal') return 'de la semana'
    return 'del mes'
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:hidden">
      {/* 1. Tasa Global de Asistencia */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Asistencia Global
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {kpis.global_attendance_rate}%
          </span>
          <span className="text-xs text-slate-500 font-medium">
            efectiva
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 truncate">
          Sobre {kpis.evaluated_records} registros evaluados {getPeriodLabel()}
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-b-2xl opacity-80" />
      </div>

      {/* 2. Total Inasistencias (Faltas) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-rose-200 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Inasistencias (Faltas)
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
            {kpis.total_absences}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            injustificadas
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 truncate">
          Faltas sin justificar registradas {getPeriodLabel()}
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-b-2xl opacity-80" />
      </div>

      {/* 3. Justificadas y Retardos */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Justificadas / Retardos
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {kpis.total_justified}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            / {kpis.total_tardies} retardos
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 truncate">
          Permisos médicos o justificativos válidos
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-b-2xl opacity-80" />
      </div>

      {/* 4. Alumnos en Riesgo de Reprobar (<75%) */}
      <div className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-sm relative overflow-hidden transition-all ${
        kpis.students_at_risk > 0
          ? 'border-amber-300 hover:border-amber-400 bg-amber-50/20'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Alumnos en Riesgo (&lt;75%)
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-extrabold ${
            kpis.students_at_risk > 0 ? 'text-amber-700' : 'text-slate-800'
          }`}>
            {kpis.students_at_risk}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            alumnos
          </span>
        </div>
        <p className="text-xs text-amber-800 font-medium mt-1 truncate" title="Límite del 25% de inasistencias según Art. 109 del Reglamento de la Ley Orgánica de Educación (RLOE)">
          Límite Art. 109 RLOE (máx 25% faltas)
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-b-2xl opacity-80" />
      </div>
    </div>
  )
}
