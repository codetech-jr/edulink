'use client'

import { useState } from 'react'
import { BookOpenCheck } from 'lucide-react'
import { PrintPlanButton } from '@/components/PrintPlanButton'

// TODO: tipado pendiente
interface EvaluationGrade {
  name: string
  weight: number
  evaluation_date: string | null
  teacherName: string
  score: number | null
  is_absent: boolean
  notes: string | null
}

interface GradesAccordionProps {
  studentName: string
  // TODO: tipado pendiente
  course: any
  // TODO: tipado pendiente
  grades?: any[]
}

export function GradesAccordion({ studentName, course, grades = [] }: GradesAccordionProps) {
  const [printSubjectId, setPrintSubjectId] = useState<string | null>(null)

  // Agrupar calificaciones por Lapso y Asignatura
  const gradesByTerm: Record<string, Record<string, { grades: EvaluationGrade[]; average: number | null }>> = {}

  grades.forEach((g) => {
    // TODO: tipado pendiente
    const evalInfo = g.evaluations as any
    const termName = evalInfo?.terms?.name || 'Lapso General'
    const subjectName = evalInfo?.subjects?.name || 'Materia General'

    if (!gradesByTerm[termName]) {
      gradesByTerm[termName] = {}
    }
    if (!gradesByTerm[termName][subjectName]) {
      gradesByTerm[termName][subjectName] = { grades: [], average: null }
    }

    gradesByTerm[termName][subjectName].grades.push({
      name: evalInfo?.name || 'Evaluación',
      weight: Number(evalInfo?.weight || 0),
      evaluation_date: evalInfo?.evaluation_date || null,
      teacherName: evalInfo?.subjects?.teacherName || 'Docente de la Asignatura',
      score: g.score,
      is_absent: g.is_absent,
      notes: g.notes,
    })
  })

  // Calcular promedios
  Object.keys(gradesByTerm).forEach((term) => {
    Object.keys(gradesByTerm[term]).forEach((sub) => {
      const list = gradesByTerm[term][sub].grades
      let weightedSum = 0
      let totalWeight = 0
      list.forEach((item) => {
        const score = item.is_absent ? 1.0 : (item.score || 1.0)
        weightedSum += score * (item.weight / 100)
        totalWeight += item.weight
      })
      const average = totalWeight > 0 ? weightedSum / (totalWeight / 100) : null
      gradesByTerm[term][sub].average = average
    })
  })

  return (
    <div className="p-5 border-b border-zinc-100 space-y-4">
      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
        <BookOpenCheck className="w-3.5 h-3.5 text-zinc-300" />
        Libreta de Calificaciones
      </span>

      {Object.keys(gradesByTerm).length === 0 ? (
        <div className="text-center py-6 px-4 border border-dashed border-zinc-200/60 rounded-xl bg-zinc-50/30">
          <p className="text-xs font-normal text-zinc-400">Sin notas publicadas</p>
          <p className="text-[9px] text-zinc-400 mt-1">El docente no ha publicado notas para este período aún.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(gradesByTerm).map((termName) => {
            const subjectsInTerm = gradesByTerm[termName]
            return (
              <div key={termName} className="space-y-2">
                <h4 className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider pl-1">
                  {termName}
                </h4>

                <div className="space-y-2">
                  {Object.keys(subjectsInTerm).map((subName) => {
                    const data = subjectsInTerm[subName]
                    const avg = data.average

                    return (
                      <details
                        key={subName}
                        className="group bg-zinc-50/30 border border-zinc-200/50 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                      >
                        <summary className="flex justify-between items-center p-3.5 cursor-pointer list-none hover:bg-zinc-50/50 transition-colors select-none">
                          <span className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                            📚 {subName}
                          </span>
                          <div className="flex items-center gap-2">
                            {avg !== null ? (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                  avg >= 10
                                    ? 'bg-emerald-50/50 border-emerald-100/60 text-emerald-700'
                                    : 'bg-red-50/50 border-red-100/60 text-red-700'
                                }`}
                              >
                                Def: {avg.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-lg">
                                Pte.
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-400 group-open:rotate-180 transition-transform duration-150">
                              ▼
                            </span>
                          </div>
                        </summary>

                        <div className="px-3.5 pb-3.5 pt-0 border-t border-zinc-200/40 bg-white space-y-2.5">
                          <div className="flex justify-between items-center border-b border-zinc-50 pb-1 pt-2.5">
                            <div className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">
                              Detalle de Evaluaciones
                            </div>
                            <PrintPlanButton
                              termName={termName}
                              teacherName={data.grades[0]?.teacherName || 'Docente de la Asignatura'}
                              studentName={studentName}
                              subjectName={subName}
                              courseName={
                                course?.name
                                  ? `${course.name} (${course.grade_level}° - "${course.section}")`
                                  : 'Curso'
                              }
                              evaluations={data.grades}
                              allowPrintContainer={printSubjectId === subName}
                              onClick={() => {
                                setPrintSubjectId(subName)
                                setTimeout(() => {
                                  window.print()
                                }, 100)
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            {data.grades.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-zinc-700">{item.name}</span>
                                  <span className="text-[8px] text-zinc-400 font-normal">
                                    Ponderación: {item.weight}%
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {item.is_absent ? (
                                    <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-semibold bg-red-50 border border-red-100 text-red-600 rounded-md">
                                      AUSENTE
                                    </span>
                                  ) : item.score !== null ? (
                                    <span
                                      className={`font-semibold text-xs ${
                                        item.score >= 10 ? 'text-zinc-800' : 'text-red-500'
                                      }`}
                                    >
                                      {item.score.toFixed(1)}{' '}
                                      <span className="text-[9px] text-zinc-400 font-normal">/ 20</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-normal text-zinc-400 italic">
                                      Pendiente
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
