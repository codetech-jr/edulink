'use client'

import React, {
  useEffect,
  useRef,
  type DialogHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ModalProps
  extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open'> {
  open: boolean
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({
  open,
  onClose,
  size = 'md',
  className,
  children,
  ...props
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [open])

  // Handle native ESC press
  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault()
    onClose()
  }

  // Handle click on backdrop (clicking directly on <dialog> padding/bounds)
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current
    if (!dialog) return
    const rect = dialog.getBoundingClientRect()
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width

    if (!isInDialog) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleClick}
      className={cn(
        // Base modal positioning and backdrop
        'fixed inset-0 m-auto w-[calc(100%-2rem)] rounded-2xl border border-zinc-200/90 bg-white p-0 text-zinc-900 shadow-xl',
        'backdrop:bg-zinc-950/40 backdrop:backdrop-blur-xs',
        'open:animate-fade-in-up motion-reduce:open:animate-none',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div className="relative flex flex-col max-h-[85vh] overflow-hidden">
        {children}
      </div>
    </dialog>
  )
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  onClose?: () => void
  showCloseButton?: boolean
}

export function ModalHeader({
  className,
  onClose,
  showCloseButton = true,
  children,
  ...props
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between border-b border-zinc-100 p-5 pb-4',
        className
      )}
      {...props}
    >
      <div className="space-y-1 pr-6">{children}</div>
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export interface ModalTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
}

export function ModalTitle({
  as: Component = 'h2',
  className,
  children,
  ...props
}: ModalTitleProps) {
  return (
    <Component
      className={cn(
        'text-lg font-semibold tracking-tight text-zinc-900 [text-wrap:balance]',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export interface ModalDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export function ModalDescription({
  className,
  children,
  ...props
}: ModalDescriptionProps) {
  return (
    <p className={cn('text-xs text-zinc-500 leading-relaxed', className)} {...props}>
      {children}
    </p>
  )
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {}

export function ModalBody({ className, children, ...props }: ModalBodyProps) {
  return (
    <div className={cn('overflow-y-auto p-5 text-sm text-zinc-700', className)} {...props}>
      {children}
    </div>
  )
}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function ModalFooter({ className, children, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2.5 border-t border-zinc-100 bg-zinc-50/50 p-4 px-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Modal.Header = ModalHeader
Modal.Title = ModalTitle
Modal.Description = ModalDescription
Modal.Body = ModalBody
Modal.Footer = ModalFooter
