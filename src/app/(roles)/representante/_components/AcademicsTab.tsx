'use client'

import { useState } from 'react'
import { PrintPlanButton } from '@/components/PrintPlanButton'
import {
  GraduationCap,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  FileDown,
  ClipboardList,
  Percent,
  BookOpenCheck,
  ShieldAlert,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react'

// Datos simulados de horario semanal
const mockSchedule = [
  { day: 'Lun', subject: 'Matemáticas', time: '7:00–8:30', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { day: 'Mar', subject: 'Castellano', time: '7:00–8:30', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { day: 'Mié', subject: 'Ciencias Nat.', time: '7:00–8:30', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { day: 'Jue', subject: 'Inglés', time: '7:00–8:30', color: 'bg-violet-50 text-violet-700 border-violet-100' },
  { day: 'Vie', subject: 'Ed. Física', time: '7:00–8:30', color: 'bg-rose-50 text-rose-700 border-rose-100' },
]

// Función para calcular los días de la semana actual (Lunes a Viernes) basados en la fecha actual
const getWeekDays = () => {
  const today = new Date() // Contexto: Semana del 11 de Junio de 2026
  const dayOfWeek = today.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + diffToMonday)

  const labels = ['L', 'M', 'M', 'J', 'V']
  const fullLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']

  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return {
      label: labels[i],
      fullLabel: fullLabels[i],
      dateString: `${yyyy}-${mm}-${dd}`,
    }
  })
}

// Horario de clases por día (0: Lunes, 1: Martes, 2: Miércoles, 3: Jueves, 4: Viernes)
const WEEKDAY_SCHEDULES: Record<number, Array<{ subject: string; time: string; icon: string }>> = {
  0: [ // Lunes
    { subject: 'Matemáticas', time: '7:00–8:30', icon: '📚' },
    { subject: 'Castellano', time: '8:30–10:00', icon: '📖' },
  ],
  1: [ // Martes
    { subject: 'Castellano', time: '7:00–8:30', icon: '📖' },
    { subject: 'Ciencias Nat.', time: '8:30–10:00', icon: '🧪' },
  ],
  2: [ // Miércoles
    { subject: 'Ciencias Nat.', time: '7:00–8:30', icon: '🧪' },
    { subject: 'Inglés', time: '8:30–10:00', icon: '🇬🇧' },
  ],
  3: [ // Jueves
    { subject: 'Matemáticas', time: '7:00–8:30', icon: '📚' },
    { subject: 'Castellano', time: '8:30–10:00', icon: '📖' },
    { subject: 'Inglés', time: '7:00–8:30', icon: '🇬🇧' },
  ],
  4: [ // Viernes
    { subject: 'Ed. Física', time: '7:00–8:30', icon: '⚽' },
    { subject: 'Inglés', time: '8:30–10:00', icon: '🇬🇧' },
  ],
}

const normalizeStr = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

function getSubjectData(record: any) {
  if (!record) return null
  const sub = record.subjects || record.subject
  if (!sub) return null
  if (Array.isArray(sub)) {
    return sub[0]
  }
  return sub
}

interface Student {
  id: string
  full_name: string
  courses: any
  attendance?: Array<{
    id: string
    attendance_date: string
    status: 'presente' | 'ausente' | 'tarde' | 'justificado'
    notes: string | null
    subject_id?: string
    subjects?: {
      id: string
      name: string
      start_time: string | null
      end_time: string | null
    } | {
      id: string
      name: string
      start_time: string | null
      end_time: string | null
    }[] | null
  }>
  grades?: Array<{
    id: string
    student_id: string
    score: number | null
    is_absent: boolean
    notes: string | null
    evaluation_id: string
    evaluations?: {
      id: string
      name: string
      weight: number
      term_id: string
      terms?: {
        id: string
        name: string
      } | null
      subjects?: {
        id: string
        name: string
      } | null
    } | null
  }>
}

interface AcademicsTabProps {
  students: Student[]
}

export function AcademicsTab({ students }: AcademicsTabProps) {
  const [printSubjectId, setPrintSubjectId] = useState<string | null>(null)
  const weekDays = getWeekDays()

  return (
    <div className="space-y-5">
      {students.map((student) => {
        const course = student.courses as any
        const studentAttendance = student.attendance || []

        // Calcular porcentaje dinámico de asistencia (presents / total records)
        const totalRecords = studentAttendance.length
        const presentsCount = studentAttendance.filter(
          (a) => a.status === 'presente' || a.status === 'tarde' || a.status === 'justificado'
        ).length
        const attendancePercent = totalRecords > 0 ? Math.round((presentsCount / totalRecords) * 100) : 100

        return (
          <div key={student.id} className="space-y-4">

            {/* Tarjeta de Información Académica */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
              {(() => {
                // Agrupar calificaciones por Lapso y Asignatura
                const studentGrades = student.grades || []
                const gradesByTerm: Record<string, Record<string, { grades: any[], average: number | null }>> = {}

                studentGrades.forEach((g) => {
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

                return null // Solo cálculo previo
              })()}

              {/* Cabecera del Estudiante - Soft depth gradient */}
              <div className="p-5 bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100 relative overflow-hidden">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-xl flex items-center justify-center font-semibold text-xs flex-shrink-0 shadow-inner">
                    {student.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-zinc-800 truncate">{student.full_name}</h3>
                    <div className="flex items-center gap-1 text-[11px] font-normal text-zinc-400 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />
                      <span className="truncate text-zinc-500">
                        {course?.name
                          ? `${course.name} (${course.grade_level} - ${course.section})`
                          : 'Curso no asignado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Asistencia Semanal (Semáforo) */}
              <div className="p-5 border-b border-zinc-100">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-zinc-300" />
                    Asistencia Semanal
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-normal bg-zinc-50 text-zinc-500 border border-zinc-200 rounded-full">
                    <Percent className="w-3 h-3 text-zinc-400" />
                    {attendancePercent}%
                  </span>
                </div>

                <div className="flex items-center gap-2 justify-between">
                  {weekDays.map((day, i) => {
                    const dayRecords = studentAttendance.filter(
                      (a) => a.attendance_date === day.dateString
                    )

                    let containerClass = 'bg-zinc-50/50 border border-dashed border-zinc-200/60 shadow-xs text-zinc-300'
                    let statusIcon = <span className="text-zinc-300 text-[10px] font-bold">-</span>
                    let consolidatedStatus = 'Sin registro'

                    if (dayRecords.length > 0) {
                      const hasAbsent = dayRecords.some((r) => r.status === 'ausente')
                      const hasLate = dayRecords.some((r) => r.status === 'tarde')
                      const hasJustified = dayRecords.some((r) => r.status === 'justificado')

                      if (hasAbsent) {
                        containerClass = 'bg-red-50 border border-red-200 text-red-500'
                        statusIcon = <XCircle className="w-4 h-4 text-red-500" />
                        consolidatedStatus = 'Ausente'
                      } else if (hasLate) {
                        containerClass = 'bg-amber-50 border border-amber-200 text-amber-500'
                        statusIcon = <Clock className="w-4 h-4 text-amber-500" />
                        consolidatedStatus = 'Tarde'
                      } else if (hasJustified) {
                        containerClass = 'bg-blue-50 border border-blue-200 text-blue-500'
                        statusIcon = <ShieldCheck className="w-4 h-4 text-blue-500" />
                        consolidatedStatus = 'Justificado'
                      } else {
                        containerClass = 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                        statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        consolidatedStatus = 'Presente'
                      }
                    }

                    // Obtener las materias programadas para este día de la semana
                    const scheduledSubjects = WEEKDAY_SCHEDULES[i] || []

                    const recordedSubjects = dayRecords.map(r => {
                      const sInfo = getSubjectData(r)
                      const subjectName = sInfo?.name || 'Materia'
                      const scheduleEntry = scheduledSubjects.find(
                        ss => normalizeStr(ss.subject) === normalizeStr(subjectName)
                      )
                      return {
                        name: subjectName,
                        time: sInfo?.start_time && sInfo?.end_time
                          ? `${sInfo.start_time}–${sInfo.end_time}`
                          : scheduleEntry?.time || 'Horario N/A',
                        icon: scheduleEntry?.icon || '📚',
                        status: r.status as string | null,
                      }
                    })

                    const unrecordedScheduled = scheduledSubjects
                      .filter(ss => !recordedSubjects.some(
                        rs => normalizeStr(rs.name) === normalizeStr(ss.subject)
                      ))
                      .map(ss => ({
                        name: ss.subject,
                        time: ss.time,
                        icon: ss.icon,
                        status: null as string | null,
                      }))

                    const allSubjectsToShow = [...recordedSubjects, ...unrecordedScheduled]

                    const getStatusLabelAndColor = (status: string | null) => {
                      switch (status) {
                        case 'presente':
                          return { text: 'Presente', icon: '✅', color: 'text-emerald-400 font-semibold' }
                        case 'ausente':
                          return { text: 'Ausente', icon: '❌', color: 'text-rose-400 font-semibold' }
                        case 'tarde':
                          return { text: 'Tarde', icon: '⏳', color: 'text-amber-400 font-semibold' }
                        case 'justificado':
                          return { text: 'Justificado', icon: '🛡️', color: 'text-blue-400 font-semibold' }
                        default:
                          return { text: 'Sin registro', icon: '⚪', color: 'text-zinc-500 font-normal' }
                      }
                    }

                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5 relative group">
                        <span className="text-[9px] font-semibold text-zinc-400 uppercase">{day.label}</span>
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${containerClass}`}
                        >
                          {statusIcon}
                        </div>

                        {/* Tooltip flotante premium (Tailwind) */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-zinc-950 text-white rounded-xl shadow-xl p-3 border border-zinc-800 text-[11px] z-50 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 origin-bottom flex flex-col gap-2">
                          <div className="font-semibold text-[9px] text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1 flex justify-between items-center">
                            <span>Desglose de Clases</span>
                            <span className="font-medium text-zinc-500 normal-case">{day.fullLabel}</span>
                          </div>
                          
                          <div className="space-y-2 text-[10px]">
                            {allSubjectsToShow.map((sub, idx) => {
                              const statusInfo = getStatusLabelAndColor(sub.status)
                              return (
                                <div key={idx} className="flex justify-between items-start gap-1.5">
                                  <div className="min-w-0 flex flex-col">
                                    <span className="font-medium text-zinc-200 truncate">
                                      {sub.icon} {sub.name}
                                    </span>
                                    <span className="text-[8px] text-zinc-500 font-normal flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5 flex-shrink-0 opacity-70" />
                                      {sub.time}
                                    </span>
                                  </div>
                                  <span className={`text-[9px] font-semibold ${statusInfo.color} flex-shrink-0 whitespace-nowrap self-center`}>
                                    {statusInfo.icon} {statusInfo.text}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                          {/* Tooltip Arrow */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-955 border-r border-b border-zinc-800 rotate-45 -mt-1" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Horario Básico */}
              <div className="p-5 border-b border-zinc-100">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-3.5">
                  <CalendarDays className="w-3.5 h-3.5 text-zinc-300" />
                  Horario de Clases
                </span>

                <div className="space-y-2">
                  {mockSchedule.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${item.color}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 text-[10px] font-semibold uppercase">{item.day}</span>
                        <span className="font-semibold">{item.subject}</span>
                      </div>
                      <span className="text-[10px] font-normal opacity-70 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calificaciones y Boletín */}
              <div className="p-5 border-b border-zinc-100 space-y-4">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <BookOpenCheck className="w-3.5 h-3.5 text-zinc-300" />
                  Libreta de Calificaciones
                </span>

                {(() => {
                  // Volver a calcular para el JSX
                  const studentGrades = student.grades || []
                  const gradesByTerm: Record<string, Record<string, { grades: any[], average: number | null }>> = {}

                  studentGrades.forEach((g) => {
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

                  if (Object.keys(gradesByTerm).length === 0) {
                    return (
                      <div className="text-center py-6 px-4 border border-dashed border-zinc-200/60 rounded-xl bg-zinc-50/30">
                        <p className="text-xs font-normal text-zinc-400">Sin notas publicadas</p>
                        <p className="text-[9px] text-zinc-400 mt-1">El docente no ha publicado notas para este período aún.</p>
                      </div>
                    )
                  }

                  return (
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
                                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                            avg >= 10
                                              ? 'bg-emerald-50/50 border-emerald-100/60 text-emerald-700'
                                              : 'bg-red-50/50 border-red-100/60 text-red-700'
                                          }`}>
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
                                          studentName={student.full_name}
                                          subjectName={subName}
                                          courseName={course?.name ? `${course.name} (${course.grade_level}° - "${course.section}")` : 'Curso'}
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
                                        {data.grades.map((item: any, idx: number) => (
                                          <div key={idx} className="flex justify-between items-center text-xs">
                                            <div className="flex flex-col">
                                              <span className="font-semibold text-zinc-700">{item.name}</span>
                                              <span className="text-[8px] text-zinc-400 font-normal">Ponderación: {item.weight}%</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5">
                                              {item.is_absent ? (
                                                <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-semibold bg-red-50 border border-red-100 text-red-600 rounded-md">
                                                  AUSENTE
                                                </span>
                                              ) : item.score !== null ? (
                                                <span className={`font-semibold text-xs ${
                                                  item.score >= 10 ? 'text-zinc-800' : 'text-red-500'
                                                }`}>
                                                  {item.score.toFixed(1)} <span className="text-[9px] text-zinc-400 font-normal">/ 20</span>
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
                  )
                })()}
              </div>

              {/* Acciones de Boletín */}
              <div className="p-5 space-y-3">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <BookOpenCheck className="w-3.5 h-3.5 text-zinc-300" />
                  Descarga de Boletines Oficiales
                </span>

                <div className="relative group">
                  <button
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full shadow-sm hover:shadow active:scale-[0.98] transition-all duration-150 text-xs cursor-pointer"
                  >
                    <FileDown className="w-4.5 h-4.5" />
                    <span>Descargar Boletín (PDF)</span>
                  </button>
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-950 text-white text-[10px] font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <Sparkles className="w-3 h-3 inline mr-1 text-amber-400" />
                    Listo para firma física
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-950 rotate-45 -mt-1" />
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 font-normal text-center flex items-center justify-center gap-1">
                  <Info className="w-3 h-3" />
                  Período vigente: 3er Lapso 2025–2026
                </p>
              </div>
            </div>

            {/* Tarjeta "Conducta y Novedades" — Próximamente */}
            <div className="bg-white rounded-2xl border border-dashed border-zinc-200/80 shadow-sm overflow-hidden relative">
              <div className="p-5 flex items-center gap-3.5">
                <div className="w-10 h-10 bg-zinc-50 border border-zinc-200/60 rounded-xl flex items-center justify-center text-zinc-400 flex-shrink-0">
                  <ShieldAlert className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-zinc-800 flex items-center gap-2">
                    Conducta y Novedades
                    <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full">
                      Próxima Versión
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Registro disciplinario, observaciones del docente y seguimiento conductual.
                  </p>
                </div>
              </div>
              {/* Overlay de "En Desarrollo" */}
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center pointer-events-none">
                <span className="px-4 py-2 bg-zinc-950 text-white text-[10px] font-semibold rounded-full tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  En Desarrollo
                </span>
              </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}
