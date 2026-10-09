import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import {
  Users,
  CreditCard,
  BookOpen,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Receipt,
  Megaphone,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Auth is already handled by layout.tsx — we just need the user for queries
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, school_id')
    .eq('id', user!.id)
    .single()

  const displayName = profile?.full_name ?? 'Administrador'
  const schoolId = profile?.school_id ?? ''

  // ── Statistics queries ─────────────────────────────────
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)

  const { count: courseCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)

  const today = new Date().toISOString().split('T')[0]
  const { count: paymentsTodayCount } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('transaction_date', today)

  // ── Format current date ────────────────────────────────
  const dateFormatter = new Intl.DateTimeFormat('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const formattedDate =
    dateFormatter.format(new Date()).charAt(0).toUpperCase() +
    dateFormatter.format(new Date()).slice(1)

  // ── Stat card definitions ──────────────────────────────
  const stats = [
    {
      label: 'Estudiantes',
      value: studentCount ?? 0,
      icon: Users,
      color: 'indigo' as const,
      href: '/admin/students',
    },
    {
      label: 'Cursos Activos',
      value: courseCount ?? 0,
      icon: BookOpen,
      color: 'amber' as const,
      href: '/admin/courses',
    },
    {
      label: 'Pagos Hoy',
      value: paymentsTodayCount ?? 0,
      icon: CreditCard,
      color: 'emerald' as const,
      href: '/admin/payments',
    },
  ]

  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      badge: 'bg-indigo-100 text-indigo-600',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-600',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-600',
    },
  }

  // ── Quick action links ─────────────────────────────────
  const quickLinks = [
    {
      label: 'Gestionar Alumnado',
      description: 'Inscripciones, perfiles y registros académicos',
      href: '/admin/students',
      icon: Users,
    },
    {
      label: 'Control de Pagos',
      description: 'Mensualidades, facturación y reportes',
      href: '/admin/payments',
      icon: CreditCard,
    },
    {
      label: 'Aranceles y Financiamiento',
      description: 'Configuración de tarifas y planes de pago',
      href: '/admin/billing',
      icon: Receipt,
    },
    {
      label: 'Comunicados Oficiales',
      description: 'Anuncios, circulares y notificaciones',
      href: '/admin/comunicados',
      icon: Megaphone,
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* ── Greeting ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 text-[13px] text-zinc-400 mb-1.5">
          <Calendar className="h-3.5 w-3.5" strokeWidth={1.8} />
          {formattedDate}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Bienvenido, {displayName}
        </h1>
        <p className="mt-1 text-[14.5px] text-zinc-400">
          Resumen de tu gestión institucional.
        </p>
      </div>

      {/* ── Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          const colors = colorMap[stat.color]

          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group relative rounded-xl border border-zinc-200/80 bg-white p-5 transition-all duration-200 hover:border-zinc-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2.5 ${colors.bg}`}>
                  <Icon
                    className={`h-[18px] w-[18px] ${colors.text}`}
                    strokeWidth={1.8}
                  />
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-300 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-zinc-500" />
              </div>

              <div className="mt-4">
                <span className="text-[28px] font-semibold leading-none tracking-tight text-zinc-900">
                  {stat.value}
                </span>
                <p className="mt-1.5 text-[13px] font-medium text-zinc-400">
                  {stat.label}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ── Quick Access Modules ──────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-zinc-400" strokeWidth={1.8} />
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-400">
            Acceso Rápido
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quickLinks.map((link) => {
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-4 rounded-xl border border-zinc-200/80 bg-white px-5 py-4 transition-all duration-200 hover:border-zinc-300 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-50 transition-colors duration-200 group-hover:bg-indigo-50">
                  <Icon
                    className="h-[18px] w-[18px] text-zinc-400 transition-colors duration-200 group-hover:text-indigo-600"
                    strokeWidth={1.8}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-zinc-800 group-hover:text-zinc-900">
                    {link.label}
                  </p>
                  <p className="mt-0.5 truncate text-[12.5px] text-zinc-400">
                    {link.description}
                  </p>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 flex-shrink-0 text-zinc-300 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-zinc-500" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
