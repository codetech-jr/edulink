'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export interface MonthRevenuePoint {
  key: string
  name: string
  total: number
  count: number
}

interface RevenueChartClientProps {
  data: MonthRevenuePoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: MonthRevenuePoint }>
  label?: string
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const dataPoint = payload[0].payload
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dataPoint.total)

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-md">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        {dataPoint.name}
      </p>
      <p className="mt-1 text-base font-bold text-zinc-900">{formattedAmount}</p>
      <p className="mt-0.5 text-xs text-zinc-400">
        {dataPoint.count} pago{dataPoint.count === 1 ? '' : 's'} confirmado{dataPoint.count === 1 ? '' : 's'}
      </p>
    </div>
  )
}

export default function RevenueChartClient({ data }: RevenueChartClientProps) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return (
    <div
      className="h-[280px] w-full"
      role="region"
      aria-label="Gráfico de recaudación mensual en dólares"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f4f4f5"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#71717a', fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(244, 244, 245, 0.6)' }}
          />
          <Bar
            dataKey="total"
            fill="#4f46e5"
            radius={[6, 6, 0, 0]}
            maxBarSize={44}
            isAnimationActive={!reducedMotion}
            animationDuration={600}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
