import React, { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  icon?: ReactNode
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  default: {
    container: 'bg-zinc-100 text-zinc-800 border-zinc-200/80',
    dot: 'bg-zinc-500',
  },
  success: {
    container: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dot: 'bg-emerald-600',
  },
  warning: {
    container: 'bg-amber-50 text-amber-900 border-amber-200/80',
    dot: 'bg-amber-600',
  },
  danger: {
    container: 'bg-red-50 text-red-800 border-red-200/80',
    dot: 'bg-red-600',
  },
  info: {
    container: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
    dot: 'bg-indigo-600',
  },
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-2xs gap-1',
  md: 'px-2.5 py-0.5 text-xs gap-1.5',
}

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  const styles = variantStyles[variant]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-full border tracking-wide select-none',
        styles.container,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', styles.dot)}
          aria-hidden="true"
        />
      )}
      {icon && <span className="inline-flex shrink-0" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}
