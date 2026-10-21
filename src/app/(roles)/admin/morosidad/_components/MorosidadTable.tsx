'use client'

import React from 'react'
import { Eye, MessageSquare, CheckCircle2, Clock, AlertCircle, Sparkles, UserCheck } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { StudentMorosidadRecord } from './AccountStatementModal'

interface MorosidadTableProps {
  students: StudentMorosidadRecord[]
  bcvRate: number
  onViewStatement: (student: StudentMorosidadRecord) => void
  onSendReminder: (student: StudentMorosidadRecord) => void
  filterStatus: string
}

function getStatusBadge(status: 'al_dia' | 'pendiente' | 'moroso') {
  switch (status) {
    case 'al_dia':
      return (
        <Badge variant="success" size="sm" className="gap-1 font-semibold">
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          <span>Al día</span>
        </Badge>
      )
    case 'pendiente':
      return (
        <Badge variant="warning" size="sm" className="gap-1 font-semibold">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span>Por verificar</span>
        </Badge>
      )
    case 'moroso':
      return (
        <Badge variant="danger" size="sm" className="gap-1 font-semibold">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          <span>Moroso</span>
        </Badge>
      )
  }
}

export function MorosidadTable({
  students,
  bcvRate,
  onViewStatement,
  onSendReminder,
  filterStatus,
}: MorosidadTableProps) {
  // Cálculos del pie de tabla para los registros visibles
  const alDiaCount = students.filter((s) => s.status === 'al_dia').length
  const pendienteCount = students.filter((s) => s.status === 'pendiente').length
  const morosoCount = students.filter((s) => s.status === 'moroso').length
  const totalDebtUsd = students.reduce((sum, s) => sum + s.debt_usd, 0)
  const totalDebtVes = students.reduce((sum, s) => sum + s.debt_ves, 0)

  // Empty state: cuando no hay estudiantes en la vista
  if (students.length === 0) {
    if (filterStatus === 'moroso') {
      return (
        <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/40 p-12 text-center my-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-emerald-950">
            ¡Excelente! Sin morosos
          </h3>
          <p className="mt-1 text-xs text-emerald-700 max-w-sm mx-auto">
            Todos los estudiantes registrados tienen sus pagos de colegiatura al día para el mes en curso.
          </p>
        </div>
      )
    }

    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center my-6">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
          <UserCheck className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800">
          No se encontraron estudiantes
        </h3>
        <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
          Intente ajustando los términos de búsqueda o cambiando el filtro de grado o estado.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden flex flex-col">
      {/* Contenedor con scroll vertical y cabecera pegajosa (Sticky Header) */}
      <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs border-b border-zinc-200 shadow-2xs">
            <tr className="text-2xs font-semibold uppercase tracking-wider text-zinc-500">
              <th scope="col" className="py-3 px-3.5 text-center w-12">
                #
              </th>
              <th scope="col" className="py-3 px-4">
                Alumno
              </th>
              <th scope="col" className="py-3 px-4">
                Grado / Sección
              </th>
              <th scope="col" className="py-3 px-4">
                Representante
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Deuda USD
              </th>
              <th scope="col" className="py-3 px-4 text-center">
                Estado
              </th>
              <th scope="col" className="py-3 px-4 text-center w-28">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {students.map((student, idx) => {
              const hasDebt = student.debt_usd > 0

              return (
                <tr
                  key={student.id}
                  className="hover:bg-zinc-50/70 transition-colors group"
                >
                  {/* # Lista */}
                  <td className="py-3 px-3.5 text-center font-mono text-zinc-400 text-2xs">
                    {student.list_number ?? idx + 1}
                  </td>

                  {/* Alumno */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                      {student.full_name}
                    </div>
                    <div className="text-2xs text-zinc-400 font-mono mt-0.5">
                      {student.cedula ? `C.I. ${student.cedula}` : 'Sin cédula'}
                    </div>
                  </td>

                  {/* Grado - Sección */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-medium text-zinc-700">
                      {student.grade_level}° &ldquo;{student.section}&rdquo;
                    </span>
                    <span className="block text-2xs text-zinc-400 truncate max-w-[140px]">
                      {student.course_name}
                    </span>
                  </td>

                  {/* Representante */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-zinc-800">
                      {student.representative_name}
                    </div>
                    {student.representative_phone ? (
                      <div className="text-2xs text-zinc-400 font-mono mt-0.5">
                        {student.representative_phone}
                      </div>
                    ) : (
                      <div className="text-2xs text-zinc-300 italic mt-0.5">
                        Sin teléfono registrado
                      </div>
                    )}
                  </td>

                  {/* Deuda USD */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div
                      className={`font-bold ${
                        hasDebt ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      ${student.debt_usd.toFixed(2)}
                    </div>
                    {hasDebt && (
                      <div className="text-2xs text-zinc-400 mt-0.5 font-mono">
                        ≈ Bs. {student.debt_ves.toLocaleString('es-VE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    )}
                  </td>

                  {/* Estado Visual + Texto Accesible (WCAG AA) */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {getStatusBadge(student.status)}
                  </td>

                  {/* Acciones (Touch Targets ≥ 44x44px en móviles) */}
                  <td className="py-2.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      {/* Botón Ver Estado de Cuenta */}
                      <button
                        type="button"
                        onClick={() => onViewStatement(student)}
                        className="inline-flex items-center justify-center h-10 w-10 sm:h-8 sm:w-8 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Ver Estado de Cuenta completo"
                        aria-label={`Ver estado de cuenta de ${student.full_name}`}
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </button>

                      {/* Botón Recordatorio WhatsApp */}
                      <button
                        type="button"
                        onClick={() => onSendReminder(student)}
                        className="inline-flex items-center justify-center h-10 w-10 sm:h-8 sm:w-8 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Enviar recordatorio por WhatsApp"
                        aria-label={`Enviar recordatorio de WhatsApp a ${student.representative_name}`}
                      >
                        <MessageSquare className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer de la Tabla con Totales */}
      <div className="border-t border-zinc-200 bg-zinc-50/90 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 text-zinc-600">
          <span className="font-semibold text-zinc-800">
            {students.length} estudiante{students.length === 1 ? '' : 's'}
          </span>
          <span className="text-zinc-300">•</span>
          <span className="text-emerald-700 font-medium">
            {alDiaCount} al día
          </span>
          <span className="text-zinc-300">•</span>
          <span className="text-amber-700 font-medium">
            {pendienteCount} por verificar
          </span>
          <span className="text-zinc-300">•</span>
          <span className="text-rose-700 font-medium">
            {morosoCount} moroso{morosoCount === 1 ? '' : 's'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-zinc-500">Deuda visible: </span>
          <span className="font-bold text-zinc-900 text-sm">
            ${totalDebtUsd.toFixed(2)} USD
          </span>
          <span className="text-zinc-400 font-mono text-2xs ml-1.5">
            (Bs. {totalDebtVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </span>
        </div>
      </div>
    </div>
  )
}
