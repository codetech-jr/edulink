import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight,
  Receipt,
  CreditCard,
  Clock,
  AlertCircle,
  Landmark,
  CheckCircle2,
  Users,
} from 'lucide-react'
import { isAdminRole } from '@/lib/permissions'
import { StatCard } from '@/components/ui/StatCard'
import { MorosidadDashboardClient } from './_components/MorosidadDashboardClient'
import { getMorosidadData } from './_lib/getMorosidadData'

export const metadata = {
  title: 'Control de Morosidad | EduLink',
  description: 'Gestión de morosidad estudiantil, conciliación de pagos y estados de cuenta.',
}

export default async function AdminMorosidadPage() {
  const supabase = await createClient()

  // 1. Validar sesión
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Obtener perfil del administrador
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdminRole(profile.role) || !profile.school_id) {
    redirect('/login')
  }

  const {
    processedStudents,
    bcvRate,
    conceptName,
    totalCobradoMes,
    totalPendienteMes,
    totalAdeudadoMes,
    morosidadRate,
    totalEstudiantes,
    totalMorosos,
    courseOptions,
  } = await getMorosidadData(supabase, profile.school_id)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Breadcrumbs & Encabezado ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/70">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-1" aria-label="Breadcrumb">
            <Link href="/admin" className="hover:text-indigo-600 transition-colors">
              Admin
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <Link href="/admin/payments" className="hover:text-indigo-600 transition-colors">
              Pagos
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-zinc-700 font-semibold">Morosidad</span>
          </nav>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2.5">
            <Receipt className="h-6 w-6 text-indigo-600" />
            <span>Gestión de Cobranza y Morosidad</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Monitorea el cumplimiento de pagos del mes en curso y genera estados de cuenta oficiales.
          </p>
        </div>

        {/* Indicador de Tasa Oficial BCV */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-800 self-start sm:self-auto font-mono shadow-2xs">
          <Landmark className="h-3.5 w-3.5 text-emerald-600" />
          <span>Tasa BCV: {bcvRate.toFixed(2)} Bs/$</span>
        </div>
      </div>

      {/* ── 4 Tarjetas de Resumen Financiero (KPIs) ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Cobrado este mes */}
        <StatCard
          label="Cobrado este mes"
          value={`$${totalCobradoMes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`Bs. ${(totalCobradoMes * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })} al cambio oficial`}
          icon={CreditCard}
          color="emerald"
          delta={{
            type: 'increase',
            value: `${processedStudents.filter((s) => s.status === 'al_dia').length} solventes`,
          }}
        />

        {/* KPI 2: Por conciliar / pendiente */}
        <StatCard
          label="Pagos por verificar"
          value={`$${totalPendienteMes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Reportes recibidos en espera de validación"
          icon={Clock}
          color="amber"
          delta={{
            type: 'neutral',
            value: `${processedStudents.filter((s) => s.status === 'pendiente').length} estudiantes`,
          }}
        />

        {/* KPI 3: Monto total adeudado */}
        <StatCard
          label="Monto en mora"
          value={`$${totalAdeudadoMes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`Bs. ${(totalAdeudadoMes * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })} por recaudar`}
          icon={AlertCircle}
          color="red"
          delta={{
            type: 'decrease',
            value: `${totalMorosos} morosos`,
          }}
        />

        {/* KPI 4: Índice de morosidad escolar */}
        <StatCard
          label="Tasa de morosidad"
          value={`${morosidadRate}%`}
          subtitle={`${totalMorosos} de ${totalEstudiantes} estudiantes activos`}
          icon={Users}
          color={morosidadRate > 30 ? 'red' : 'indigo'}
          delta={{
            type: morosidadRate > 30 ? 'decrease' : 'increase',
            value: morosidadRate <= 20 ? 'Excelente cobranza' : 'Requiere seguimiento',
          }}
        />
      </div>

      {/* ── Dashboard Interactivo del Cliente (Filtros, Tabla, Modales) ── */}
      <MorosidadDashboardClient
        initialStudents={processedStudents}
        bcvRate={bcvRate}
        conceptName={conceptName}
        courses={courseOptions}
      />
    </div>
  )
}
