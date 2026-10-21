import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-xs hover:bg-brand-700 active:bg-brand-800 focus-visible:ring-brand-500 border border-transparent',
  secondary:
    'bg-white text-zinc-900 border border-zinc-200/90 shadow-xs hover:bg-zinc-50/90 hover:border-zinc-300 active:bg-zinc-100 focus-visible:ring-zinc-400',
  ghost:
    'bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200/70 focus-visible:ring-zinc-400 border border-transparent',
  danger:
    'bg-danger-600 text-white shadow-xs hover:bg-danger-700 active:bg-danger-800 focus-visible:ring-danger-500 border border-transparent',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-xs rounded-md gap-1.5 font-medium',
  md: 'h-9 px-3.5 text-sm rounded-lg gap-2 font-medium',
  lg: 'h-11 px-5 text-base rounded-xl gap-2.5 font-semibold',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          'inline-flex items-center justify-center select-none font-medium text-center',
          'transition-colors duration-150 motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2
            className={cn(
              'animate-spin motion-reduce:animate-none',
              size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
            )}
            aria-hidden="true"
          />
        ) : (
          leftIcon && <span className="inline-flex shrink-0" aria-hidden="true">{leftIcon}</span>
        )}

        {children && <span>{children}</span>}

        {!loading && rightIcon && (
          <span className="inline-flex shrink-0" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
