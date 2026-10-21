import React, { type ElementType, type ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface EmptyStateProps {
  icon?: ElementType
  title: string
  description?: string
  action?: ReactNode
  className?: string
  children?: ReactNode
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-zinc-200/90 bg-zinc-50/50',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 shadow-xs mb-4">
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </div>

      <h3 className="text-base font-semibold text-zinc-900 tracking-tight [text-wrap:balance]">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 text-sm text-zinc-500 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}

      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
