import React from 'react'

export default function RepresentanteLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans animate-pulse">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-30 bg-white/95 border-b border-zinc-200/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-200" />
            <div className="h-5 w-24 bg-zinc-200 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-zinc-200 rounded-full" />
            <div className="h-8 w-8 bg-zinc-200 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner de Perfil y Saldo Global Skeleton */}
        <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-32 bg-zinc-700 rounded" />
          </div>
          <div className="h-7 w-48 bg-zinc-700 rounded-lg" />
          <div className="h-3 w-36 bg-zinc-800 rounded" />

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-zinc-700 rounded" />
              <div className="h-6 w-28 bg-zinc-600 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-zinc-700 rounded" />
              <div className="h-6 w-28 bg-zinc-600 rounded" />
            </div>
          </div>
        </div>

        {/* Tabs Bar Skeleton */}
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
          <div className="h-9 w-28 bg-zinc-200 rounded-xl" />
          <div className="h-9 w-28 bg-zinc-100 rounded-xl" />
          <div className="h-9 w-28 bg-zinc-100 rounded-xl" />
        </div>

        {/* Tarjeta de Reporte de Pago Skeleton */}
        <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-40 bg-zinc-300 rounded" />
            <div className="h-6 w-24 bg-zinc-200 rounded-lg" />
          </div>
          <div className="h-10 w-full bg-zinc-100 rounded-xl" />
        </div>

        {/* Tarjetas de Representados Skeleton */}
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-200" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-36 bg-zinc-300 rounded" />
                    <div className="h-3 w-24 bg-zinc-200 rounded" />
                  </div>
                </div>
                <div className="h-7 w-28 bg-zinc-200 rounded-xl" />
              </div>
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="h-12 bg-zinc-50 rounded-xl" />
                <div className="h-12 bg-zinc-50 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
