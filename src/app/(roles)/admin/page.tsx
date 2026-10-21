import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import {
  Calendar,
  Users,
  CreditCard,
  BookOpen,
  Receipt,
  Megaphone,
  UserCheck,
  ArrowUpRight,
} from 'lucide-react'

import { AlertBanners } from './_components/AlertBanners'
import { FinancialKPIs } from './_components/FinancialKPIs'
import { RevenueChart } from './_components/RevenueChart'
import { EnrollmentBar } from './_components/EnrollmentBar'
import { ActivityFeed } from './_components/ActivityFeed'
import {
  FinancialKPIsSkeleton,
  RevenueChartSkeleton,
  EnrollmentBarSkeleton,
  ActivityFeedSkeleton,
} from './_components/DashboardSkeletons'

export const metadata = {
  title: 'Panel de Control | EduLink',
  description: 'Panel de gestión y administración escolar.',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 1. Verificar sesión
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Obtener perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, school_id')
    .eq('id', user.id)
    .single()

  const schoolId = profile?.school_id ?? ''
  const displayName = profile?.full_name ?? 'Administrador'

  // 3. Formatear fecha actual en español de Venezuela
  const dateFormatter = new Intl.DateTimeFormat('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const formattedDate =
    dateFormatter.format(new Date()).charAt(0).toUpperCase() +
    dateFormatter.format(new Date()).slice(1)

  // 4. Módulos de acceso rápido
  const quickLinks = [
    {
      label: 'Control de Pagos',
      description: 'Conciliación, recibos y morosidad',
      href: '/admin/payments',
      icon: CreditCard,
    },
    {
      label: 'Alumnado',
      description: 'Expedientes y datos de contacto',
      href: '/admin/students',
      icon: Users,
    },
    {
      label: 'Cursos y Grados',
      description: 'Secciones, materias y profesores',
      href: '/admin/courses',
      icon: BookOpen,
    },
    {
      label: 'Aranceles y Cobranza',
      description: 'Conceptos de pago y mensualidades',
      href: '/admin/billing',
      icon: Receipt,
    },
    {
      label: 'Comunicados',
      description: 'Circulares y avisos oficiales',
      href: '/admin/comunicados',
      icon: Megaphone,
    },
    {
      label: 'Usuarios y Personal',
      description: 'Profesores, coordinadores y roles',
      href: '/admin/usuarios',
      icon: UserCheck,
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Encabezado y Saludo ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-1">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            <span>{formattedDate}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Bienvenido, {displayName}
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            Resumen operativo y financiero de la institución.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/payments"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Ver Cobranzas</span>
          </Link>
          <Link
            href="/admin/students"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg shadow-xs transition-colors"
          >
            <Users className="h-3.5 w-3.5 text-zinc-500" />
            <span>Matrícula</span>
          </Link>
        </div>
      </div>

      {/* ── 1. Alertas Prioritarias (Streaming sin fallback bloqueante) ── */}
      <Suspense fallback={null}>
        <AlertBanners schoolId={schoolId} />
      </Suspense>

      {/* ── 2. KPIs Financieros (Streaming con Skeleton individual) ── */}
      <Suspense fallback={<FinancialKPIsSkeleton />}>
        <FinancialKPIs schoolId={schoolId} />
      </Suspense>

      {/* ── 3. Analítica Visual: Gráfico de Ingresos + Distribución ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart schoolId={schoolId} />
        </Suspense>

        <Suspense fallback={<EnrollmentBarSkeleton />}>
          <EnrollmentBar schoolId={schoolId} />
        </Suspense>
      </div>

      {/* ── 4. Feed de Actividad: Pagos Recientes + Comunicados ── */}
      <Suspense fallback={<ActivityFeedSkeleton />}>
        <ActivityFeed schoolId={schoolId} />
      </Suspense>

      {/* ── 5. Módulos de Acceso Rápido ── */}
      <div className="pt-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Módulos de Gestión
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3.5 rounded-xl border border-zinc-200/80 bg-white px-4 py-3.5 shadow-xs transition-all duration-200 hover:border-zinc-300 hover:shadow-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-50 transition-colors duration-200 group-hover:bg-indigo-50">
                  <Icon
                    className="h-4 w-4 text-zinc-400 transition-colors duration-200 group-hover:text-indigo-600"
                    strokeWidth={1.8}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-800 group-hover:text-zinc-900 truncate">
                    {link.label}
                  </p>
                  <p className="truncate text-2xs text-zinc-400 mt-0.5">
                    {link.description}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-300 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-zinc-500" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
