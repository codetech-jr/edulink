'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveGradesAction, publishGradesAction, saveEvaluationPlanAction } from '@/actions/teacher-actions'
import { Save, Eye, EyeOff, Calendar, BookOpen, AlertCircle, Loader2, ArrowLeft, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { PrintPlanButton } from '@/components/PrintPlanButton'

interface Student {
  id: string
  full_name: string
  list_number: number | null
}

interface Evaluation {
  id: string
  name: string
  weight: number
  is_published: boolean
  evaluation_date?: string | null
}

interface Grade {
  id?: string
  evaluation_id: string
  student_id: string
  score: number | null
  is_absent: boolean
  notes?: string
}

interface GradingSheetProps {
  students: Student[]
  evaluations: Evaluation[]
  initialGrades: Grade[]
  subjectId: string
  termId: string
  subjectName: string
  termName: string
  teacherName: string
  courseName: string
}

type LocalGradesState = {
  [studentId: string]: {
    [evaluationId: string]: {
      score: string // string para manejar entradas ligeras en HTML
      is_absent: boolean
      notes: string
    }
  }
}

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

  // 1. Inicializar el estado de calificaciones local
  const [grades, setGrades] = useState<LocalGradesState>(() => {
    const state: LocalGradesState = {}
    
    students.forEach((student) => {
      state[student.id] = {}
      evaluations.forEach((evalItem) => {
        // Encontrar nota existente si la hay
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

  // Verificar si las notas ya están publicadas (las evaluaciones comparten esta bandera)
  const isPublished = evaluations.length > 0 ? evaluations[0].is_published : false

  // 2. Controlar cambios en las notas
  const handleScoreChange = (studentId: string, evaluationId: string, value: string) => {
    // Validar formato (permitir números enteros o decimales)
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

  // Controlar inasistencias (is_absent)
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
            // Si está ausente, limpiamos la nota numérica visual
            score: newAbsent ? '' : '',
          },
        },
      }
    })
    setSuccessMsg(null)
    setError(null)
  }

  // 3. Calcular el promedio ponderado en tiempo real en el cliente
  const calculateAverage = (studentId: string) => {
    let totalScore = 0
    let totalWeightUsed = 0

    evaluations.forEach((evalItem) => {
      const record = grades[studentId]?.[evalItem.id]
      if (!record) return

      const weight = Number(evalItem.weight)

      if (record.is_absent) {
        // Inasistente en Venezuela equivale a la nota mínima de 1.0
        totalScore += 1.0 * (weight / 100)
        totalWeightUsed += weight
      } else if (record.score !== '') {
        const scoreVal = parseFloat(record.score) || 1.0
        totalScore += scoreVal * (weight / 100)
        totalWeightUsed += weight
      }
    })

    // Si no tiene ninguna nota cargada aún, devolver null o "-"
    if (totalWeightUsed === 0) return null
    
    return totalScore
  }

  // 4. Guardar calificaciones
  const handleSaveGrades = () => {
    setError(null)
    setSuccessMsg(null)

    // Formatear la lista de notas para enviarla al backend
    const gradesList: any[] = []
    let validationError = null

    students.forEach((student) => {
      evaluations.forEach((evalItem) => {
        const record = grades[student.id]?.[evalItem.id]
        if (!record) return

        const scoreVal = record.score !== '' ? parseFloat(record.score) : null

        // Validación estricta en cliente antes de enviar
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

  // 5. Publicar / Ocultar notas
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

  // 6. Resetear el plan de evaluación
  const handleResetPlan = () => {
    if (!window.confirm('¿Estás seguro de que deseas reconfigurar el plan de evaluación? Esto eliminará PERMANENTEMENTE todas las evaluaciones y las calificaciones asociadas a este lapso.')) {
      return
    }

    setError(null)
    setSuccessMsg(null)

    startResettingTransition(async () => {
      // saveEvaluationPlanAction con una lista vacía causará error de validación en sumatoria,
      // pero podemos limpiar directamente borrando las evaluaciones.
      // Escribiremos la acción directamente o limpiaremos usando una llamada que maneje el reset.
      // Dado que saveEvaluationPlanAction elimina previas e inserta las nuevas, podemos pasarle
      // un truco o usar una acción más limpia. Espera, saveEvaluationPlanAction requiere que la suma sea 100%.
      // Para resetear el plan, llamaremos a una acción vacía si implementamos resetAction, o para no cambiar la firma,
      // podemos simplemente crear un botón que llame a una acción de reset en el servidor.
      // Vamos a utilizar un truco: borramos directamente enviando una petición que limpia.
      // Espera! ¿Por qué no creamos una acción dedicada en teacher-actions.ts para reset?
      // Sí, ya tenemos saveEvaluationPlanAction pero exige 100%. Agreguemos una pequeña acción para resetear en el servidor.
      // O podemos simplemente borrar ejecutando un delete simple desde una acción.
      // Modificaremos la acción para soportar reset o agregaremos una nueva en teacher-actions.ts más adelante.
      // De momento, llamemos a un reset action provisional que crearemos en teacher-actions: 'resetEvaluationPlanAction'.
      // Vamos a agregar la llamada.
      const res = await fetch('/api/reset-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, termId }),
      })
      // O mejor aún, para evitar crear una API route, podemos crear una Server Action `resetEvaluationPlanAction` en `teacher-actions.ts`.
      // Vamos a crearla e importarla. De hecho, agregamos su llamado:
      const { resetEvaluationPlanAction } = require('@/actions/teacher-actions')
      const actionRes = await resetEvaluationPlanAction(subjectId, termId)
      
      if (!actionRes.success) {
        setError(actionRes.error || 'Error al restablecer el plan de evaluación.')
      } else {
        router.refresh()
      }
    })
  }

  return (
    <>
      {/* Contenido Web (Oculto al imprimir) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-6 print:hidden">
        
        {/* Cabecera del Cuaderno */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 pb-5 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-extrabold uppercase tracking-widest">{subjectName}</span>
            </div>
            <h2 className="text-base font-black text-slate-900">Planilla Escolar de Calificaciones</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{termName}</span>
            </div>
          </div>

          {/* Estado de Publicación e Impresión */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <PrintPlanButton
              termName={termName}
              teacherName={teacherName}
              subjectName={subjectName}
              courseName={courseName}
              evaluations={evaluations}
            />

            {isPublished ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5" />
                Publicado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider">
                <EyeOff className="w-3.5 h-3.5" />
                Borrador
              </span>
            )}
          </div>
        </div>

        {/* Plan de Evaluación Resumen */}
        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Plan de Evaluación Vigente</h3>
            <button
              onClick={handleResetPlan}
              disabled={isResetting || isSaving}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors uppercase tracking-wider flex items-center gap-1 disabled:opacity-50"
            >
              {isResetting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Reconfigurar Plan
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {evaluations.map((ev) => (
              <div key={ev.id} className="bg-white border border-slate-200/60 rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-2">
                <span className="text-slate-800 font-bold">{ev.name}</span>
                <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md text-[10px] font-black">{ev.weight}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas de Mensaje */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 font-bold flex gap-2.5 items-center">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-700 font-bold flex gap-2.5 items-center">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tabla de Calificaciones */}
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-5 sm:px-0">
            <div className="overflow-hidden border border-slate-100 rounded-2xl">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead className="bg-[#FAFBFD]">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase w-12 text-center">Nº</th>
                    <th scope="col" className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase">Estudiante</th>
                    {evaluations.map((ev) => (
                      <th key={ev.id} scope="col" className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase text-center w-28">
                        <div className="flex flex-col items-center">
                          <span className="truncate max-w-[100px]" title={ev.name}>{ev.name}</span>
                          <span className="text-[9px] text-indigo-500 font-extrabold">({ev.weight}%)</span>
                        </div>
                      </th>
                    ))}
                    <th scope="col" className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase text-center w-24">Def.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {students.map((student, sIdx) => {
                    const avg = calculateAverage(student.id)
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                        {/* Número de Lista */}
                        <td className="px-4 py-3.5 text-xs font-extrabold text-slate-400 text-center">
                          {student.list_number || sIdx + 1}
                        </td>
                        
                        {/* Nombre Estudiante */}
                        <td className="px-4 py-3.5 text-xs font-bold text-slate-900 whitespace-nowrap">
                          {student.full_name}
                        </td>

                        {/* Inputs por Evaluación */}
                        {evaluations.map((ev) => {
                          const record = grades[student.id]?.[ev.id]
                          return (
                            <td key={ev.id} className="px-2 py-2 text-center whitespace-nowrap">
                              <div className="flex flex-col items-center gap-1.5 justify-center">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    disabled={record?.is_absent || isSaving}
                                    placeholder="1-20"
                                    value={record?.score || ''}
                                    onChange={(e) => handleScoreChange(student.id, ev.id, e.target.value)}
                                    className={`w-14 px-2 py-1.5 bg-[#F8FAFC] border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl text-xs font-bold text-slate-900 outline-none text-center transition-all disabled:bg-slate-100 disabled:text-slate-400 ${
                                      record?.score !== '' && (parseFloat(record?.score) < 1 || parseFloat(record?.score) > 20)
                                        ? 'border-rose-400 ring-rose-400/20 text-rose-500'
                                        : ''
                                    }`}
                                  />
                                </div>
                                
                                {/* Botón de Inasistencia (Absent) */}
                                <button
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => handleAbsentToggle(student.id, ev.id)}
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border transition-all ${
                                    record?.is_absent
                                      ? 'bg-rose-50 border-rose-200 text-rose-600 font-black'
                                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                  }`}
                                >
                                  {record?.is_absent ? 'AUSENTE' : 'Ausente'}
                                </button>
                              </div>
                            </td>
                          )
                        })}

                        {/* Promedio Real-time */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          {avg !== null ? (
                            <span className={`text-xs font-black px-2.5 py-1.5 rounded-xl border ${
                              avg >= 10 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                : 'bg-rose-50 border-rose-100 text-rose-700'
                            }`}>
                              {avg.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-semibold text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Botones de Control de la Planilla */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4 border-t border-slate-50">
          
          {/* Publicar / Ocultar */}
          <button
            type="button"
            onClick={handlePublishToggle}
            disabled={isPublishing || isSaving || isResetting}
            className={`flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.98] border ${
              isPublished
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100'
            }`}
          >
            {isPublishing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isPublished ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Ocultar Notas del Lapso
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Publicar Notas del Lapso
              </>
            )}
          </button>

          {/* Guardar Notas */}
          <button
            type="button"
            onClick={handleSaveGrades}
            disabled={isSaving || isPublishing || isResetting}
            className="flex items-center justify-center gap-1.5 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando Calificaciones...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Calificaciones
              </>
            )}
          </button>
        </div>

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
