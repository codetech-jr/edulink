import { createClient } from '@/utils/supabase/server'
import { logoutAction } from '@/actions/auth-actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  CreditCard, 
  ChevronRight, 
  LogOut, 
  LayoutDashboard,
  TrendingUp,
  Clock,
  XCircle,
} from 'lucide-react'
import { ExchangeRateWidget } from './_components/exchange-rate-widget'
import { PaymentSearch } from './_components/payment-search'
import { SyncBcvBanner } from './_components/sync-bcv-banner'
import { RateHistoryAccordion } from './_components/rate-history-accordion'
import { PaymentsTable } from './_components/PaymentsTable'
import { PaymentsKPICards } from './_components/PaymentsKPICards'

export const metadata = {
  title: 'Pagos y Finanzas | EduLink',
  description: 'Control de recaudación y conciliación de pagos.',
}

interface PageProps {
  searchParams: {
    q?: string
    status?: string
  }
}

export default async function PaymentsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // 1. Validar sesión de usuario
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Obtener perfil del usuario para validar school_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) {
    redirect('/login')
  }

  const schoolId = profile.school_id

  // Helper para consultar tasa oficial externa con timeout seguro
  async function fetchBcvRate(): Promise<number | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
        signal: controller.signal,
        next: { revalidate: 60 },
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        const rate = data.promedio || data.price
        if (typeof rate === 'number' && rate > 0) {
          return rate
        }
      }
    } catch (error) {
      console.error('Error fetching BCV exchange rate:', error)
    }
    return null
  }

  // 3. Consultas concurrentes con Promise.all (agregaciones + tasa de cambio)
  const [
    confirmedPaymentsResult,
    pendingPaymentsResult,
    ratesResult,
    bcvRate,
  ] = await Promise.all([
    // Recaudación: Sumatoria de amount_usd de pagos confirmados
    supabase
      .from('payments')
      .select('amount_usd')
      .eq('school_id', schoolId)
      .eq('status', 'confirmado'),

    // Por Confirmar: Sumatoria y conteo de pagos pendientes
    supabase
      .from('payments')
      .select('amount_usd, student_id')
      .eq('school_id', schoolId)
      .eq('status', 'pendiente'),

    // Historial de Tasas de Cambio (últimos 30 días)
    supabase
      .from('exchange_rates')
      .select('id, rate, rate_date, source, created_at')
      .eq('school_id', schoolId)
      .order('rate_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30),

    fetchBcvRate(),
  ])

  const confirmedPayments = confirmedPaymentsResult.data
  const totalRecaudado = confirmedPayments?.reduce((sum, p) => sum + Number(p.amount_usd || 0), 0) || 0

  const pendingPayments = pendingPaymentsResult.data
  const totalPendiente = pendingPayments?.reduce((sum, p) => sum + Number(p.amount_usd || 0), 0) || 0
  const countPendiente = pendingPayments?.length || 0

  // Morosidad (Fórmula MVP): Conteo simple de alumnos con pagos pendientes
  const uniquePendingStudentIds = new Set(pendingPayments?.map(p => p.student_id).filter(Boolean))
  const countMorosos = uniquePendingStudentIds.size

  const historicalRates = ratesResult.data || []
  const latestRateData = historicalRates[0] || null
  const currentRate = latestRateData?.rate ?? null
  const rateDate = latestRateData?.rate_date ?? null
  const lastUpdated = latestRateData?.created_at ?? null


  // 5. Consultar listado de pagos filtrado por búsqueda y estado
  const q = searchParams.q || ''
  const statusFilter = searchParams.status || 'all'

  // Pre-query student IDs matching query term (for student search join approximation)
  let matchedStudentIds: string[] = []
  if (q) {
    const { data: students } = await supabase
      .from('students')
      .select('id')
      .eq('school_id', schoolId)
      .ilike('full_name', `%${q}%`)
    
    matchedStudentIds = students?.map(s => s.id) || []
  }

  let queryBuilder = supabase
    .from('payments')
    .select(`
      id,
      payment_method,
      status,
      amount_usd,
      amount_ves,
      exchange_rate_used,
      transaction_date,
      reference_number,
      bank_origin,
      phone_number,
      rejection_reason,
      students (
        id,
        full_name
      )
    `)
    .eq('school_id', schoolId)

  if (statusFilter !== 'all') {
    queryBuilder = queryBuilder.eq('status', statusFilter)
  }

  if (q) {
    if (matchedStudentIds.length > 0) {
      queryBuilder = queryBuilder.or(`reference_number.ilike.%${q}%,student_id.in.(${matchedStudentIds.join(',')})`)
    } else {
      queryBuilder = queryBuilder.ilike('reference_number', `%${q}%`)
    }
  }

  const { data: paymentsList, error: paymentsError } = await queryBuilder
    .order('created_at', { ascending: false })

  if (paymentsError) {
    console.error('Error fetching payments:', paymentsError)
  }

  const methodNames: Record<string, string> = {
    pago_movil: 'Pago Móvil',
    zelle: 'Zelle',
    transferencia: 'Transferencia',
    efectivo: 'Efectivo'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Superior */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="bg-emerald-600 p-2 rounded-lg hover:bg-emerald-700 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Link href="/admin" className="hover:text-emerald-600 transition-colors">Admin</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Pagos</span>
          </div>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full font-semibold text-sm hover:bg-red-100 transition-all border border-red-100"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </form>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        {/* Encabezado con Tasa de Cambio */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <span className="bg-emerald-600 w-2 h-8 rounded-full inline-block"></span>
              Pagos y Finanzas
            </h1>
            <p className="text-gray-500 mt-1.5 font-medium">Monitorea la recaudación y concilia las transacciones escolares de forma segura.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="/admin/payments/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm text-sm"
            >
              <span className="text-lg leading-none">+</span>
              Registrar Pago
            </Link>
            <ExchangeRateWidget currentRate={currentRate} />
          </div>
        </div>

        {/* Widget de Estado de Tasa BCV (OK, WARNING, CRÍTICO) */}
        <SyncBcvBanner
          currentRate={currentRate}
          rateDate={rateDate}
          lastUpdated={lastUpdated}
          detectedRate={bcvRate}
        />

        {/* Sección colapsable de Historial de Tasas BCV (últimos 30 días) */}
        <RateHistoryAccordion rates={historicalRates} />

        {/* Resumen Financiero */}
        <PaymentsKPICards
          totalRecaudado={totalRecaudado}
          totalPendiente={totalPendiente}
          countPendiente={countPendiente}
          countMorosos={countMorosos}
        />

        {/* Buscador y Filtros */}
        <PaymentSearch />

        {/* Tabla de Pagos */}
        <PaymentsTable paymentsList={paymentsList as any} />
      </main>
    </div>
  )
}
