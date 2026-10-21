'use client'

import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { CheckCircle2 } from 'lucide-react'
import type { EnrollmentRequest, CourseOption } from './EnrollmentManagementClient'

interface EnrollmentApproveModalProps {
  request: EnrollmentRequest | null
  onClose: () => void
  courses: CourseOption[]
  selectedCourseId: string
  setSelectedCourseId: (id: string) => void
  isPending: boolean
  onConfirmApprove: () => void
}

export function EnrollmentApproveModal({
  request,
  onClose,
  courses,
  selectedCourseId,
  setSelectedCourseId,
  isPending,
  onConfirmApprove,
}: EnrollmentApproveModalProps) {
  if (!request) return null

  return (
    <Modal open={Boolean(request)} onClose={onClose} size="md">
      <Modal.Header onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <Modal.Title>Aprobar Solicitud de Ingreso</Modal.Title>
            <Modal.Description>
              Se creará la ficha del estudiante en el sistema.
            </Modal.Description>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-6">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-4 text-xs space-y-1.5">
          <p>
            Aspirante:{' '}
            <strong className="text-gray-900 font-bold text-sm">
              {request.student_name}
            </strong>
          </p>
          <p>
            Cédula:{' '}
            <strong className="text-gray-800">
              {request.student_cedula || 'Pendiente por asignar'}
            </strong>
          </p>
          <p>
            Grado solicitado:{' '}
            <strong className="text-emerald-700 font-bold">
              {request.grade_requested}
            </strong>
          </p>
          <p>
            Representante:{' '}
            <strong className="text-gray-800">{request.parent_name}</strong>
          </p>
        </div>

        {/* Selector opcional de curso */}
        <div className="mb-2">
          <label
            htmlFor="assign_course"
            className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
          >
            Asignar al Curso o Sección <span className="text-gray-400 font-normal lowercase">(opcional)</span>
          </label>
          <select
            id="assign_course"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[44px]"
          >
            <option value="">-- Asignar aula más adelante --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.grade_level}° "{course.section}" - {course.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">
            Puedes asignar la sección ahora o hacerlo más tarde desde la gestión de alumnado.
          </p>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors min-h-[44px]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirmApprove}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 min-h-[44px]"
          >
            {isPending ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Confirmar y Matricular</span>
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}
