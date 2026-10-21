'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/actions/auth-actions'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  ClipboardCheck,
  BookMarked,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

interface DocenteShellProps {
  displayName: string
  schoolName?: string
  children: React.ReactNode
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/docente',
    icon: LayoutDashboard,
  },
  {
    label: 'Control de Aula',
    href: '/docente/asistencia',
    icon: ClipboardCheck,
  },
  {
    label: 'Calificaciones',
    href: '/docente/calificaciones',
    icon: BookMarked,
  },
  {
    label: 'Conducta y Novedades',
    href: '/docente/conducta',
    icon: ShieldCheck,
  },
]

export function DocenteShell({
  displayName,
  schoolName,
  children,
}: DocenteShellProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Restaurar preferencia guardada en localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('edulink_docente_sidebar_collapsed')
      if (stored !== null) {
        setIsCollapsed(stored === 'true')
      }
    } catch {
      // Ignorar
    }
  }, [])

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('edulink_docente_sidebar_collapsed', String(next))
      } catch {
        // No-op
      }
      return next
    })
  }

  // Atajo de teclado: Ctrl + B o Cmd + B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleCollapsed()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const isActive = (href: string) => {
    if (href === '/docente') return pathname === '/docente'
    return pathname.startsWith(href)
  }

  const renderNavLinks = (collapsed: boolean, onLinkClick?: () => void) => (
    <nav className="flex flex-1 flex-col gap-1 px-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            title={collapsed ? item.label : undefined}
            className={cn(
              'group relative flex items-center rounded-xl text-[13.5px] font-medium transition-all duration-150',
              collapsed
                ? 'justify-center py-2.5 px-0'
                : 'gap-3 px-3 py-2.5',
              active
                ? 'bg-indigo-50/80 text-indigo-600 font-semibold shadow-sm'
                : 'text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900'
            )}
          >
            {active && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-indigo-600" />
            )}

            <Icon
              className={cn(
                'h-[19px] w-[19px] flex-shrink-0 transition-colors duration-150',
                active
                  ? 'text-indigo-600'
                  : 'text-zinc-400 group-hover:text-zinc-700'
              )}
              strokeWidth={active ? 2.2 : 1.8}
            />

            {!collapsed && <span className="truncate">{item.label}</span>}

            {collapsed && (
              <div className="absolute left-full ml-3 hidden group-hover:flex items-center z-50 pointer-events-none">
                <div className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-xl whitespace-nowrap animate-fade-in">
                  {item.label}
                </div>
              </div>
            )}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          'hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-30 border-r border-zinc-200/80 bg-white/95 backdrop-blur-xl pt-5 pb-4 transition-[width] duration-300 ease-in-out',
          isCollapsed ? 'md:w-[72px]' : 'md:w-64'
        )}
      >
        <div
          className={cn(
            'flex items-center pb-2 transition-all duration-300',
            isCollapsed ? 'justify-center px-2' : 'gap-2.5 px-4'
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm shadow-indigo-600/30 flex-shrink-0">
            <span className="text-base font-bold text-white tracking-wider">E</span>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[14.5px] font-bold tracking-tight text-zinc-900 truncate">
                EduLink
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 truncate">
                Portal Docente
              </span>
            </div>
          )}
        </div>

        <div className="mx-3 my-3.5 h-px bg-zinc-100" />

        {renderNavLinks(isCollapsed)}

        <div className="mt-auto border-t border-zinc-100 px-2 pt-3">
          <div
            className={cn(
              'mb-2 flex items-center transition-all duration-300',
              isCollapsed ? 'justify-center' : 'gap-2.5 px-2'
            )}
            title={isCollapsed ? `${displayName} (Docente)` : undefined}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-[12px] font-semibold text-zinc-700 flex-shrink-0 border border-zinc-200/60">
              {displayName.charAt(0).toUpperCase()}
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="truncate text-[13px] font-medium text-zinc-800">
                  {displayName}
                </span>
                <span className="text-[11px] text-zinc-400">Docente</span>
              </div>
            )}
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title={isCollapsed ? 'Cerrar sesión' : undefined}
              className={cn(
                'group relative flex w-full items-center rounded-xl text-[13px] font-medium text-zinc-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600',
                isCollapsed
                  ? 'justify-center py-2 px-0'
                  : 'gap-2.5 px-3 py-2'
              )}
            >
              <LogOut className="h-4 w-4 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.8} />
              {!isCollapsed && <span>Cerrar sesión</span>}

              {isCollapsed && (
                <div className="absolute left-full ml-3 hidden group-hover:flex items-center z-50 pointer-events-none">
                  <div className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-xl whitespace-nowrap">
                    Cerrar sesión
                  </div>
                </div>
              )}
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-zinc-900/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white pt-5 pb-4 shadow-2xl shadow-zinc-900/20 animate-fade-in-left">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>

            <div className="flex items-center gap-2.5 px-4 pb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
                <span className="text-base font-bold text-white">E</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[14.5px] font-bold text-zinc-900">
                  EduLink
                </span>
                <span className="text-[10px] font-semibold uppercase text-zinc-400">
                  Portal Docente
                </span>
              </div>
            </div>

            <div className="mx-3 my-3 h-px bg-zinc-100" />

            {renderNavLinks(false, () => setMobileOpen(false))}

            <div className="mt-auto border-t border-zinc-100 px-3 pt-3">
              <div className="mb-2 flex items-center gap-2.5 px-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-[12px] font-semibold text-zinc-700">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-[13px] font-medium text-zinc-800">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-zinc-400">Docente</span>
                </div>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.8} />
                  <span>Cerrar sesión</span>
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main Content ── */}
      <main
        className={cn(
          'transition-[padding-left] duration-300 ease-in-out min-h-screen flex flex-col',
          isCollapsed ? 'md:pl-[72px]' : 'md:pl-64'
        )}
      >
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-200/70 bg-white/80 px-4 md:px-8 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 bg-white shadow-sm md:hidden text-zinc-600"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" strokeWidth={1.8} />
            </button>

            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden md:inline-flex items-center justify-center h-8 w-8 rounded-lg border border-zinc-200/80 bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 shadow-sm transition-all active:scale-95"
              title={isCollapsed ? 'Expandir menú lateral (Ctrl+B)' : 'Colapsar menú lateral (Ctrl+B)'}
              aria-label={isCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
            >
              {isCollapsed ? (
                <ChevronsRight className="h-4 w-4" strokeWidth={2} />
              ) : (
                <ChevronsLeft className="h-4 w-4" strokeWidth={2} />
              )}
            </button>

            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 leading-none">
                Plataforma Escolar
              </span>
              <span className="text-[13.5px] font-bold text-zinc-800 leading-tight line-clamp-1">
                {schoolName || 'EduLink Portal Docente'}
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-[13px] text-zinc-600 sm:block">
              Hola, <strong className="text-zinc-900 font-semibold">{displayName}</strong>{' '}
              <span className="text-zinc-400 font-normal">(Docente)</span>
            </span>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-[12px] font-bold text-indigo-600 border border-indigo-200/60 shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
