import React, {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
} from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  helperText?: string
  error?: string
  options?: SelectOption[]
  containerClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      helperText,
      error,
      options,
      children,
      disabled,
      required,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const selectId = id || generatedId
    const helperId = `${selectId}-helper`
    const errorId = `${selectId}-error`

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
            htmlFor={selectId}
            className="block text-xs font-medium text-zinc-700"
          >
            {label}
            {required && <span className="ml-1 text-danger-600" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={describedBy}
            className={cn(
              'w-full appearance-none rounded-lg border bg-white pl-3 pr-9 py-2 text-sm text-zinc-900 shadow-xs',
              'transition-colors duration-150 motion-reduce:transition-none',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              hasError
                ? 'border-danger-400 text-danger-900 focus:border-danger-500 focus:ring-danger-500/20'
                : 'border-zinc-200/90 hover:border-zinc-300 focus:border-brand-500 focus:ring-brand-500/20',
              disabled && 'bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed shadow-none',
              className
            )}
            {...props}
          >
            {options
              ? options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))
              : children}
          </select>

          <div
            className="pointer-events-none absolute right-3 flex items-center text-zinc-400"
            aria-hidden="true"
          >
            {hasError ? (
              <AlertCircle className="h-4 w-4 text-danger-500" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
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

Select.displayName = 'Select'
