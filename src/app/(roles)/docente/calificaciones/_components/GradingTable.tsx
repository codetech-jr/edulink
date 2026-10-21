'use client'

import React from 'react'

export interface Student {
  id: string
  full_name: string
  list_number: number | null
}

export interface Evaluation {
  id: string
  name: string
  weight: number
  is_published: boolean
  evaluation_date?: string | null
}

export type LocalGradesState = {
  [studentId: string]: {
    [evaluationId: string]: {
      score: string
      is_absent: boolean
      notes: string
    }
  }
}

interface GradingTableProps {
  students: Student[]
  evaluations: Evaluation[]
  grades: LocalGradesState
  isSaving: boolean
  onScoreChange: (studentId: string, evaluationId: string, value: string) => void
  onAbsentToggle: (studentId: string, evaluationId: string) => void
  calculateAverage: (studentId: string) => number | null
}

export function GradingTable({
  students,
  evaluations,
  grades,
  isSaving,
  onScoreChange,
  onAbsentToggle,
  calculateAverage,
}: GradingTableProps) {
  return (
    <div className="overflow-x-auto -mx-5 sm:mx-0">
      <div className="inline-block min-w-full align-middle px-5 sm:px-0">
        <div className="overflow-hidden border border-slate-100 rounded-2xl">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-[#FAFBFD]">
              <tr>
                <th scope="col" className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase w-12 text-center">
                  Nº
                </th>
                <th scope="col" className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase">
                  Estudiante
                </th>
                {evaluations.map((ev) => (
                  <th key={ev.id} scope="col" className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase text-center w-28">
                    <div className="flex flex-col items-center">
                      <span className="truncate max-w-[100px]" title={ev.name}>{ev.name}</span>
                      <span className="text-[9px] text-indigo-500 font-extrabold">({ev.weight}%)</span>
                    </div>
                  </th>
                ))}
                <th scope="col" className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase text-center w-24">
                  Def.
                </th>
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
                      const scoreNum = record?.score !== '' ? parseFloat(record?.score) : null
                      const isOutOfRange = scoreNum !== null && (scoreNum < 1 || scoreNum > 20)

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
                                onChange={(e) => onScoreChange(student.id, ev.id, e.target.value)}
                                aria-label={`Nota de ${student.full_name} en ${ev.name}`}
                                className={`w-14 px-2 py-1.5 bg-[#F8FAFC] border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl text-xs font-bold text-slate-900 outline-none text-center transition-all disabled:bg-slate-100 disabled:text-slate-400 ${
                                  isOutOfRange ? 'border-rose-400 ring-rose-400/20 text-rose-500' : ''
                                }`}
                              />
                            </div>

                            {/* Botón de Inasistencia (Absent) */}
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => onAbsentToggle(student.id, ev.id)}
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
                        <span
                          className={`text-xs font-black px-2.5 py-1.5 rounded-xl border ${
                            avg >= 10
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                              : 'bg-rose-50 border-rose-100 text-rose-700'
                          }`}
                        >
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
  )
}
