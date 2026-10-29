'use client'

import { useState } from 'react'
import { Edit2, Trash2, AlertCircle } from 'lucide-react'
import { deleteStudent } from '@/actions/student-actions'
import Link from 'next/link'

interface StudentRowActionsProps {
  studentId: string
  studentName: string
}

export function StudentRowActions({ studentId, studentName }: StudentRowActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteStudent(studentId)
      setShowConfirm(false)
    } catch (error: any /* TODO: tipado pendiente */) {
      alert(error.message || 'Error al eliminar el estudiante')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
      <Link
        href={`/admin/students/${studentId}/edit`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 rounded-xl text-xs font-bold transition-all border border-blue-100/60 active:scale-95"
        title={`Editar datos de ${studentName}`}
      >
        <Edit2 className="w-3.5 h-3.5 text-blue-600" />
        <span>Editar</span>
      </Link>

      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl text-xs font-bold transition-all border border-red-100/60 active:scale-95"
        title={`Eliminar a ${studentName}`}
      >
        <Trash2 className="w-3.5 h-3.5 text-red-600" />
        <span>Eliminar</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-100 p-3 rounded-xl">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿Eliminar estudiante?</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Estás a punto de eliminar a <strong className="text-gray-900">{studentName}</strong> de la base de datos. Se perderán todos sus registros asociados.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
