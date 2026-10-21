'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveGradesAction, publishGradesAction } from '@/actions/teacher-actions'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { PrintPlanButton } from '@/components/PrintPlanButton'
import { GradingTable, type Student, type Evaluation, type LocalGradesState } from './GradingTable'
import { GradingActionsBar } from './GradingActionsBar'
import { GradingHeader } from './GradingHeader'
import { useBoletinesZip } from './useBoletinesZip'
import type { GradingSheetProps, GradePayload } from './types'

export type { Grade, GradingSheetProps } from './types'

export function GradingSheet({
  students,
  evaluations,
  initialGrades,
  subjectId,
  termId,
  subjectName,
  termName,
  teacherName,
  courseName,
}: GradingSheetProps) {
  const router = useRouter()
  const [isSaving, startSavingTransition] = useTransition()
  const [isPublishing, startPublishingTransition] = useTransition()
  const [isResetting, startResettingTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const { isDownloadingZip, zipProgress, downloadBoletinesZip } = useBoletinesZip({
    students,
    termId,
    termName,
    courseName,
    onSuccess: (msg) => {
      setSuccessMsg(msg)
      setError(null)
    },
    onError: (msg) => {
      setError(msg)
      setSuccessMsg(null)
    },
  })

  const [grades, setGrades] = useState<LocalGradesState>(() => {
    const state: LocalGradesState = {}
    students.forEach((student) => {
      state[student.id] = {}
      evaluations.forEach((evalItem) => {
        const match = initialGrades.find(
          (g) => g.student_id === student.id && g.evaluation_id === evalItem.id
        )
        state[student.id][evalItem.id] = {
          score: match && match.score !== null ? match.score.toString() : '',
          is_absent: match ? match.is_absent : false,
          notes: match?.notes || '',
        }
      })
    })
    return state
  })

  const isPublished = evaluations.length > 0 ? evaluations[0].is_published : false

  const handleScoreChange = (studentId: string, evaluationId: string, value: string) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [evaluationId]: {
          ...prev[studentId][evaluationId],
          score: value,
        },
      },
    }))
    setSuccessMsg(null)
    setError(null)
  }

  const handleAbsentToggle = (studentId: string, evaluationId: string) => {
    setGrades((prev) => {
      const current = prev[studentId][evaluationId]
      const newAbsent = !current.is_absent
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [evaluationId]: {
            ...current,
            is_absent: newAbsent,
            score: '',
          },
        },
      }
    })
    setSuccessMsg(null)
    setError(null)
  }

  const calculateAverage = (studentId: string) => {
    let totalScore = 0
    let totalWeightUsed = 0

    evaluations.forEach((evalItem) => {
      const record = grades[studentId]?.[evalItem.id]
      if (!record) return
      const weight = Number(evalItem.weight)

      if (record.is_absent) {
        totalScore += 1.0 * (weight / 100)
        totalWeightUsed += weight
      } else if (record.score !== '') {
        const scoreVal = parseFloat(record.score) || 1.0
        totalScore += scoreVal * (weight / 100)
        totalWeightUsed += weight
      }
    })

    if (totalWeightUsed === 0) return null
    return totalScore
  }

  const handleSaveGrades = () => {
    setError(null)
    setSuccessMsg(null)
    const gradesList: GradePayload[] = []
    let validationError: string | null = null

    students.forEach((student) => {
      evaluations.forEach((evalItem) => {
        const record = grades[student.id]?.[evalItem.id]
        if (!record) return
        const scoreVal = record.score !== '' ? parseFloat(record.score) : null

        if (!record.is_absent && scoreVal !== null) {
          if (scoreVal < 1 || scoreVal > 20) {
            validationError = `La nota de ${student.full_name} en "${evalItem.name}" (${scoreVal}) está fuera de la escala 1-20.`
            return
          }
        }

        gradesList.push({
          student_id: student.id,
          evaluation_id: evalItem.id,
          score: record.is_absent ? null : scoreVal,
          is_absent: record.is_absent,
          notes: record.notes.trim() || null,
        })
      })
    })

    if (validationError) {
      setError(validationError)
      return
    }

    startSavingTransition(async () => {
      const res = await saveGradesAction(gradesList)
      if (!res.success) {
        setError(res.error || 'Error al guardar las calificaciones.')
      } else {
        setSuccessMsg('¡Calificaciones guardadas exitosamente!')
        router.refresh()
      }
    })
  }

  const handlePublishToggle = () => {
    setError(null)
    setSuccessMsg(null)
    const nextState = !isPublished

    startPublishingTransition(async () => {
      const res = await publishGradesAction(subjectId, termId, nextState)
      if (!res.success) {
        setError(res.error || 'Error al actualizar el estado de publicación.')
      } else {
        setSuccessMsg(nextState ? '¡Notas publicadas! Ahora son visibles en el portal de representantes.' : 'Notas ocultadas. Estado cambiado a Borrador.')
        router.refresh()
      }
    })
  }

  const handleResetPlan = () => {
    if (!window.confirm('¿Estás seguro de que deseas reconfigurar el plan de evaluación? Esto eliminará PERMANENTEMENTE todas las evaluaciones y las calificaciones asociadas a este lapso.')) {
      return
    }

    setError(null)
    setSuccessMsg(null)

    startResettingTransition(async () => {
      try {
        const { resetEvaluationPlanAction } = await import('@/actions/teacher-actions')
        const actionRes = await resetEvaluationPlanAction(subjectId, termId)
        if (!actionRes.success) {
          setError(actionRes.error || 'Error al restablecer el plan de evaluación.')
        } else {
          router.refresh()
        }
      } catch {
        setError('Error al restablecer el plan de evaluación.')
      }
    })
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-6 print:hidden">
        <GradingHeader
          subjectName={subjectName}
          termName={termName}
          courseName={courseName}
          teacherName={teacherName}
          evaluations={evaluations}
          students={students}
          isPublished={isPublished}
          isDownloadingZip={isDownloadingZip}
          zipProgress={zipProgress}
          isResetting={isResetting}
          isSaving={isSaving}
          onDownloadZip={downloadBoletinesZip}
          onResetPlan={handleResetPlan}
        />

        {error && (
          <div role="alert" aria-live="polite" className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 font-bold flex gap-2.5 items-center">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div role="status" aria-live="polite" className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-700 font-bold flex gap-2.5 items-center">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <GradingTable
          students={students}
          evaluations={evaluations}
          grades={grades}
          isSaving={isSaving}
          onScoreChange={handleScoreChange}
          onAbsentToggle={handleAbsentToggle}
          calculateAverage={calculateAverage}
        />

        <GradingActionsBar
          isPublished={isPublished}
          isPublishing={isPublishing}
          isSaving={isSaving}
          isResetting={isResetting}
          isDownloadingZip={isDownloadingZip}
          zipProgress={zipProgress}
          studentsCount={students.length}
          onPublishToggle={handlePublishToggle}
          onDownloadZip={downloadBoletinesZip}
          onSaveGrades={handleSaveGrades}
        />
      </div>

      <PrintPlanButton
        termName={termName}
        teacherName={teacherName}
        subjectName={subjectName}
        courseName={courseName}
        evaluations={evaluations}
      />
    </>
  )
}
