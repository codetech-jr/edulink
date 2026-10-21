import React from 'react'

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-zinc-50/70 p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse">
      {/* Cabecera / Saludo Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/60">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-zinc-200 rounded-md" />
          <div className="h-8 w-64 bg-zinc-300 rounded-lg" />
          <div className="h-4 w-48 bg-zinc-200 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-zinc-200 rounded-xl" />
          <div className="h-10 w-36 bg-zinc-300 rounded-xl" />
        </div>
      </div>

      {/* Barra de Cobranzas / Alertas Skeleton */}
      <div className="h-16 w-full bg-zinc-200/80 rounded-2xl" />

      {/* Grid de 4 KPIs Financieros Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-zinc-200 rounded" />
              <div className="h-8 w-8 bg-zinc-100 rounded-lg" />
            </div>
            <div className="h-7 w-32 bg-zinc-300 rounded" />
            <div className="h-3 w-20 bg-zinc-100 rounded" />
          </div>
        ))}
      </div>

      {/* Layout Gráfico y Feeds Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-48 bg-zinc-300 rounded" />
            <div className="h-4 w-20 bg-zinc-200 rounded" />
          </div>
          <div className="h-64 bg-zinc-100/70 rounded-xl" />
        </div>
        <div className="p-6 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
          <div className="h-5 w-36 bg-zinc-300 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-16 bg-zinc-100/80 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
