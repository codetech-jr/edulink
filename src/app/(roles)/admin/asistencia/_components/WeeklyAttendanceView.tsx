'use client'

import React from 'react'
import {
  AlertCircle,
  MessageCircle,
} from 'lucide-react'
import { StudentAttendanceWeekly } from '@/lib/types/attendance-admin'
import { formatWhatsAppLink } from '@/lib/utils/whatsapp'

interface WeeklyAttendanceViewProps {
  data: StudentAttendanceWeekly[]
  schoolName: string
  weekStartStr: string
  weekEndStr: string
}

export function WeeklyAttendanceView({
  data,
  schoolName,
  weekStartStr,
  weekEndStr,
}: WeeklyAttendanceViewProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-700">
          No se encontraron estudiantes para esta semana
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Ajusta la semana en los filtros superiores.
        </p>
      </div>
    )
  }

  const renderDayBadge = (status: string, notes: string | null) => {
    switch (status) {
      case 'presente':
        return (
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 print:bg-transparent print:text-black print:font-bold print:w-auto print:h-auto"
            title={notes ? `Presente: ${notes}` : 'Presente'}
          >
            P
          </span>
        )
      case 'ausente':
        return (
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold bg-rose-500 text-white shadow-xs print:bg-transparent print:text-black print:font-black print:w-auto print:h-auto"
            title={notes ? `Falta injustificada: ${notes}` : 'Ausente'}
          >
            A
          </span>
        )
      case 'tarde':
        return (
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold bg-amber-200 text-amber-900 print:bg-transparent print:text-black print:w-auto print:h-auto"
            title={notes ? `Retardo: ${notes}` : 'Retardo'}
          >
            T
          </span>
        )
      case 'justificado':
        return (
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 print:bg-transparent print:text-black print:w-auto print:h-auto"
            title={notes ? `Justificado: ${notes}` : 'Justificado'}
          >
            J
          </span>
        )
      default:
        return (
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-medium bg-slate-100 text-slate-400 print:bg-transparent print:text-slate-400 print:w-auto print:h-auto"
            title="Sin registro"
          >
            -
          </span>
        )
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden print:border-0 print:shadow-none print:rounded-none">
      {/* Legend (Solo en pantalla) */}
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 print:hidden">
        <span className="font-semibold text-slate-700">
          Semana del {weekStartStr} al {weekEndStr}:
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">P</span>
            Presente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-rose-500 text-white font-bold flex items-center justify-center text-[10px]">A</span>
            Ausente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px]">T</span>
            Tarde
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">J</span>
            Justificado
          </span>
        </div>
      </div>

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left border-collapse text-sm print:text-[10px] print:border print:border-slate-800">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider print:bg-slate-100 print:text-slate-900 print:border-b-2 print:border-slate-800">
              <th scope="col" className="py-3 px-3 text-center w-10 print:py-1.5 print:px-1 print:border print:border-slate-400">N°</th>
              <th scope="col" className="py-3 px-4 print:py-1.5 print:px-2 print:border print:border-slate-400">Estudiante</th>
              <th scope="col" className="py-3 px-3 print:py-1.5 print:px-2 print:border print:border-slate-400">Curso</th>
              <th scope="col" className="py-3 px-2 text-center print:py-1.5 print:px-1 print:border print:border-slate-400">Lun</th>
              <th scope="col" className="py-3 px-2 text-center print:py-1.5 print:px-1 print:border print:border-slate-400">Mar</th>
              <th scope="col" className="py-3 px-2 text-center print:py-1.5 print:px-1 print:border print:border-slate-400">Mié</th>
              <th scope="col" className="py-3 px-2 text-center print:py-1.5 print:px-1 print:border print:border-slate-400">Jue</th>
              <th scope="col" className="py-3 px-2 text-center print:py-1.5 print:px-1 print:border print:border-slate-400">Vie</th>
              <th scope="col" className="py-3 px-3 text-center print:py-1.5 print:px-1.5 print:border print:border-slate-400">Faltas</th>
              <th scope="col" className="py-3 px-3 text-center print:py-1.5 print:px-1.5 print:border print:border-slate-400">% Sem.</th>
              <th scope="col" className="py-3 px-3 print:py-1.5 print:px-2 print:border print:border-slate-400">Tutor Legal</th>
              <th scope="col" className="py-3 px-4 text-right print:hidden">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 print:divide-y-0">
            {data.map((student, index) => {
              const hasAbsences = student.absent_count > 0
              const alertMsg = `Estimado(a) representante ${student.parent_name || ''}: Saludos desde la Dirección de ${schoolName}. Le notificamos que su representado(a) ${student.full_name} acumuló ${student.absent_count} inasistencias durante la semana del ${weekStartStr} al ${weekEndStr} (% de asistencia semanal: ${student.attendance_percentage}%). Le agradecemos comunicarse con coordinación para el seguimiento escolar.`
              const waLink = formatWhatsAppLink(student.parent_phone, alertMsg)

              return (
                <tr
                  key={student.student_id}
                  className={`hover:bg-slate-50/60 transition-colors print:break-inside-avoid print:border-b print:border-slate-300 ${
                    hasAbsences ? 'bg-rose-50/15 print:bg-transparent' : ''
                  }`}
                >
                  {/* N° correlativo */}
                  <td className="py-3 px-3 text-center text-xs font-mono text-slate-500 print:py-1.5 print:px-1 print:border print:border-slate-300 print:text-black">
                    {index + 1}
                  </td>

                  {/* Estudiante */}
                  <td className="py-3 px-4 print:py-1.5 print:px-2 print:border print:border-slate-300">
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
                  </td>

                  {/* Curso */}
                  <td className="py-3 px-3 print:py-1.5 print:px-2 print:border print:border-slate-300">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 print:bg-transparent print:p-0 print:text-black">
                      {student.course_name}
                    </span>
                  </td>

                  {/* 5 Días de la Semana */}
                  {student.days.map((day) => (
                    <td key={day.date} className="py-3 px-2 text-center print:py-1.5 print:px-1 print:border print:border-slate-300">
                      {renderDayBadge(day.status, day.notes)}
                    </td>
                  ))}

                  {/* Faltas en la semana */}
                  <td className="py-3 px-3 text-center print:py-1.5 print:px-1.5 print:border print:border-slate-300">
                    <span
                      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-bold print:p-0 print:text-black ${
                        student.absent_count > 0
                          ? 'bg-rose-100 text-rose-700 font-extrabold print:text-black'
                          : 'text-slate-500 print:text-slate-600'
                      }`}
                    >
                      {student.absent_count}
                    </span>
                  </td>

                  {/* % Asistencia */}
                  <td className="py-3 px-3 text-center print:py-1.5 print:px-1.5 print:border print:border-slate-300">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold print:bg-transparent print:p-0 print:text-black ${
                        student.attendance_percentage >= 85
                          ? 'bg-emerald-50 text-emerald-700'
                          : student.attendance_percentage >= 75
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-100 text-rose-800 font-bold'
                      }`}
                    >
                      {student.attendance_percentage}%
                    </span>
                  </td>

                  {/* Tutor */}
                  <td className="py-3 px-3 print:py-1.5 print:px-2 print:border print:border-slate-300">
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
                        Sin tutor
                      </span>
                    )}
                  </td>

                  {/* Contacto WhatsApp */}
                  <td className="py-3 px-4 text-right print:hidden">
                    {waLink ? (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
                        title={`Enviar resumen semanal por WhatsApp a ${student.parent_name || 'representante'}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Avisar</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {student.parent_name ? student.parent_name : 'Sin tutor'}
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
