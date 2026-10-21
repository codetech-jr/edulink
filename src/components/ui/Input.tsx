import React, {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      helperText,
      error,
      leadingIcon,
      trailingIcon,
      disabled,
      required,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const helperId = `${inputId}-helper`
    const errorId = `${inputId}-error`

    const hasError = Boolean(error)
    const describedBy = hasError
      ? errorId
      : helperText
        ? helperId
        : undefined

    return (
      <div className={cn('w-full space-y-1.5 text-left', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-zinc-700"
          >
            {label}
            {required && <span className="ml-1 text-danger-600" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leadingIcon && (
            <div
              className="pointer-events-none absolute left-3 flex items-center text-zinc-400"
              aria-hidden="true"
            >
              {leadingIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={describedBy}
            className={cn(
              'w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs',
              'placeholder:text-zinc-400 transition-colors duration-150 motion-reduce:transition-none',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              leadingIcon ? 'pl-9' : 'pl-3',
              trailingIcon || hasError ? 'pr-9' : 'pr-3',
              hasError
                ? 'border-danger-400 text-danger-900 focus:border-danger-500 focus:ring-danger-500/20'
                : 'border-zinc-200/90 hover:border-zinc-300 focus:border-brand-500 focus:ring-brand-500/20',
              disabled && 'bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed shadow-none',
              className
            )}
            {...props}
          />

          {hasError ? (
            <div
              className="pointer-events-none absolute right-3 flex items-center text-danger-500"
              aria-hidden="true"
            >
              <AlertCircle className="h-4 w-4" />
            </div>
          ) : trailingIcon ? (
            <div className="absolute right-3 flex items-center text-zinc-400">
              {trailingIcon}
            </div>
          ) : null}
        </div>

        {hasError ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-danger-600">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-zinc-500">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
