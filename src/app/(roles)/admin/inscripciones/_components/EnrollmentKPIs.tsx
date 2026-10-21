'use client'

import React from 'react'
import { Clock, CheckCircle2, XCircle, UserPlus } from 'lucide-react'

interface EnrollmentKPIsProps {
  countPendientes: number
  countAprobadas: number
  countRechazadas: number
  totalCount: number
}

export function EnrollmentKPIs({
  countPendientes,
  countAprobadas,
  countRechazadas,
  totalCount,
}: EnrollmentKPIsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pendientes</span>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">{countPendientes}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Por evaluar y admitir</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aprobadas</span>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">{countAprobadas}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Estudiantes admitidos</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rechazadas</span>
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-rose-700 mt-2">{countRechazadas}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Postulaciones no admitidas</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <UserPlus className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalCount}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Registros históricos</p>
      </div>
    </div>
  )
}
