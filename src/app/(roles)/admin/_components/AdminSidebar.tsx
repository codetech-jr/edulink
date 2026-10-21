'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/actions/auth-actions'
import { cn } from '@/utils/cn'
import { isDirectorOnly, type AppRole } from '@/lib/permissions'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  AlertCircle,
  Receipt,
  Megaphone,
  BookOpen,
  UserCog,
  UserPlus,
  LogOut,
  Menu,
  X,
  Lock,
} from 'lucide-react'

interface AdminSidebarProps {
  displayName: string
  roleLabel: string
  role: AppRole
}

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
  directorOnly?: boolean  // Si true, se oculta para coordinadores
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Alumnado',
    href: '/admin/students',
    icon: Users,
  },
  {
    label: 'Inscripciones',
    href: '/admin/inscripciones',
    icon: UserPlus,
  },
  {
    label: 'Control Pagos',
    href: '/admin/payments',
    icon: CreditCard,
  },
  {
    label: 'Morosidad',
    href: '/admin/morosidad',
    icon: AlertCircle,
  },
  {
    label: 'Aranceles',
    href: '/admin/billing',
    icon: Receipt,
  },
  {
    label: 'Cursos',
    href: '/admin/courses',
    icon: BookOpen,
  },
  {
    label: 'Comunicados',
    href: '/admin/comunicados',
    icon: Megaphone,
  },
  {
    label: 'Usuarios',
    href: '/admin/usuarios',
    icon: UserCog,
    directorOnly: true,  // Solo el director puede gestionar usuarios
  },
]

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem
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

export function AdminSidebar({ displayName, roleLabel, role }: AdminSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDirector = isDirectorOnly(role)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  // Filtrar ítems según el rol: coordinador no ve los directorOnly
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.directorOnly || isDirector
  )

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
            Panel Administrativo
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="mx-3 my-4 h-px bg-zinc-100" />

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* Bottom Section: Role badge + User + Logout */}
      <div className="mt-auto border-t border-zinc-100 px-3 pb-4 pt-4">
        <div className="mb-3 flex items-center gap-2.5 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-[12px] font-semibold text-zinc-600 flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-[13px] font-medium text-zinc-800">
              {displayName}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
              {!isDirector && (
                <Lock className="h-2.5 w-2.5 text-zinc-300" strokeWidth={2} />
              )}
              {roleLabel}
            </span>
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
