import dynamic from 'next/dynamic'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { TrendingUp, ArrowUpRight } from 'lucide-react'
import type { MonthRevenuePoint } from './RevenueChartClient'

const RevenueChartClient = dynamic(() => import('./RevenueChartClient'), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] w-full rounded-lg bg-zinc-100/60 animate-pulse flex items-center justify-center text-xs text-zinc-400">
      Cargando visualización de ingresos...
    </div>
  ),
})

interface RevenueChartProps {
  schoolId: string
}

export async function RevenueChart({ schoolId }: RevenueChartProps) {
  const supabase = await createClient()

  // 1. Construir serie de los últimos 6 meses cronológicos
  const monthsData: MonthRevenuePoint[] = []
  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ]

  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const monthKey = `${year}-${month}`
    const label = `${monthNames[d.getMonth()]} ${String(year).slice(2)}`

    monthsData.push({
      key: monthKey,
      name: label,
      total: 0,
      count: 0,
    })
  }

  const oldestMonthDate = `${monthsData[0].key}-01`

  // 2. Consultar pagos confirmados en ese rango
  const { data: payments } = await supabase
    .from('payments')
    .select('amount_usd, transaction_date, created_at')
    .eq('school_id', schoolId)
    .eq('status', 'confirmado')
    .gte('transaction_date', oldestMonthDate)

  // 3. Agrupar por mes
  if (payments && payments.length > 0) {
    const monthMap = new Map<string, MonthRevenuePoint>()
    monthsData.forEach((m) => monthMap.set(m.key, m))

    for (const p of payments) {
      const rawDate = p.transaction_date || p.created_at
      if (!rawDate) continue
      const key = String(rawDate).slice(0, 7)
      const targetMonth = monthMap.get(key)
      if (targetMonth) {
        targetMonth.total += Number(p.amount_usd || 0)
        targetMonth.count += 1
      }
    }
  }

  const grandTotal = monthsData.reduce((acc, curr) => acc + curr.total, 0)
  const formattedGrandTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(grandTotal)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              <CardTitle className="text-base font-semibold text-zinc-900">
                Recaudación Semestral
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-zinc-500 mt-1">
              Ingresos mensuales confirmados en divisas (USD)
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-zinc-400">Total 6 meses: </span>
              <span className="text-sm font-bold text-zinc-900">
                {formattedGrandTotal}
              </span>
            </div>
            <Link
              href="/admin/payments"
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-indigo-600 transition-colors p-1.5 rounded-lg hover:bg-zinc-100"
              title="Ir al módulo de pagos"
            >
              <span>Ver detalle</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <RevenueChartClient data={monthsData} />
      </CardContent>
    </Card>
  )
}
