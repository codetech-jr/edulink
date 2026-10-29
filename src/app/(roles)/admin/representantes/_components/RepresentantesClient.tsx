'use client'

import React, { useState } from 'react'
import {
  Search,
  Phone,
  MessageCircle,
  ShieldCheck,
  User,
  Edit2,
  X,
  AlertCircle,
} from 'lucide-react'
import { updateRepresentativeAction } from '@/actions/representative-actions'

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
  const [repsList, setRepsList] = useState(representatives)
  const [searchTerm, setSearchTerm] = useState('')

  // Estado del modal de edición
  const [editingRep, setEditingRep] = useState<RepresentativeWithStudents | null>(null)
  const [editFullName, setEditFullName] = useState('')
  const [editCedula, setEditCedula] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleOpenEdit = (rep: RepresentativeWithStudents) => {
    setEditingRep(rep)
    setEditFullName(rep.fullName)
    setEditCedula(rep.cedula || '')
    setEditPhone(rep.phone || '')
    setErrorMsg(null)
  }

  const handleCloseEdit = () => {
    if (isSaving) return
    setEditingRep(null)
    setErrorMsg(null)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRep) return

    const trimmedName = editFullName.trim()
    if (!trimmedName || trimmedName.length < 3) {
      setErrorMsg('El nombre completo debe tener al menos 3 caracteres.')
      return
    }

    setIsSaving(true)
    setErrorMsg(null)

    try {
      const res = await updateRepresentativeAction({
        representativeId: editingRep.id,
        fullName: trimmedName,
        cedula: editCedula.trim() || null,
        phone: editPhone.trim() || null,
      })

      if (res.error) {
        setErrorMsg(res.error)
        setIsSaving(false)
        return
      }

      // Actualizar estado local inmediatamente
      setRepsList((prev) =>
        prev.map((r) =>
          r.id === editingRep.id
            ? {
                ...r,
                fullName: trimmedName,
                cedula: editCedula.trim() || null,
                phone: editPhone.trim() || null,
              }
            : r
        )
      )

      setEditingRep(null)
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar los cambios.')
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = repsList.filter((rep) => {
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
          Mostrando <span className="text-gray-900 font-bold">{filtered.length}</span> de {repsList.length} tutores
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
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rep)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 rounded-xl text-xs font-bold transition-all border border-blue-100/60 active:scale-95"
                            title={`Editar datos de ${rep.fullName}`}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Editar</span>
                          </button>

                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-xl text-xs font-bold transition-all border border-emerald-100/60 active:scale-95"
                              title="Abrir chat en WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
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

      {/* Modal para Editar Tutor / Representante */}
      {editingRep && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Editar Representante / Tutor</h3>
                  <p className="text-xs text-gray-500">Actualiza los datos personales y de contacto.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={isSaving}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Ej. Pedro José Pérez"
                  required
                  disabled={isSaving}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Cédula de Identidad
                </label>
                <input
                  type="text"
                  value={editCedula}
                  onChange={(e) => setEditCedula(e.target.value)}
                  placeholder="Ej. V-12345678"
                  disabled={isSaving}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Teléfono de Contacto (WhatsApp)
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Ej. 04141234567"
                    disabled={isSaving}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Permite habilitar el acceso directo a WhatsApp para notificaciones o consultas.
                </p>
              </div>

              {editingRep.students.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-500 block mb-2">
                    Estudiantes a cargo ({editingRep.students.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {editingRep.students.map((st) => (
                      <span
                        key={st.id}
                        className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
                      >
                        {st.fullName} ({st.courseName})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
