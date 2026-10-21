import { createClient } from '@/utils/supabase/server'
import { StatCard } from '@/components/ui/StatCard'
import {
  CreditCard,
  Clock,
  AlertCircle,
  Landmark,
} from 'lucide-react'

interface FinancialKPIsProps {
  schoolId: string
}

export async function FinancialKPIs({ schoolId }: FinancialKPIsProps) {
  const supabase = await createClient()

  // 1. Calcular el rango del mes en curso (YYYY-MM-01 a hoy)
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const firstDayOfMonth = `${year}-${month}-01`
  const todayStr = now.toISOString().split('T')[0]

  // 2. Consultas concurrentes sin cascada
  const [
    monthPaymentsResult,
    pendingPaymentsResult,
    activeStudentsResult,
    latestRateResult,
  ] = await Promise.all([
    // Pagos confirmados en el mes actual
    supabase
      .from('payments')
      .select('amount_usd, student_id')
      .eq('school_id', schoolId)
      .eq('status', 'confirmado')
      .gte('transaction_date', firstDayOfMonth),

    // Pagos pendientes totales por conciliar
    supabase
      .from('payments')
      .select('amount_usd')
      .eq('school_id', schoolId)
      .eq('status', 'pendiente'),

    // Total de alumnos activos en la institución
    supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('is_active', true),

    // Tasa BCV más reciente
    supabase
      .from('exchange_rates')
      .select('rate, rate_date')
      .eq('school_id', schoolId)
      .order('rate_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // Cálculo de Recaudación del Mes
  const monthConfirmedPayments = monthPaymentsResult.data ?? []
  const totalCobradoMes = monthConfirmedPayments.reduce(
    (sum, p) => sum + Number(p.amount_usd || 0),
    0
  )
  const formattedCobrado = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(totalCobradoMes)

  // Cálculo de Pagos Pendientes
  const pendingPayments = pendingPaymentsResult.data ?? []
  const totalPendiente = pendingPayments.reduce(
    (sum, p) => sum + Number(p.amount_usd || 0),
    0
  )
  const countPendiente = pendingPayments.length
  const formattedPendiente = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(totalPendiente)

  // Cálculo de Morosidad (Estudiantes activos sin pago confirmado este mes)
  const totalActivos = activeStudentsResult.count ?? 0
  const paidStudentIds = new Set(
    monthConfirmedPayments.map((p) => p.student_id).filter(Boolean)
  )
  const morososCount = Math.max(0, totalActivos - paidStudentIds.size)
  const morososPct =
    totalActivos > 0 ? Math.round((morososCount / totalActivos) * 100) : 0

  // Cálculo de Antigüedad de la Tasa BCV
  const latestRate = latestRateResult.data
  const rateValue = latestRate?.rate ? Number(latestRate.rate) : null
  const rateDate = latestRate?.rate_date ?? null

  let rateStatusText = 'Sin registro'
  let rateStatusColor: 'emerald' | 'amber' | 'red' | 'neutral' = 'neutral'

  if (rateDate) {
    if (rateDate === todayStr) {
      rateStatusText = 'Al día (hoy)'
      rateStatusColor = 'emerald'
    } else {
      const diffMs = new Date(todayStr).getTime() - new Date(rateDate).getTime()
      const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
      if (diffDays === 1) {
        rateStatusText = 'Ayer'
        rateStatusColor = 'amber'
      } else {
        rateStatusText = `Hace ${diffDays} días`
        rateStatusColor = 'red'
      }
    }
  }

  const formattedRate =
    rateValue !== null
      ? `Bs. ${rateValue.toLocaleString('es-VE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : 'No fijada'

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* KPI 1: Cobrado este mes */}
      <StatCard
        label="Cobrado este mes"
        value={formattedCobrado}
        icon={CreditCard}
        color="emerald"
        href="/admin/payments?status=confirmado"
        subtitle={
          <span>
            {monthConfirmedPayments.length} pago{monthConfirmedPayments.length === 1 ? '' : 's'} recibido{monthConfirmedPayments.length === 1 ? '' : 's'}
          </span>
        }
      />

      {/* KPI 2: Pendiente verificar */}
      <StatCard
        label="Por conciliar"
        value={formattedPendiente}
        icon={Clock}
        color="amber"
        href="/admin/payments?status=pendiente"
        subtitle={
          <span className="font-medium text-amber-700">
            {countPendiente} comprobante{countPendiente === 1 ? '' : 's'} en espera
          </span>
        }
      />

      {/* KPI 3: Estudiantes morosos */}
      <StatCard
        label="Estudiantes en mora"
        value={morososCount}
        icon={AlertCircle}
        color={morososCount > 0 ? 'red' : 'emerald'}
        href="/admin/morosidad"
        subtitle={
          <span>
            {morososPct}% de la matrícula ({totalActivos} alumnos)
          </span>
        }
      />

      {/* KPI 4: Tasa BCV Oficial */}
      <StatCard
        label="Tasa Oficial BCV"
        value={formattedRate}
        icon={Landmark}
        color={rateStatusColor}
        href="/admin/payments"
        subtitle={
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span
              className={`h-2 w-2 rounded-full ${
                rateStatusColor === 'emerald'
                  ? 'bg-emerald-500'
                  : rateStatusColor === 'amber'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              aria-hidden="true"
            />
            {rateStatusText}
          </span>
        }
      />
    </div>
  )
}
