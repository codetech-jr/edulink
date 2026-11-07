'use client'

import React, { useState } from 'react'
import {
  AlertTriangle,
  AlertCircle,
  MessageCircle,
  ArrowUpDown,
  Flame,
} from 'lucide-react'
import { StudentAttendanceMonthly } from '@/lib/types/attendance-admin'
import { formatWhatsAppLink } from '@/lib/utils/whatsapp'

interface MonthlyAttendanceViewProps {
  data: StudentAttendanceMonthly[]
  schoolName: string
  monthName: string
  year: number
}

type SortField = 'absent_count' | 'full_name' | 'attendance_percentage' | 'course_name'

export function MonthlyAttendanceView({
  data,
  schoolName,
  monthName,
  year,
}: MonthlyAttendanceViewProps) {
  const [sortField, setSortField] = useState<SortField>('absent_count')
  const [sortAsc, setSortAsc] = useState<boolean>(false)

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-700">
          No se encontraron registros de estudiantes para {monthName} {year}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Verifica que los docentes hayan pasado lista durante este mes o selecciona otro mes.
        </p>
      </div>
    )
  }

  // Ordenamiento interactivo
  const sortedData = [...data].sort((a, b) => {
    let comparison = 0
    if (sortField === 'absent_count') {
      comparison = a.absent_count - b.absent_count
    } else if (sortField === 'attendance_percentage') {
      comparison = a.attendance_percentage - b.attendance_percentage
    } else if (sortField === 'full_name') {
      comparison = a.full_name.localeCompare(b.full_name)
    } else if (sortField === 'course_name') {
      comparison = a.course_name.localeCompare(b.course_name)
    }
    return sortAsc ? comparison : -comparison
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(field === 'full_name' || field === 'course_name')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden print:border-0 print:shadow-none print:rounded-none">
      {/* Banner explicativo (Solo en pantalla, oculto en impresión) */}
      <div className="bg-amber-50/70 border-b border-amber-200/60 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900 print:hidden">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Normativa MPPE (Art. 109 RLOE):</strong> Los alumnos con más del <strong>25% de inasistencias</strong> quedan en riesgo de perder derecho a evaluación final de lapso.
          </span>
        </div>
        <span className="hidden sm:inline-block font-semibold text-amber-800 shrink-0">
          Corte: {monthName} {year}
        </span>
      </div>

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left border-collapse text-sm print:text-[10px] print:border print:border-slate-800">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider print:bg-slate-100 print:text-slate-900 print:border-b-2 print:border-slate-800">
              {/* N° correlativo */}
              <th scope="col" className="py-3.5 px-3 text-center w-10 print:py-1.5 print:px-1 print:border print:border-slate-400">
                N°
              </th>

              {/* Estudiante */}
              <th
                scope="col"
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors print:py-1.5 print:px-2 print:border print:border-slate-400 print:cursor-default"
                onClick={() => handleSort('full_name')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Estudiante</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                </div>
              </th>

              {/* Curso */}
              <th
                scope="col"
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors print:py-1.5 print:px-2 print:border print:border-slate-400 print:cursor-default"
                onClick={() => handleSort('course_name')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Curso</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                </div>
              </th>

              {/* CONTADOR DE INASISTENCIAS (DESTACADO) */}
              <th
                scope="col"
                className="py-3.5 px-3 text-center cursor-pointer bg-rose-50/50 hover:bg-rose-100/50 text-rose-800 transition-colors print:bg-transparent print:text-slate-900 print:py-1.5 print:px-2 print:border print:border-slate-400 print:cursor-default"
                onClick={() => handleSort('absent_count')}
                title="Total de inasistencias injustificadas acumuladas en el mes"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Faltas</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-rose-600 print:hidden" />
                </div>
              </th>

              {/* Justificadas */}
              <th scope="col" className="py-3.5 px-2 text-center text-slate-600 print:py-1.5 print:px-1.5 print:border print:border-slate-400 print:text-slate-900">
                Justif.
              </th>

              {/* Retardos */}
              <th scope="col" className="py-3.5 px-2 text-center text-slate-600 print:py-1.5 print:px-1.5 print:border print:border-slate-400 print:text-slate-900">
                Ret.
              </th>

              {/* Presentes */}
              <th scope="col" className="py-3.5 px-2 text-center text-slate-600 print:py-1.5 print:px-1.5 print:border print:border-slate-400 print:text-slate-900">
                Asist.
              </th>

              {/* % Asistencia */}
              <th
                scope="col"
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-center print:py-1.5 print:px-2 print:border print:border-slate-400 print:cursor-default print:text-slate-900"
                onClick={() => handleSort('attendance_percentage')}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>% Asist.</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                </div>
              </th>

              {/* Representante / Tutor */}
              <th scope="col" className="py-3.5 px-3 print:py-1.5 print:px-2 print:border print:border-slate-400 print:text-slate-900">
                Representante / Tutor
              </th>

              {/* Acciones (Solo en pantalla) */}
              <th scope="col" className="py-3.5 px-4 text-right print:hidden">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 print:divide-y-0">
            {sortedData.map((student, index) => {
              const hasCriticalRisk = student.risk_level === 'critico'
              const hasWarning = student.risk_level === 'advertencia'
              const alertMsg = `Estimado(a) representante ${student.parent_name || ''}: Le saludamos cordialmente desde la Dirección de ${schoolName}. Le notificamos que su representado(a) ${student.full_name} acumula ${student.absent_count} inasistencias durante el mes de ${monthName} de ${year} (alcanzando un ${student.attendance_percentage}% de asistencia). Le recordamos que según el artículo 109 del Reglamento de la Ley Orgánica de Educación (RLOE), el límite máximo permitido de inasistencias es del 25% para mantener el derecho a evaluación. Por favor comuníquese a la brevedad con la Coordinación del plantel.`
              const waLink = formatWhatsAppLink(student.parent_phone, alertMsg)

              return (
                <tr
                  key={student.student_id}
                  className={`hover:bg-slate-50/70 transition-colors print:break-inside-avoid print:border-b print:border-slate-300 ${
                    hasCriticalRisk
                      ? 'bg-rose-50/25 print:bg-transparent'
                      : hasWarning
                      ? 'bg-amber-50/15 print:bg-transparent'
                      : ''
                  }`}
                >
                  {/* N° correlativo */}
                  <td className="py-3.5 px-3 text-center text-xs font-mono text-slate-500 print:py-1.5 print:px-1 print:border print:border-slate-300 print:text-black">
                    {index + 1}
                  </td>

                  {/* Estudiante */}
                  <td className="py-3.5 px-4 print:py-1.5 print:px-2 print:border print:border-slate-300">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-bold text-slate-900 print:text-black">
                          {student.full_name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono print:text-slate-700">
                          {student.cedula ? `V-${student.cedula}` : 'Sin cédula'}
                          {student.list_number && (
                            <span className="ml-2 font-sans text-slate-400 print:text-slate-600">
                              #{student.list_number}
                            </span>
                          )}
                        </div>
                      </div>
                      {hasCriticalRisk && (
                        <span className="inline-flex p-1 rounded-md bg-rose-100 text-rose-700 shrink-0 print:hidden" title="En riesgo crítico según Art. 109 RLOE">
                          <Flame className="w-3.5 h-3.5 animate-bounce" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Curso */}
                  <td className="py-3.5 px-3 print:py-1.5 print:px-2 print:border print:border-slate-300">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 print:bg-transparent print:p-0 print:text-black">
                      {student.course_name}
                    </span>
                  </td>

                  {/* CONTADOR DE INASISTENCIAS DEL MES */}
                  <td className="py-3.5 px-3 text-center print:py-1.5 print:px-2 print:border print:border-slate-300">
                    <span
                      className={`inline-flex items-center justify-center min-w-[2.2rem] px-2.5 py-1 rounded-xl text-sm font-extrabold print:bg-transparent print:p-0 print:text-black print:text-[11px] ${
                        student.absent_count >= 5
                          ? 'bg-rose-600 text-white shadow-xs animate-pulse print:text-black'
                          : student.absent_count >= 1
                          ? 'bg-rose-100 text-rose-700 font-bold print:text-black'
                          : 'bg-slate-100 text-slate-400 font-medium print:text-slate-600'
                      }`}
                      title={`${student.absent_count} inasistencias en ${monthName}`}
                    >
                      {student.absent_count}
                    </span>
                  </td>

                  {/* Justificadas */}
                  <td className="py-3.5 px-2 text-center text-xs font-medium text-slate-600 print:py-1.5 print:px-1.5 print:border print:border-slate-300 print:text-black">
                    {student.justified_count}
                  </td>

                  {/* Retardos */}
                  <td className="py-3.5 px-2 text-center text-xs font-medium text-slate-600 print:py-1.5 print:px-1.5 print:border print:border-slate-300 print:text-black">
                    {student.tardy_count}
                  </td>

                  {/* Presentes */}
                  <td className="py-3.5 px-2 text-center text-xs font-semibold text-slate-800 print:py-1.5 print:px-1.5 print:border print:border-slate-300 print:text-black">
                    {student.present_count}
                  </td>

                  {/* % Asistencia */}
                  <td className="py-3.5 px-4 text-center min-w-[110px] print:py-1.5 print:px-2 print:border print:border-slate-300 print:min-w-0">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-extrabold print:text-black ${
                            student.attendance_percentage >= 85
                              ? 'text-emerald-700'
                              : student.attendance_percentage >= 75
                              ? 'text-amber-700'
                              : 'text-rose-600 font-black'
                          }`}
                        >
                          {student.attendance_percentage}%
                        </span>
                        <span className="text-[10px] text-slate-400 print:text-slate-600">
                          ({student.total_records})
                        </span>
                      </div>

                      {/* Mini Barra de Progreso (Solo en pantalla) */}
                      <div className="w-full max-w-[90px] h-1.5 bg-slate-100 rounded-full overflow-hidden print:hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            student.attendance_percentage >= 85
                              ? 'bg-emerald-500'
                              : student.attendance_percentage >= 75
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${student.attendance_percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Representante / Tutor */}
                  <td className="py-3.5 px-3 print:py-1.5 print:px-2 print:border print:border-slate-300">
                    {student.parent_name ? (
                      <div>
                        <div className="text-xs font-semibold text-slate-800 print:text-black">
                          {student.parent_name}
                        </div>
                        <div className="text-[11px] text-slate-500 print:text-slate-700">
                          {student.relationship || 'Tutor Legal'}
                          {student.parent_phone && (
                            <span className="hidden print:inline">
                              {' '}&bull; {student.parent_phone}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic print:text-slate-600">
                        Sin tutor asignado
                      </span>
                    )}
                  </td>

                  {/* Acciones (Oculto al imprimir) */}
                  <td className="py-3.5 px-4 text-right print:hidden">
                    {waLink ? (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                          hasCriticalRisk
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : student.absent_count > 0
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        title={`Enviar notificación formal a ${student.parent_name || 'representante'}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{hasCriticalRisk ? 'Citar Tutor' : 'WhatsApp'}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {student.parent_phone ? student.parent_phone : 'Sin teléfono'}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
