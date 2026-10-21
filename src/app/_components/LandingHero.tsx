import Link from 'next/link'
import { ArrowRight, TrendingUp, Users, Coins, BookOpen, UserCheck } from 'lucide-react'

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24 bg-slate-50" aria-labelledby="hero-title">
      {/* Subtle Grid and Gradient Blobs */}
      <div className="absolute inset-0 -z-10 bg-slate-50/50">
        <div className="absolute inset-0 bg-grid-slate-light [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-80" />
      </div>
      <div className="absolute top-[-10%] left-[-10%] h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] rounded-full bg-primary-900/10 blur-3xl -z-10" />
      <div className="absolute top-[20%] right-[-10%] h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] rounded-full bg-secondary/10 blur-3xl -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Product Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-200/80 bg-primary-50 px-3.5 py-1 text-xs font-semibold text-primary-900 backdrop-blur-sm shadow-sm mb-6">
            <span className="flex h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
            El primer SaaS escolar adaptado a la realidad venezolana
          </div>

          {/* Tagline */}
          <h1 id="hero-title" className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl text-wrap-balance leading-[1.1]">
            El sistema de gestión escolar inteligente para la{' '}
            <span className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 bg-clip-text text-transparent">
              Venezuela de hoy
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600 text-pretty leading-relaxed">
            Automatiza la conciliación de Pago Móvil en segundos, controla la morosidad con alertas automáticas y simplifica las asistencias desde el celular. Todo integrado para directores, docentes y familias en un solo lugar.
          </p>

          {/* CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0">
            <Link 
              id="cta-register"
              href="/register" 
              className="group inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-primary-900/25 hover:bg-primary-hover transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary w-full sm:w-auto duration-150"
            >
              Registrar mi Plantel
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link 
              id="cta-login"
              href="/login" 
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 w-full sm:w-auto duration-150"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>

        {/* Dashboard High-Fidelity CSS Mockup */}
        <div className="mt-16 sm:mt-20 relative mx-auto max-w-5xl rounded-2xl border border-slate-200/80 bg-slate-900/5 p-2 shadow-2xl shadow-primary-900/15 backdrop-blur-sm">
          <div className="rounded-xl border border-slate-800/90 bg-slate-950 overflow-hidden shadow-2xl animate-float-dashboard">
            {/* Mockup Top Window Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/80 block" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80 block" />
                <span className="h-3 w-3 rounded-full bg-green-500/80 block" />
              </div>
              <div className="rounded-md bg-slate-950 px-8 py-1 text-xs text-slate-500 font-medium border border-slate-800">
                app.edulink.com.ve/dashboard
              </div>
              <div className="flex h-3 w-3 items-center" />
            </div>

            {/* Dashboard Inner App Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] min-h-[350px] sm:min-h-[480px]">
              {/* Left Sidebar Mockup */}
              <aside className="hidden md:flex flex-col border-r border-slate-800 p-4 bg-slate-950">
                <div className="flex items-center gap-2 mb-8">
                  <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                    EL
                  </div>
                  <span className="text-xs font-bold text-slate-200">Portal Admin</span>
                </div>
                <nav className="flex flex-col gap-2 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white">
                    <TrendingUp className="h-3.5 w-3.5 text-primary-400" aria-hidden="true" />
                    Vista General
                  </span>
                  <span className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/50">
                    <Users className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                    Estudiantes
                  </span>
                  <span className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/50">
                    <Coins className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                    Pagos y Conciliación
                  </span>
                  <span className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/50">
                    <BookOpen className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                    Calificaciones
                  </span>
                  <span className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/50">
                    <UserCheck className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                    Asistencias
                  </span>
                </nav>
              </aside>

              {/* Right Dashboard Area Mockup */}
              <main className="p-4 sm:p-6 flex flex-col gap-6 bg-slate-950/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Colegio San Francisco de Asís</h3>
                    <p className="text-[10px] text-slate-500">Período Académico 2025–2026</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 font-mono">
                      Tasa BCV: 36.50 Bs/USD
                    </div>
                    <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                      UA
                    </div>
                  </div>
                </div>

                {/* Stats Grid Mockup */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Morosidad Actual</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-slate-100 font-mono">12.4%</span>
                      <span className="text-[9px] text-emerald-400 font-semibold">-4.2% esta sem.</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: '12.4%' }} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Por Conciliar (Pago Móvil)</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-bold text-slate-100 font-mono">4</span>
                      <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2">Bs. 3,650.00 reportados hoy</p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Asistencia General</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-slate-100 font-mono">94.8%</span>
                      <span className="text-[9px] text-slate-500">28 secciones</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94.8%' }} />
                    </div>
                  </div>
                </div>

                {/* Table Mockup */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/30">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Últimos Pagos Reportados</span>
                  </div>
                  <div className="divide-y divide-slate-800/80 text-xs font-mono">
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-slate-300 text-[11px]">Yusmeli Rodríguez (Representante)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[10px]">1er Año A</span>
                        <span className="text-slate-200 font-bold text-[11px]">$25.00</span>
                        <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 font-semibold">Conciliado</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-slate-300 text-[11px]">Carlos Mendoza (Representante)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[10px]">3er Año B</span>
                        <span className="text-slate-200 font-bold text-[11px]">$50.00</span>
                        <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 font-semibold">Pendiente</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-slate-300 text-[11px]">Milagros Pérez (Representante)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[10px]">Preescolar B</span>
                        <span className="text-slate-200 font-bold text-[11px]">$20.00</span>
                        <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 font-semibold">Conciliado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
