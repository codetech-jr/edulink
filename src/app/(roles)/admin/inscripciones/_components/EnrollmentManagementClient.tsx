'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  AlertCircle,
  Users,
} from 'lucide-react'
import {
  approveEnrollmentRequestAction,
  rejectEnrollmentRequestAction,
  getSignedDocumentUrlAction,
} from '@/actions/enrollment-actions'
import { EnrollmentKPIs } from './EnrollmentKPIs'
import { EnrollmentFilterBar } from './EnrollmentFilterBar'
import { EnrollmentTable } from './EnrollmentTable'
import { EnrollmentDocModal } from './EnrollmentDocModal'
import { EnrollmentApproveModal } from './EnrollmentApproveModal'
import { EnrollmentRejectModal } from './EnrollmentRejectModal'
import type { EnrollmentRequest, CourseOption } from './types'

export type { EnrollmentDocument, EnrollmentRequest, CourseOption } from './types'

interface EnrollmentManagementClientProps {
  initialRequests: EnrollmentRequest[]
  courses: CourseOption[]
  userName: string
}

export function EnrollmentManagementClient({
  initialRequests,
  courses,
}: EnrollmentManagementClientProps) {
  const [requests, setRequests] = useState<EnrollmentRequest[]>(initialRequests)
  const [activeTab, setActiveTab] = useState<'pendiente' | 'aprobado' | 'rechazado' | 'all'>('pendiente')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Modales
  const [selectedRequestForDocs, setSelectedRequestForDocs] = useState<EnrollmentRequest | null>(null)
  const [selectedRequestForApprove, setSelectedRequestForApprove] = useState<EnrollmentRequest | null>(null)
  const [selectedRequestForReject, setSelectedRequestForReject] = useState<EnrollmentRequest | null>(null)

  // Estado de modales
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [loadingDocPath, setLoadingDocPath] = useState<string | null>(null)

  // Conteos para tabs y KPIs
  const countPendientes = requests.filter((r) => r.status === 'pendiente').length
  const countAprobadas = requests.filter((r) => r.status === 'aprobado').length
  const countRechazadas = requests.filter((r) => r.status === 'rechazado').length

  // Filtrado reactivo
  const filteredRequests = requests.filter((req) => {
    if (activeTab !== 'all' && req.status !== activeTab) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchStudent = req.student_name.toLowerCase().includes(q)
      const matchCedula = (req.student_cedula || '').toLowerCase().includes(q)
      const matchParent = req.parent_name.toLowerCase().includes(q)
      const matchGrade = req.grade_requested.toLowerCase().includes(q)
      return matchStudent || matchCedula || matchParent || matchGrade
    }
    return true
  })

  // Manejar Aprobación
  const handleConfirmApprove = () => {
    if (!selectedRequestForApprove) return
    setFeedback(null)
    const targetRequestId = selectedRequestForApprove.id
    const targetStudentName = selectedRequestForApprove.student_name

    startTransition(async () => {
      try {
        const result = await approveEnrollmentRequestAction(targetRequestId, selectedCourseId)
        if (result.error) {
          setFeedback({ type: 'error', message: result.error })
        } else {
          setRequests((prev) =>
            prev.map((r) => (r.id === targetRequestId ? { ...r, status: 'aprobado' } : r))
          )
          setFeedback({
            type: 'success',
            message: `¡Solicitud de "${targetStudentName}" aprobada e inscrita exitosamente!`,
          })
          setSelectedRequestForApprove(null)
          setSelectedCourseId('')
        }
      } catch (err: unknown) { // TODO: tipado pendiente
        const msg = err instanceof Error ? err.message : 'Error al aprobar solicitud'
        setFeedback({ type: 'error', message: msg })
      }
    })
  }

  // Manejar Rechazo
  const handleConfirmReject = () => {
    if (!selectedRequestForReject) return
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      setFeedback({ type: 'error', message: 'Indica un motivo de rechazo válido (mínimo 5 caracteres).' })
      return
    }

    setFeedback(null)
    const targetRequestId = selectedRequestForReject.id

    startTransition(async () => {
      try {
        const result = await rejectEnrollmentRequestAction(targetRequestId, rejectionReason.trim())
        if (result.error) {
          setFeedback({ type: 'error', message: result.error })
        } else {
          setRequests((prev) =>
            prev.map((r) =>
              r.id === targetRequestId
                ? { ...r, status: 'rechazado', rejection_reason: rejectionReason.trim() }
                : r
            )
          )
          setFeedback({
            type: 'success',
            message: 'La solicitud ha sido marcada como rechazada con el motivo indicado.',
          })
          setSelectedRequestForReject(null)
          setRejectionReason('')
        }
      } catch (err: unknown) { // TODO: tipado pendiente
        const msg = err instanceof Error ? err.message : 'Error al rechazar solicitud'
        setFeedback({ type: 'error', message: msg })
      }
    })
  }

  // Descarga / Apertura segura de documento firmado
  const handleOpenDocument = async (docPath: string) => {
    setLoadingDocPath(docPath)
    try {
      const result = await getSignedDocumentUrlAction(docPath)
      if (result.success && result.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer')
      } else {
        alert(result.error || 'No se pudo generar el enlace del archivo')
      }
    } catch {
      alert('Error al acceder al documento seguro')
    } finally {
      setLoadingDocPath(null)
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
      {/* ── Encabezado de Página ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <Link href="/admin" className="hover:text-emerald-600 transition-colors">Admin</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Admisiones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span className="bg-emerald-600 w-2 h-7 rounded-full inline-block" />
            Gestión de Inscripciones
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium">
            Revisa, aprueba o rechaza solicitudes de nuevo ingreso escolar recibidas desde el portal público.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all min-h-[44px]"
          >
            <Users className="w-4 h-4 text-gray-600" />
            Ver Alumnado
          </Link>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          role="alert"
          aria-live="polite"
          className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-700 p-1"
            aria-label="Cerrar alerta"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── KPIs Rápidos ── */}
      <EnrollmentKPIs
        countPendientes={countPendientes}
        countAprobadas={countAprobadas}
        countRechazadas={countRechazadas}
        totalCount={requests.length}
      />

      {/* ── Controles de Filtros y Búsqueda ── */}
      <EnrollmentFilterBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        countPendientes={countPendientes}
        countAprobadas={countAprobadas}
        countRechazadas={countRechazadas}
        totalCount={requests.length}
      />

      {/* ── Tabla de Solicitudes ── */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        <EnrollmentTable
          filteredRequests={filteredRequests}
          searchQuery={searchQuery}
          onOpenDocs={(req) => setSelectedRequestForDocs(req)}
          onOpenApprove={(req) => {
            setSelectedRequestForApprove(req)
            setSelectedCourseId('')
          }}
          onOpenReject={(req) => {
            setSelectedRequestForReject(req)
            setRejectionReason('')
          }}
        />
      </div>

      {/* Modales con Focus Trap y Escape */}
      <EnrollmentDocModal
        request={selectedRequestForDocs}
        onClose={() => setSelectedRequestForDocs(null)}
        loadingDocPath={loadingDocPath}
        onOpenDocument={handleOpenDocument}
      />

      <EnrollmentApproveModal
        request={selectedRequestForApprove}
        onClose={() => setSelectedRequestForApprove(null)}
        courses={courses}
        selectedCourseId={selectedCourseId}
        setSelectedCourseId={setSelectedCourseId}
        isPending={isPending}
        onConfirmApprove={handleConfirmApprove}
      />

      <EnrollmentRejectModal
        request={selectedRequestForReject}
        onClose={() => setSelectedRequestForReject(null)}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        isPending={isPending}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  )
}
