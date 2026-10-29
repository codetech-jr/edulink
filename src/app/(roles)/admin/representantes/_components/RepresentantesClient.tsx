'use client'

import React, { useState } from 'react'
import { Search, Phone, ExternalLink, Users, MessageCircle, ShieldCheck, User } from 'lucide-react'

export interface RepresentativeWithStudents {
  id: string
  fullName: string
  cedula?: string | null
  phone?: string | null
  email?: string | null
  students: Array<{
    id: string
    fullName: string
    cedula?: string | null
    courseName: string
    relationship?: string | null
  }>
}

interface RepresentantesClientProps {
  representatives: RepresentativeWithStudents[]
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  madre: 'Madre',
  padre: 'Padre',
  abuela: 'Abuela',
  abuelo: 'Abuelo',
  tia: 'Tía',
  tio: 'Tío',
  hermana: 'Hermana',
  hermano: 'Hermano',
  tutor_legal: 'Tutor Legal',
  otro: 'Tutor / Familiar',
}

export function RepresentantesClient({ representatives }: RepresentantesClientProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = representatives.filter((rep) => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return true

    const matchRep =
      rep.fullName.toLowerCase().includes(term) ||
      (rep.cedula && rep.cedula.toLowerCase().includes(term)) ||
      (rep.phone && rep.phone.includes(term))

    const matchStudent = rep.students.some(
      (s) =>
        s.fullName.toLowerCase().includes(term) ||
        (s.cedula && s.cedula.toLowerCase().includes(term)) ||
        s.courseName.toLowerCase().includes(term)
    )

    return matchRep || matchStudent
  })

  return (
    <div className="space-y-6">
      {/* Barra de Búsqueda Rápida */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, cédula o alumno representado..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
          />
        </div>

        <div className="text-xs text-gray-500 font-semibold self-end sm:self-center">
          Mostrando <span className="text-gray-900 font-bold">{filtered.length}</span> de {representatives.length} tutores
        </div>
      </div>

      {/* Tabla de Representantes */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th scope="col" className="px-6 py-4">Representante / Tutor</th>
                <th scope="col" className="px-6 py-4">Cédula</th>
                <th scope="col" className="px-6 py-4">Contacto (WhatsApp)</th>
                <th scope="col" className="px-6 py-4">Estudiantes a Cargo</th>
                <th scope="col" className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No se encontraron representantes con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((rep) => {
                  const rawPhone = rep.phone ? rep.phone.replace(/[^0-9]/g, '') : ''
                  const cleanPhone = rawPhone.startsWith('0') ? `58${rawPhone.slice(1)}` : rawPhone
                  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null

                  return (
                    <tr key={rep.id} className="hover:bg-blue-50/30 transition-colors group">
                      {/* Representante */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100/60">
                            {rep.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block leading-tight">
                              {rep.fullName}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <ShieldCheck className="w-3 h-3 text-indigo-500" />
                              Tutor Legal Registrado
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cédula */}
                      <td className="px-6 py-4 text-gray-600 font-semibold text-xs whitespace-nowrap">
                        {rep.cedula || '—'}
                      </td>

                      {/* Teléfono y WhatsApp */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {rep.phone ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-700 font-semibold">{rep.phone}</span>
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir chat en WhatsApp"
                                className="p-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Sin teléfono</span>
                        )}
                      </td>

                      {/* Alumnos a cargo */}
                      <td className="px-6 py-4">
                        {rep.students.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {rep.students.map((student) => {
                              const relLabel = student.relationship
                                ? RELATIONSHIP_LABELS[student.relationship.toLowerCase()] || student.relationship
                                : null

                              return (
                                <span
                                  key={student.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-blue-50 text-gray-800 hover:text-blue-700 rounded-lg text-xs font-semibold border border-gray-200/60 transition-colors"
                                >
                                  <User className="w-3 h-3 text-gray-400" />
                                  <span>{student.fullName}</span>
                                  <span className="text-gray-400">({student.courseName})</span>
                                  {relLabel && (
                                    <span className="px-1.5 py-0.2 bg-white rounded text-[10px] text-indigo-600 font-bold border border-gray-200">
                                      {relLabel}
                                    </span>
                                  )}
                                </span>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sin alumnos vinculados</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
