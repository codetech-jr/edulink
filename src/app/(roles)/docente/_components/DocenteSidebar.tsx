'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/actions/auth-actions'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  ClipboardCheck,
  BookMarked,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'

interface DocenteSidebarProps {
  displayName: string
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

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[number]
  isActive: boolean
  onClick?: () => void
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150',
        isActive
          ? 'bg-indigo-50 text-indigo-600 font-semibold'
          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
      )}
    >
      <Icon
        className={cn(
          'h-[18px] w-[18px] flex-shrink-0 transition-colors duration-150',
          isActive
            ? 'text-indigo-600'
            : 'text-zinc-400 group-hover:text-zinc-600'
        )}
        strokeWidth={isActive ? 2.2 : 1.8}
      />
      {item.label}
    </Link>
  )
}

export function DocenteSidebar({ displayName }: DocenteSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/docente') return pathname === '/docente'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 pb-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <span className="text-sm font-bold text-white">E</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold tracking-tight text-zinc-900">
            EduLink
          </span>
          <span className="text-[10.5px] font-medium text-zinc-400 leading-none">
            Panel Docente
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="mx-3 my-4 h-px bg-zinc-100" />

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* Bottom Section: User + Logout */}
      <div className="mt-auto border-t border-zinc-100 px-3 pb-4 pt-4">
        <div className="mb-3 flex items-center gap-2.5 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-[12px] font-semibold text-zinc-600">
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
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-zinc-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.8} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-30 border-r border-zinc-200/80 bg-white/80 backdrop-blur-xl pt-6">
        {sidebarContent}
      </aside>

      {/* ── Mobile Toggle Button ────────────────────────── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/80 bg-white/90 backdrop-blur-sm shadow-sm md:hidden"
        aria-label="Abrir menú"
        aria-expanded={mobileOpen}
      >
        <Menu className="h-5 w-5 text-zinc-600" strokeWidth={1.8} />
      </button>

      {/* ── Mobile Overlay ──────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-zinc-900/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white pt-6 shadow-2xl shadow-zinc-900/10 animate-fade-in-left">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>

            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
