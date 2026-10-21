import React from 'react'

export default function DocenteLoading() {
  return (
    <div className="min-h-screen bg-zinc-50/70 p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-zinc-200 rounded" />
          <div className="h-8 w-60 bg-zinc-300 rounded-lg" />
          <div className="h-3 w-40 bg-zinc-200 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-zinc-200 rounded-xl" />
        </div>
      </div>

      {/* Grid de Cursos / Asignaturas Asignadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-emerald-100 rounded-md" />
              <div className="h-6 w-16 bg-zinc-100 rounded-full" />
            </div>
            <div className="h-6 w-44 bg-zinc-300 rounded" />
            <div className="h-3 w-32 bg-zinc-200 rounded" />
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
              <div className="h-4 w-20 bg-zinc-200 rounded" />
              <div className="h-8 w-24 bg-zinc-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
