import React, { type ElementType, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/utils/cn'

export type StatCardColor = 'indigo' | 'emerald' | 'amber' | 'red' | 'neutral'

export interface StatCardDelta {
  value: string | number
  label?: string
  type?: 'increase' | 'decrease' | 'neutral'
}

export interface StatCardProps {
  label: string
  value: string | number
  icon: ElementType
  color?: StatCardColor
  delta?: StatCardDelta
  href?: string
  className?: string
  subtitle?: ReactNode
}

const colorMap: Record<
  StatCardColor,
  {
    bg: string
    text: string
  }
> = {
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
  },
  neutral: {
    bg: 'bg-zinc-100',
    text: 'text-zinc-600',
  },
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = 'indigo',
  delta,
  href,
  className,
  subtitle,
}: StatCardProps) {
  const colors = colorMap[color]

  const content = (
    <div
      className={cn(
        'group relative rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs',
        'transition-all duration-200 motion-reduce:transition-none',
        href && 'hover:border-zinc-300 hover:shadow-sm cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('rounded-lg p-2.5 shrink-0', colors.bg)}>
          <Icon className={cn('h-4 w-4 sm:h-[18px] sm:w-[18px]', colors.text)} strokeWidth={1.8} />
        </div>

        {href && (
          <ArrowUpRight
            className="h-4 w-4 text-zinc-300 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-zinc-500 motion-reduce:transition-none"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[28px] font-semibold leading-none tracking-tight text-zinc-900">
            {value}
          </span>

          {delta && (
            <div
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
                delta.type === 'increase'
                  ? 'bg-emerald-50 text-emerald-700'
                  : delta.type === 'decrease'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-zinc-100 text-zinc-600'
              )}
            >
              {delta.type === 'increase' ? (
                <TrendingUp className="h-3 w-3" />
              ) : delta.type === 'decrease' ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              <span>{delta.value}</span>
            </div>
          )}
        </div>

        <p className="mt-1.5 text-[13px] font-medium text-zinc-500">{label}</p>

        {subtitle && (
          <div className="mt-1 text-2xs text-zinc-400">{subtitle}</div>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl">
        {content}
      </Link>
    )
  }

  return content
}
