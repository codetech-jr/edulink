import { School } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="bg-white border-t border-slate-100 py-12" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Pie de página</h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <School className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              Edu<span className="text-primary">Link</span>
            </span>
          </div>
          
          {/* Support Phone / Email */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-xs font-semibold text-slate-500">
            <span>Soporte: +58 (212) 555-LINK</span>
            <span>Correo: soporte@edulink.com.ve</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} EduLink. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <span>Hecho en Venezuela con orgullo 🇻🇪</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
