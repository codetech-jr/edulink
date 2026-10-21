import React, { type HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-zinc-200/70 motion-reduce:animate-none',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

export function SkeletonText({
  lines = 1,
  className,
  ...props
}: SkeletonProps & { lines?: number }) {
  if (lines <= 1) {
    return (
      <Skeleton className={cn('h-4 w-full rounded', className)} {...props} />
    )
  }

  return (
    <div className="space-y-2 w-full" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4 rounded',
            i === lines - 1 ? 'w-3/5' : 'w-full',
            className
          )}
          {...props}
        />
      ))}
    </div>
  )
}

export function SkeletonCircle({
  size = 40,
  className,
  ...props
}: SkeletonProps & { size?: number | string }) {
  return (
    <Skeleton
      className={cn('rounded-full shrink-0', className)}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
      {...props}
    />
  )
}

export function SkeletonButton({
  size = 'md',
  className,
  ...props
}: SkeletonProps & { size?: 'sm' | 'md' | 'lg' }) {
  const heightClass = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-11' : 'h-9'
  return (
    <Skeleton
      className={cn('w-24 rounded-lg', heightClass, className)}
      {...props}
    />
  )
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs space-y-4',
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <div className="flex items-center justify-between">
        <SkeletonCircle size={36} />
        <Skeleton className="h-4 w-12 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-7 w-20 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
      </div>
    </div>
  )
}

Skeleton.Text = SkeletonText
Skeleton.Circle = SkeletonCircle
Skeleton.Button = SkeletonButton
Skeleton.Card = SkeletonCard
