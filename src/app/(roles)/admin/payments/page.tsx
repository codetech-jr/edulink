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
  CheckCircle2,
  Calendar
} from 'lucide-react'
import { PaymentRowActions } from './_components/payment-row-actions'
import { ExchangeRateWidget } from './_components/exchange-rate-widget'
import { PaymentSearch } from './_components/payment-search'
import { SyncBcvBanner } from './_components/sync-bcv-banner'

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

  // 3. Consultas de Agregación Real (Dashboard Financiero)
  // Recaudación: Sumatoria de amount_usd de pagos confirmados
  const { data: confirmedPayments } = await supabase
    .from('payments')
    .select('amount_usd')
    .eq('school_id', schoolId)
    .eq('status', 'confirmado')

  const totalRecaudado = confirmedPayments?.reduce((sum, p) => sum + Number(p.amount_usd || 0), 0) || 0

  // Por Confirmar: Sumatoria y conteo de pagos pendientes
  const { data: pendingPayments } = await supabase
    .from('payments')
    .select('amount_usd, student_id')
    .eq('school_id', schoolId)
    .eq('status', 'pendiente')

  const totalPendiente = pendingPayments?.reduce((sum, p) => sum + Number(p.amount_usd || 0), 0) || 0
  const countPendiente = pendingPayments?.length || 0

  // Morosidad (Fórmula MVP): Conteo simple de alumnos con pagos pendientes
  const uniquePendingStudentIds = new Set(pendingPayments?.map(p => p.student_id).filter(Boolean))
  const countMorosos = uniquePendingStudentIds.size

  // 4. Tasa de Cambio del Día
  const { data: latestRateData } = await supabase
    .from('exchange_rates')
    .select('rate, rate_date')
    .eq('school_id', schoolId)
    .order('rate_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const currentRate = latestRateData?.rate ?? null
  const rateDate = latestRateData?.rate_date ?? null

  // Fetch official BCV rate with a 5-second timeout and try/catch error handling
  let bcvRate: number | null = null
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      signal: controller.signal,
      next: { revalidate: 60 } // cache for 60 seconds
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const data = await response.json()
      const rate = data.promedio || data.price
      if (typeof rate === 'number' && rate > 0) {
        bcvRate = rate
      }
    }
  } catch (error) {
    console.error('Error fetching BCV exchange rate:', error)
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const hasRateForToday = rateDate === todayStr
  const isDifferentRate = currentRate !== bcvRate

  const showBcvBanner = bcvRate !== null && (!hasRateForToday || isDifferentRate)

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

        {showBcvBanner && <SyncBcvBanner bcvRate={bcvRate!} />}

        {/* Resumen Financiero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recaudación Confirmada</p>
            </div>
            <p className="text-3xl font-black text-gray-900">
              ${totalRecaudado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-400 font-bold mt-1">Monto acumulado en conciliaciones</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-50 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Por Confirmar</p>
            </div>
            <p className="text-3xl font-black text-gray-900">
              ${totalPendiente.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-amber-600 font-bold mt-1">
              {countPendiente} pago{countPendiente === 1 ? '' : 's'} pendiente{countPendiente === 1 ? '' : 's'} de revisión
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-50 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Morosidad</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{countMorosos}</p>
            <p className="text-xs text-red-600 font-bold mt-1">
              Alumno{countMorosos === 1 ? '' : 's'} con reportes pendientes
            </p>
          </div>
        </div>

        {/* Buscador y Filtros */}
        <PaymentSearch />

        {/* Tabla de Pagos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Referencia</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiante</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Método</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paymentsList && paymentsList.length > 0 ? (
                  paymentsList.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-gray-700 block">
                          {payment.reference_number || 'S/R'}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {payment.transaction_date}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 block">
                          {payment.students?.full_name || 'Estudiante no registrado'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-gray-700">
                            <CreditCard className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm font-bold">
                              {methodNames[payment.payment_method] || payment.payment_method}
                            </span>
                          </div>
                          {(payment.phone_number || payment.bank_origin) && (
                            <span className="text-xs text-gray-400 font-medium mt-0.5">
                              {payment.bank_origin} {payment.phone_number ? `(${payment.phone_number})` : ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-gray-950 block">
                          ${Number(payment.amount_usd || 0).toFixed(2)}
                        </span>
                        {payment.amount_ves && (
                          <span className="text-xs text-emerald-600 font-bold block mt-0.5">
                            {Number(payment.amount_ves).toFixed(2)} Bs. 
                            {payment.exchange_rate_used && (
                              <span className="text-[10px] text-gray-400 font-normal"> (a {payment.exchange_rate_used} Bs.)</span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          payment.status === 'confirmado' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : payment.status === 'pendiente'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-red-50 text-red-600'
                        }`}>
                          {payment.status === 'confirmado' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {payment.status === 'pendiente' && <Clock className="w-3.5 h-3.5" />}
                          {payment.status === 'rechazado' && <XCircle className="w-3.5 h-3.5" />}
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <PaymentRowActions
                          paymentId={payment.id}
                          studentName={payment.students?.full_name || 'Estudiante'}
                          status={payment.status}
                          rejectionReason={payment.rejection_reason}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium bg-gray-50/50">
                      No se encontraron reportes de pago para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
