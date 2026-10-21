import React, { type HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export function Card({ hoverable = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-200/80 bg-white text-zinc-900 shadow-xs',
        hoverable &&
          'transition-all duration-200 hover:border-zinc-300 hover:shadow-sm motion-reduce:transition-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('p-5 pb-3 flex flex-col space-y-1.5', className)} {...props}>
      {children}
    </div>
  )
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function CardTitle({
  as: Component = 'h3',
  className,
  children,
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={cn(
        'text-base font-semibold tracking-tight text-zinc-900 [text-wrap:balance]',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({
  className,
  children,
  ...props
}: CardDescriptionProps) {
  return (
    <p className={cn('text-xs text-zinc-500 leading-relaxed', className)} {...props}>
      {children}
    </p>
  )
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  )
}

export const CardContent = CardBody
export type CardContentProps = CardBodyProps

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('p-5 pt-0 flex items-center justify-between gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
}

// Compound assignment
Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Body = CardBody
Card.Content = CardBody
Card.Footer = CardFooter
