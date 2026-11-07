'use client'

import React from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  LayoutDashboard,
  CalendarCheck,
  Printer,
  FileSpreadsheet,
} from 'lucide-react'

interface AttendanceHeaderProps {
  schoolName: string
}

export function AttendanceHeader({ schoolName }: AttendanceHeaderProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4 print:hidden">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 hover:text-slate-800 transition-colors"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="font-semibold text-indigo-600 flex items-center gap-1.5">
          <CalendarCheck className="w-3.5 h-3.5 text-indigo-500" />
          Control de Asistencia
        </span>
      </nav>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Control de Asistencia e Inasistencias
            </h1>
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              MPPE / LOPNNA
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {schoolName} &bull; Monitoreo administrativo diario, semanal y acumulado mensual de inasistencias escolares.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Imprimir reporte oficial de asistencia"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimir Reporte</span>
          </button>
        </div>
      </div>
    </div>
  )
}
