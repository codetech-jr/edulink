import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { CreditCard, Megaphone, ArrowUpRight } from 'lucide-react'
import {
  PaymentFeedItem,
  AnnouncementFeedItem,
  type PaymentFeedRecord,
  type AnnouncementFeedRecord,
} from './ActivityFeedItems'

interface ActivityFeedProps {
  schoolId: string
}

export async function ActivityFeed({ schoolId }: ActivityFeedProps) {
  const supabase = await createClient()

  // 1. Consultas concurrentes (Últimos 5 pagos + Últimos 2 comunicados)
  const [paymentsResult, announcementsResult] = await Promise.all([
    supabase
      .from('payments')
      .select(`
        id,
        amount_usd,
        status,
        payment_method,
        reference_number,
        created_at,
        transaction_date,
        students (
          id,
          full_name
        )
      `)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('communications')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const payments = (paymentsResult.data ?? []) as unknown as PaymentFeedRecord[]
  const announcements = ((announcementsResult.data ?? []) as unknown as AnnouncementFeedRecord[])
    .filter((a) => !a.is_archived)
    .slice(0, 2)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda / Central: Últimos 5 pagos (2 columnas en desktop) */}
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-600" />
                <CardTitle className="text-base font-semibold text-zinc-900">
                  Transacciones Recientes
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-zinc-500 mt-1">
                Últimos comprobantes de pago registrados en la plataforma
              </CardDescription>
            </div>
            <Link
              href="/admin/payments"
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-indigo-600 transition-colors p-1.5 rounded-lg hover:bg-zinc-100"
            >
              <span>Ver todos</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CreditCard className="h-8 w-8 text-zinc-300 mb-2" />
              <p className="text-xs font-medium text-zinc-600">
                No hay pagos registrados aún
              </p>
              <p className="text-2xs text-zinc-400 mt-0.5">
                Los pagos reportados por representantes aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {payments.map((p) => (
                <PaymentFeedItem key={p.id} payment={p} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Columna Derecha: Últimos Comunicados Oficiales (1 columna) */}
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-indigo-600" />
                <CardTitle className="text-base font-semibold text-zinc-900">
                  Circulares
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-zinc-500 mt-1">
                Últimos comunicados publicados
              </CardDescription>
            </div>
            <Link
              href="/admin/comunicados"
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-indigo-600 transition-colors p-1.5 rounded-lg hover:bg-zinc-100"
            >
              <span>Ver todos</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="pt-2 flex-1 flex flex-col justify-between">
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center my-auto">
              <Megaphone className="h-8 w-8 text-zinc-300 mb-2" />
              <p className="text-xs font-medium text-zinc-600">
                Sin comunicados activos
              </p>
              <Link
                href="/admin/comunicados"
                className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                + Publicar circular
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <AnnouncementFeedItem key={a.id} announcement={a} />
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-zinc-100">
            <Link
              href="/admin/comunicados"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <Megaphone className="h-3.5 w-3.5" />
              <span>Emitir nuevo comunicado</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
