import React from 'react'
import { Users, User, Heart, AlertTriangle } from 'lucide-react'
import { InstitutionalSummary } from '@/lib/types/mppe-statistics'

interface StatisticsKPIsProps {
  summary: InstitutionalSummary
  monthName: string
  cutOffDate: string
}

export function StatisticsKPIs({ summary, monthName, cutOffDate }: StatisticsKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Matrícula Total */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            Matrícula Total
          </span>
          <span className="text-3xl font-extrabold text-gray-900 mt-1 block">
            {summary.totalStudents}
          </span>
          <span className="text-xs text-gray-500 mt-1 block font-medium">
            Alumnos activos registrados
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Varones (V) */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block">
            Varones (V)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-blue-700">
              {summary.totalVarones}
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {summary.percentVarones}%
            </span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block font-medium">
            Población masculina
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-100/60 text-blue-700 flex items-center justify-center shrink-0">
          <User className="w-6 h-6" />
        </div>
      </div>

      {/* 3. Hembras (H) */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-purple-500 uppercase tracking-wider block">
            Hembras (H)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-purple-700">
              {summary.totalHembras}
            </span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              {summary.percentHembras}%
            </span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block font-medium">
            Población femenina
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <Heart className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Datos Incompletos / Alerta MPPE */}
      <div className={`rounded-2xl p-5 border shadow-sm flex items-center justify-between transition-colors ${
        summary.incompleteDataTotal > 0
          ? 'bg-amber-50/60 border-amber-200 text-amber-900'
          : 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
      }`}>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider block">
            {summary.incompleteDataTotal > 0 ? 'Sin Datos MPPE' : 'Expedientes al 100%'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold">
              {summary.incompleteDataTotal}
            </span>
            {summary.incompleteDataTotal > 0 && (
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Pendientes
              </span>
            )}
          </div>
          <span className="text-xs opacity-80 mt-1 block font-medium">
            {summary.incompleteDataTotal > 0
              ? 'Falta fecha nac. o sexo'
              : 'Todos listos para el informe'}
          </span>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          summary.incompleteDataTotal > 0
            ? 'bg-amber-100 text-amber-700'
            : 'bg-emerald-100 text-emerald-700'
        }`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
