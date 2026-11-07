'use client'

import React from 'react'
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  HelpCircle,
  MessageCircle,
  AlertCircle,
} from 'lucide-react'
import { StudentAttendanceDaily } from '@/lib/types/attendance-admin'
import { formatWhatsAppLink } from '@/lib/utils/whatsapp'

interface DailyAttendanceViewProps {
  data: StudentAttendanceDaily[]
  schoolName: string
  targetDate: string
}

export function DailyAttendanceView({
  data,
  schoolName,
  targetDate,
}: DailyAttendanceViewProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-700">
          No se encontraron estudiantes
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Verifica los filtros seleccionados o el término de búsqueda.
        </p>
      </div>
    )
  }

  const getStatusBadge = (status: StudentAttendanceDaily['status']) => {
    switch (status) {
      case 'presente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 print:bg-transparent print:border-0 print:p-0 print:text-black">
            <CheckCircle2 className="w-3.5 h-3.5 print:hidden" />
            Presente
          </span>
        )
      case 'ausente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse print:bg-transparent print:border-0 print:p-0 print:text-black print:font-bold">
            <XCircle className="w-3.5 h-3.5 print:hidden" />
            Ausente
          </span>
        )
      case 'tarde':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 print:bg-transparent print:border-0 print:p-0 print:text-black">
            <Clock className="w-3.5 h-3.5 print:hidden" />
            Tarde
          </span>
        )
      case 'justificado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 print:bg-transparent print:border-0 print:p-0 print:text-black">
            <ShieldCheck className="w-3.5 h-3.5 print:hidden" />
            Justificado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 print:bg-transparent print:border-0 print:p-0 print:text-slate-500">
            <HelpCircle className="w-3.5 h-3.5 print:hidden" />
            Sin registro
          </span>
        )
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden print:border-0 print:shadow-none print:rounded-none">
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left border-collapse text-sm print:text-[10px] print:border print:border-slate-800">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider print:bg-slate-100 print:text-slate-900 print:border-b-2 print:border-slate-800">
              <th scope="col" className="py-3 px-3 text-center w-10 print:py-1.5 print:px-1 print:border print:border-slate-400">N°</th>
              <th scope="col" className="py-3 px-4 print:py-1.5 print:px-2 print:border print:border-slate-400">Estudiante</th>
              <th scope="col" className="py-3 px-3 print:py-1.5 print:px-2 print:border print:border-slate-400">Curso</th>
              <th scope="col" className="py-3 px-3 print:py-1.5 print:px-2 print:border print:border-slate-400">Estado</th>
              <th scope="col" className="py-3 px-3 print:py-1.5 print:px-2 print:border print:border-slate-400">Asignaturas / Obs.</th>
              <th scope="col" className="py-3 px-3 print:py-1.5 print:px-2 print:border print:border-slate-400">Representante / Tutor</th>
              <th scope="col" className="py-3 px-4 text-right print:hidden">Contacto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 print:divide-y-0">
            {data.map((student, index) => {
              const isAbsent = student.status === 'ausente'
              const alertMsg = `Estimado(a) representante ${student.parent_name || ''}: Le saludamos desde la Dirección de ${schoolName}. Le informamos que su representado(a) ${student.full_name} registró INASISTENCIA el día de hoy (${targetDate}). Por favor comuníquese con la institución a la brevedad para justificar su falta.`
              const waLink = formatWhatsAppLink(student.parent_phone, alertMsg)

              return (
                <tr
                  key={student.student_id}
                  className={`hover:bg-slate-50/60 transition-colors print:break-inside-avoid print:border-b print:border-slate-300 ${
                    isAbsent ? 'bg-rose-50/20 print:bg-transparent' : ''
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

                  {/* Estado Hoy */}
                  <td className="py-3 px-3 print:py-1.5 print:px-2 print:border print:border-slate-300">
                    {getStatusBadge(student.status)}
                  </td>

                  {/* Asignaturas / Observaciones */}
                  <td className="py-3 px-3 max-w-xs print:py-1.5 print:px-2 print:border print:border-slate-300 print:max-w-none">
                    {student.subject_names.length > 0 ? (
                      <div className="text-xs text-slate-700 font-medium truncate print:text-black print:overflow-visible">
                        {student.subject_names.join(', ')}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic print:text-slate-600">
                        {student.status === 'sin_registro' ? 'Pase de lista pendiente' : 'General'}
                      </span>
                    )}
                    {student.notes && (
                      <div className="text-xs text-slate-500 truncate mt-0.5 print:text-slate-700 print:overflow-visible" title={student.notes}>
                        Obs: {student.notes}
                      </div>
                    )}
                  </td>

                  {/* Representante */}
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
                        Sin tutor asignado
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
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                          isAbsent
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        title="Enviar mensaje por WhatsApp al representante"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isAbsent ? 'Alertar Falta' : 'WhatsApp'}</span>
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
