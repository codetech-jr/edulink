import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { AlertTriangle, Clock, UserX, ArrowRight } from 'lucide-react'

interface AlertBannersProps {
  schoolId: string
}

export async function AlertBanners({ schoolId }: AlertBannersProps) {
  const supabase = await createClient()

  // 1. Calcular timestamps de comparación
  const todayStr = new Date().toISOString().split('T')[0]
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  // 2. Consultas concurrentes para detectar estados anómalos o de atención
  const [latestRateResult, pendingOldPaymentsResult, unassignedStudentsResult] =
    await Promise.all([
      // Tasa BCV más reciente registrada
      supabase
        .from('exchange_rates')
        .select('rate, rate_date')
        .eq('school_id', schoolId)
        .order('rate_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // Pagos pendientes con más de 48 horas de antigüedad
      supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('status', 'pendiente')
        .lt('created_at', fortyEightHoursAgo),

      // Estudiantes activos sin aula o sección asignada
      supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .is('course_id', null),
    ])

  const latestRate = latestRateResult.data
  const isRateOutdated = !latestRate || latestRate.rate_date < todayStr
  const oldPaymentsCount = pendingOldPaymentsResult.count ?? 0
  const unassignedStudentsCount = unassignedStudentsResult.count ?? 0

  // Si no hay ninguna condición de alerta activa, no renderizar nada
  if (!isRateOutdated && oldPaymentsCount === 0 && unassignedStudentsCount === 0) {
    return null
  }

  return (
    <div className="space-y-3" role="region" aria-label="Alertas institucionales prioritarias">
      {/* Alerta 1: Tasa BCV desactualizada */}
      {isRateOutdated && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200/90 bg-amber-50/70 p-4 text-amber-900 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700 shrink-0">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-amber-900">
                Tasa Oficial BCV no actualizada hoy
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                {latestRate
                  ? `La última tasa registrada data del ${latestRate.rate_date}. Actualícela para garantizar la precisión en cobros y conversiones.`
                  : 'Aún no se ha registrado ninguna tasa de cambio para la institución.'}
              </p>
            </div>
          </div>
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1.5 self-start sm:self-center text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200/80 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            Actualizar tasa
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Alerta 2: Pagos pendientes con retraso crítico (>48 horas) */}
      {oldPaymentsCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-rose-200/90 bg-rose-50/70 p-4 text-rose-900 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-rose-100 p-2 text-rose-700 shrink-0">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-rose-900">
                {oldPaymentsCount === 1
                  ? '1 pago pendiente supera las 48 horas de espera'
                  : `${oldPaymentsCount} pagos pendientes superan las 48 horas de espera`}
              </p>
              <p className="mt-0.5 text-xs text-rose-700">
                Los representantes están esperando confirmación de sus comprobantes para emitir recibos.
              </p>
            </div>
          </div>
          <Link
            href="/admin/payments?status=pendiente"
            className="inline-flex items-center gap-1.5 self-start sm:self-center text-xs font-semibold text-rose-900 hover:text-rose-950 bg-rose-100/80 hover:bg-rose-200/80 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            Revisar pagos
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Alerta 3: Estudiantes sin curso asignado */}
      {unassignedStudentsCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-200/90 bg-blue-50/70 p-4 text-blue-900 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700 shrink-0">
              <UserX className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-blue-900">
                {unassignedStudentsCount === 1
                  ? '1 estudiante activo no tiene curso o sección asignada'
                  : `${unassignedStudentsCount} estudiantes activos no tienen curso o sección asignada`}
              </p>
              <p className="mt-0.5 text-xs text-blue-700">
                Asigne un grado a los alumnos para que sus profesores puedan cargar calificaciones y asistencias.
              </p>
            </div>
          </div>
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 self-start sm:self-center text-xs font-semibold text-blue-900 hover:text-blue-950 bg-blue-100/80 hover:bg-blue-200/80 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            Asignar cursos
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  )
}
