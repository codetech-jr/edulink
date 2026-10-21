import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Skeleton para los 4 KPIs Financieros superiores.
 * Altura y layout idénticos a los StatCards reales para evitar Cumulative Layout Shift (CLS).
 */
export function FinancialKPIsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs"
          aria-hidden="true"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-7 w-28 rounded-md" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para el gráfico de recaudación mensual (Recharts).
 */
export function RevenueChartSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-3.5 w-64 rounded" />
          </div>
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[280px] w-full flex items-end justify-between gap-4 px-2 pb-6 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton
                className="w-full rounded-t-md"
                style={{ height: `${35 + (i * 12) % 60}%` }}
              />
              <Skeleton className="h-3 w-8 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton para la distribución de matrícula por grado (CSS puro).
 */
export function EnrollmentBarSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-3.5 w-52 rounded" />
          </div>
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-3.5 w-12 rounded" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton para el feed de actividad reciente (pagos y comunicados).
 */
export function ActivityFeedSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3.5 w-56 rounded" />
          </div>
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-zinc-100 pt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
