'use client'

import React from 'react'
import {
  GraduationCap,
  Phone,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  UserPlus,
} from 'lucide-react'
import type { EnrollmentRequest } from './EnrollmentManagementClient'

interface EnrollmentTableProps {
  filteredRequests: EnrollmentRequest[]
  searchQuery: string
  onOpenDocs: (req: EnrollmentRequest) => void
  onOpenApprove: (req: EnrollmentRequest) => void
  onOpenReject: (req: EnrollmentRequest) => void
}

export function EnrollmentTable({
  filteredRequests,
  searchQuery,
  onOpenDocs,
  onOpenApprove,
  onOpenReject,
}: EnrollmentTableProps) {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  if (filteredRequests.length === 0) {
    return (
      <div className="py-14 px-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
          <UserPlus className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900">No se encontraron solicitudes</h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
          {searchQuery
            ? 'No hay registros que coincidan con los criterios de búsqueda aplicados.'
            : 'No existen solicitudes de inscripción registradas en esta categoría.'}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm text-gray-600">
        <thead className="bg-gray-50/90 text-gray-500 uppercase tracking-wider text-[11px] font-bold border-b border-gray-200">
          <tr>
            <th scope="col" className="px-5 py-4">
              Aspirante
            </th>
            <th scope="col" className="px-5 py-4">
              Nivel Solicitado
            </th>
            <th scope="col" className="px-5 py-4">
              Representante
            </th>
            <th scope="col" className="px-5 py-4 text-center">
              Recaudos
            </th>
            <th scope="col" className="px-5 py-4 text-center">
              Estado
            </th>
            <th scope="col" className="px-5 py-4 text-right">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredRequests.map((req) => {
            const docs = Array.isArray(req.documents) ? req.documents : []
            const cleanPhone = req.parent_phone.replace(/\D/g, '')
            const intlPhone = cleanPhone.startsWith('0') ? `58${cleanPhone.slice(1)}` : cleanPhone

            return (
              <tr key={req.id} className="hover:bg-gray-50/70 transition-colors">
                {/* Aspirante */}
                <td className="px-5 py-4">
                  <div className="font-bold text-gray-900 text-sm">{req.student_name}</div>
                  <div className="text-gray-400 text-xs mt-0.5 flex flex-wrap items-center gap-1.5">
                    {req.student_cedula ? (
                      <span>C.I: {req.student_cedula}</span>
                    ) : (
                      <span className="italic text-gray-400">Sin cédula</span>
                    )}
                    {req.student_birth_date && (
                      <>
                        <span>•</span>
                        <span>Nac: {req.student_birth_date}</span>
                      </>
                    )}
                  </div>
                </td>

                {/* Nivel Solicitado */}
                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs border border-emerald-100">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{req.grade_requested}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Registrado: {formatDate(req.created_at)}
                  </div>
                </td>

                {/* Representante */}
                <td className="px-5 py-4">
                  <div className="font-semibold text-gray-900">{req.parent_name}</div>
                  <div className="text-gray-500 text-xs flex flex-wrap items-center gap-2 mt-0.5">
                    <span>C.I: {req.parent_cedula}</span>
                    <span>•</span>
                    <a
                      href={`https://wa.me/${intlPhone}?text=Hola%20${encodeURIComponent(
                        req.parent_name
                      )},%20te%20escribimos%20desde%20la%20coordinación%20de%20admisión.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                      title="Abrir chat en WhatsApp"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{req.parent_phone}</span>
                    </a>
                  </div>
                </td>

                {/* Recaudos */}
                <td className="px-5 py-4 text-center">
                  {docs.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => onOpenDocs(req)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all border border-blue-200/60 min-h-[36px]"
                      title="Ver documentos adjuntos"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{docs.length} archivo(s)</span>
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs italic">Sin adjuntos</span>
                  )}
                </td>

                {/* Estado */}
                <td className="px-5 py-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      req.status === 'aprobado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'pendiente'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {req.status === 'aprobado' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                    {req.status === 'pendiente' && <Clock className="w-3 h-3 text-amber-700" />}
                    {req.status === 'rechazado' && <XCircle className="w-3 h-3 text-rose-700" />}
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                  {req.status === 'rechazado' && req.rejection_reason && (
                    <div
                      className="text-[10px] text-rose-600 mt-1 max-w-[140px] mx-auto truncate"
                      title={req.rejection_reason}
                    >
                      Motivo: {req.rejection_reason}
                    </div>
                  )}
                </td>

                {/* Acciones */}
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  {req.status === 'pendiente' ? (
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenApprove(req)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-[0.98] min-h-[38px]"
                        title="Aprobar y matricular en el colegio"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprobar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenReject(req)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all border border-rose-200 active:scale-[0.98] min-h-[38px]"
                        title="Rechazar solicitud con motivo"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">Procesada</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
