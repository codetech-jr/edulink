import React from 'react'
import { Badge } from '@/components/ui/Badge'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bell,
  Info,
} from 'lucide-react'

export interface PaymentFeedRecord {
  id: string
  amount_usd: number
  status: 'confirmado' | 'pendiente' | 'rechazado' | string
  payment_method: string
  reference_number?: string | null
  created_at?: string
  transaction_date?: string
  students?: {
    id: string
    full_name: string
  } | null
}

export interface AnnouncementFeedRecord {
  id: string
  title: string
  body?: string
  content?: string
  category?: string
  type?: string
  is_archived?: boolean
  created_at: string
}

const methodNames: Record<string, string> = {
  pago_movil: 'Pago Móvil',
  zelle: 'Zelle',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'confirmado':
      return (
        <Badge variant="success" size="sm" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>Confirmado</span>
        </Badge>
      )
    case 'pendiente':
      return (
        <Badge variant="warning" size="sm" className="gap-1">
          <Clock className="h-3 w-3" />
          <span>Por verificar</span>
        </Badge>
      )
    case 'rechazado':
      return (
        <Badge variant="danger" size="sm" className="gap-1">
          <XCircle className="h-3 w-3" />
          <span>Rechazado</span>
        </Badge>
      )
    default:
      return (
        <Badge variant="default" size="sm">
          {status}
        </Badge>
      )
  }
}

export function getAnnouncementIcon(type?: string) {
  switch (type) {
    case 'urgente':
      return <AlertTriangle className="h-4 w-4 text-rose-600" />
    case 'recordatorio':
      return <Bell className="h-4 w-4 text-amber-600" />
    default:
      return <Info className="h-4 w-4 text-blue-600" />
  }
}

export function formatRelativeTime(dateString?: string) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffSeconds < 60) return 'Hace un momento'
    const diffMinutes = Math.floor(diffSeconds / 60)
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `Hace ${diffHours} h`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`

    return new Intl.DateTimeFormat('es-VE', {
      day: 'numeric',
      month: 'short',
    }).format(date)
  } catch {
    return dateString
  }
}

export function PaymentFeedItem({ payment }: { payment: PaymentFeedRecord }) {
  const studentName = payment.students?.full_name ?? 'Alumno no especificado'
  const methodName = methodNames[payment.payment_method] || payment.payment_method || 'Pago'
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(payment.amount_usd || 0))

  return (
    <div className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1 gap-3 hover:bg-zinc-50/60 -mx-3 px-3 rounded-lg transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0 font-medium text-xs">
          {studentName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-zinc-900 truncate">
            {studentName}
          </p>
          <p className="text-2xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
            <span>{methodName}</span>
            {payment.reference_number && (
              <>
                <span>•</span>
                <span className="font-mono">Ref: {payment.reference_number}</span>
              </>
            )}
            <span>•</span>
            <span>{formatRelativeTime(payment.created_at || payment.transaction_date)}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-xs font-bold text-zinc-900">
            {formattedAmount}
          </p>
        </div>
        <div>{getStatusBadge(payment.status)}</div>
      </div>
    </div>
  )
}

export function AnnouncementFeedItem({ announcement }: { announcement: AnnouncementFeedRecord }) {
  const categoryLabel = announcement.category || announcement.type || 'comunicado'

  return (
    <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 hover:bg-zinc-50 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          {getAnnouncementIcon(categoryLabel)}
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-500">
            {categoryLabel}
          </span>
        </div>
        <span className="text-2xs text-zinc-400">
          {formatRelativeTime(announcement.created_at)}
        </span>
      </div>
      <h4 className="text-xs font-semibold text-zinc-900 line-clamp-1">
        {announcement.title}
      </h4>
      <p className="text-2xs text-zinc-500 line-clamp-2 mt-1">
        {announcement.body || announcement.content}
      </p>
    </div>
  )
}
