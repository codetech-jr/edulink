import Link from 'next/link'
import { Sparkles, ShieldCheck } from 'lucide-react'

export function LandingCTA() {
  return (
    <section id="soporte" className="py-16 sm:py-24 bg-slate-50/50" aria-labelledby="cta-final-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-slate-900 px-6 py-16 shadow-2xl rounded-3xl sm:px-16 md:py-24 flex flex-col items-center text-center">
          {/* Subtle background effects for final CTA */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_20rem_at_top,rgba(30,58,138,0.3),transparent)]" />
          <div className="absolute inset-0 -z-10 bg-grid-white bg-grid [mask-image:radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent)]" />

          <Sparkles className="h-10 w-10 text-primary-300 mb-6 animate-pulse" aria-hidden="true" />
          
          <h2 id="cta-final-title" className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl text-wrap-balance leading-tight">
            ¿Listo para transformar la gestión de tu colegio?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-slate-300 text-sm sm:text-base leading-relaxed text-pretty">
            Digitaliza procesos hoy mismo. Comienza a registrar tu institución en menos de cinco minutos de forma totalmente gratuita y descubre la nueva forma de organizar tu plantel.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link 
              id="cta-final-register"
              href="/register" 
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-950 shadow-sm hover:bg-slate-100 hover:text-slate-900 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white w-full sm:w-auto duration-150"
            >
              Registrar mi Plantel
            </Link>
            <Link 
              id="cta-final-login"
              href="/login" 
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-6 py-3.5 text-base font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 w-full sm:w-auto duration-150"
            >
              Iniciar Sesión
            </Link>
          </div>

          {/* Security/Trust indicator */}
          <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span>Datos protegidos y conexión cifrada SSL.</span>
          </div>
        </div>
      </div>
    </section>
  )
}
