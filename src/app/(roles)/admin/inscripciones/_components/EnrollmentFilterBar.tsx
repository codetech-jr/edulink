'use client'

import React from 'react'
import { Search, XCircle } from 'lucide-react'

interface EnrollmentFilterBarProps {
  activeTab: 'pendiente' | 'aprobado' | 'rechazado' | 'all'
  setActiveTab: (tab: 'pendiente' | 'aprobado' | 'rechazado' | 'all') => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  countPendientes: number
  countAprobadas: number
  countRechazadas: number
  totalCount: number
}

export function EnrollmentFilterBar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  countPendientes,
  countAprobadas,
  countRechazadas,
  totalCount,
}: EnrollmentFilterBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 sm:p-5 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Tabs de Estado */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100/90 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('pendiente')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] flex items-center gap-1.5 ${
            activeTab === 'pendiente'
              ? 'bg-white text-gray-900 shadow-2xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>Pendientes</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
            {countPendientes}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('aprobado')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] flex items-center gap-1.5 ${
            activeTab === 'aprobado'
              ? 'bg-white text-gray-900 shadow-2xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>Aprobadas</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
            {countAprobadas}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rechazado')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] flex items-center gap-1.5 ${
            activeTab === 'rechazado'
              ? 'bg-white text-gray-900 shadow-2xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>Rechazadas</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800">
            {countRechazadas}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
            activeTab === 'all'
              ? 'bg-white text-gray-900 shadow-2xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Todas ({totalCount})
        </button>
      </div>

      {/* Input de Búsqueda */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por alumno, cédula o representante..."
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[42px]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Limpiar búsqueda"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
