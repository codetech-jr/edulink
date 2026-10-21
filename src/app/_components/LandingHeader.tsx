import Link from 'next/link'
import { School, Menu, X } from 'lucide-react'

export function LandingHeader() {
  return (
    <>
      {/* Hidden checkbox for mobile menu toggle */}
      <input type="checkbox" id="mobile-menu-checkbox" className="peer hidden" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/70 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-900 to-primary-700 text-white shadow-sm shadow-primary-900/20">
                <School className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Edu<span className="text-primary">Link</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600" aria-label="Navegación principal">
              <a href="#caracteristicas" className="hover:text-slate-900 transition-colors duration-150">
                Características
              </a>
              <a href="#venezuela" className="hover:text-slate-900 transition-colors duration-150">
                Diseñado para Venezuela
              </a>
              <a href="#soporte" className="hover:text-slate-900 transition-colors duration-150">
                Soporte
              </a>
            </nav>

            {/* Header Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary-900/25 hover:bg-primary-hover transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Registrar Colegio
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <label 
              htmlFor="mobile-menu-checkbox" 
              className="md:hidden flex cursor-pointer select-none items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors duration-150 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
              aria-label="Abrir menú"
            >
              <Menu id="menu-icon" className="h-6 w-6 block" aria-hidden="true" />
              <X id="close-icon" className="h-6 w-6 hidden" aria-hidden="true" />
            </label>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div 
          id="mobile-menu" 
          className="hidden md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 px-4 py-6 shadow-xl space-y-4"
        >
          <nav className="flex flex-col gap-4 text-base font-medium text-slate-600" aria-label="Navegación móvil">
            <a href="#caracteristicas" className="px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors duration-150">
              Características
            </a>
            <a href="#venezuela" className="px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors duration-150">
              Diseñado para Venezuela
            </a>
            <a href="#soporte" className="px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors duration-150">
              Soporte
            </a>
          </nav>
          <hr className="border-slate-100" />
          <div className="flex flex-col gap-3">
            <Link 
              href="/login" 
              className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors duration-150"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register" 
              className="flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-base font-semibold text-white hover:bg-primary-hover shadow-sm transition-colors duration-150"
            >
              Registrar Colegio
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
