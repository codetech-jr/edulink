import React from 'react'

export default function EstudianteLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans animate-pulse">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-30 bg-white/95 border-b border-zinc-200/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-200" />
            <div className="h-5 w-24 bg-zinc-200 rounded-md" />
          </div>
          <div className="h-8 w-20 bg-zinc-200 rounded-full" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner del Estudiante */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 rounded-2xl p-6 text-white space-y-3">
          <div className="h-4 w-32 bg-indigo-700/60 rounded" />
          <div className="h-7 w-56 bg-indigo-700 rounded-lg" />
          <div className="h-4 w-40 bg-indigo-800 rounded" />
        </div>

        {/* Resumen Académico Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-2"
            >
              <div className="h-3 w-20 bg-zinc-200 rounded" />
              <div className="h-7 w-28 bg-zinc-300 rounded" />
            </div>
          ))}
        </div>

        {/* Asignaturas y Calificaciones */}
        <div className="p-6 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
          <div className="h-5 w-48 bg-zinc-300 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-14 bg-zinc-50 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
