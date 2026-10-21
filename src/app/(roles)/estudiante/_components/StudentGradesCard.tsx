'use client'

import { BookOpenCheck } from 'lucide-react'
import { PrintPlanButton } from '@/components/PrintPlanButton'

interface StudentGradesCardProps {
  // TODO: tipado pendiente
  gradesByTerm: Record<string, Record<string, { grades: any[]; average: number | null; teacherName: string }>>
  studentName: string
  // TODO: tipado pendiente
  course: any
  printSubjectId: string | null
  setPrintSubjectId: (id: string | null) => void
}

export function StudentGradesCard({
  gradesByTerm,
  studentName,
  course,
  printSubjectId,
  setPrintSubjectId,
}: StudentGradesCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-5 space-y-4">
      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
        <BookOpenCheck className="w-3.5 h-3.5 text-zinc-300" />
        Libreta de Calificaciones
      </span>

      {Object.keys(gradesByTerm).length === 0 ? (
        <div className="text-center py-6 px-4 border border-dashed border-zinc-200/60 rounded-xl bg-zinc-50/30">
          <p className="text-xs font-normal text-zinc-400">Sin notas registradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(gradesByTerm).map((termName) => {
            const subjectsInTerm = gradesByTerm[termName]

            const activeSubjects = Object.keys(subjectsInTerm).filter(
              (subName) => subjectsInTerm[subName].grades.length > 0
            )

            if (activeSubjects.length === 0) return null

            return (
              <div key={termName} className="space-y-2">
                <h4 className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider pl-1">
                  {termName}
                </h4>

                <div className="space-y-2">
                  {activeSubjects.map((subName) => {
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
                                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
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
                          <div className="flex justify-between items-center border-b border-zinc-100/60 pb-1 pt-2.5">
                            <div className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">
                              Detalle de Evaluaciones
                            </div>
                            <PrintPlanButton
                              termName={termName}
                              teacherName={data.teacherName}
                              studentName={studentName}
                              subjectName={subName}
                              courseName={
                                course
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
                            {data.grades.map((item: any /* TODO: tipado pendiente */, idx: number) => (
                              <div
                                key={item.id || idx}
                                className="flex justify-between items-center text-xs"
                              >
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
                                      <span className="text-[9px] text-zinc-400 font-normal">
                                        / 20
                                      </span>
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
