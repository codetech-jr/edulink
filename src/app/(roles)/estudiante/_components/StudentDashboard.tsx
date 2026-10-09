'use client'

import { useState } from 'react'
import { logoutAction } from '@/actions/auth-actions'
import { PrintPlanButton } from '@/components/PrintPlanButton'
import {
  LogOut,
  GraduationCap,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Percent,
  BookOpenCheck,
  Megaphone,
  Bell,
  CalendarCheck,
  AlertTriangle,
  Info,
  Users,
  MapPin,
  ShieldCheck,
  BookOpen,
} from 'lucide-react'

interface StudentDashboardProps {
  student: any
  school: any
  subjects: any[]
  evaluations: any[]
  grades: any[]
  attendance: any[]
  terms: any[]
  communications?: any[]
}

type TabKey = 'academico' | 'comunicados'

// Días de la semana
const getWeekDays = () => {
  const today = new Date()
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

const WEEKDAY_SCHEDULES: Record<number, Array<{ subject: string; time: string; icon: string }>> = {
  0: [
    { subject: 'Matemáticas', time: '7:00–8:30', icon: '📚' },
    { subject: 'Castellano', time: '8:30–10:00', icon: '📖' },
  ],
  1: [
    { subject: 'Castellano', time: '7:00–8:30', icon: '📖' },
    { subject: 'Ciencias Nat.', time: '8:30–10:00', icon: '🧪' },
  ],
  2: [
    { subject: 'Ciencias Nat.', time: '7:00–8:30', icon: '🧪' },
    { subject: 'Inglés', time: '8:30–10:00', icon: '🇬🇧' },
  ],
  3: [
    { subject: 'Matemáticas', time: '7:00–8:30', icon: '📚' },
    { subject: 'Castellano', time: '8:30–10:00', icon: '📖' },
    { subject: 'Inglés', time: '7:00–8:30', icon: '🇬🇧' },
  ],
  4: [
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

export function StudentDashboard({
  student,
  school,
  subjects,
  evaluations,
  grades,
  attendance,
  terms,
  communications,
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('academico')
  const [printSubjectId, setPrintSubjectId] = useState<string | null>(null)
  
  const weekDays = getWeekDays()
  const course = student.courses

  // 1. Organizar calificaciones por Lapso y Materia
  const gradesByTerm: Record<string, Record<string, { grades: any[], average: number | null, teacherName: string }>> = {}

  terms.forEach((term) => {
    gradesByTerm[term.name] = {}
    subjects.forEach((sub) => {
      gradesByTerm[term.name][sub.name] = {
        grades: [],
        average: null,
        teacherName: sub.profiles?.full_name || 'Docente de la Asignatura',
      }
    })
  })

  evaluations.forEach((ev) => {
    const term = terms.find((t) => t.id === ev.term_id)
    const subject = subjects.find((s) => s.id === ev.subject_id)
    if (!term || !subject) return

    const termName = term.name
    const subjectName = subject.name

    const gradeRecord = grades.find((g) => g.evaluation_id === ev.id)
    const scoreVal = gradeRecord?.score !== undefined && gradeRecord?.score !== null ? Number(gradeRecord.score) : null

    // Solo mostramos notas y estado de inasistencia si la evaluación está publicada (is_published = true)
    const showGrade = ev.is_published

    gradesByTerm[termName][subjectName].grades.push({
      id: ev.id,
      name: ev.name,
      weight: Number(ev.weight),
      evaluation_date: ev.evaluation_date,
      score: showGrade ? scoreVal : null,
      is_absent: showGrade ? !!gradeRecord?.is_absent : false,
      notes: showGrade ? gradeRecord?.notes : null,
      is_published: ev.is_published,
    })
  })

  // Calcular Promedios
  let activeTermAverages: number[] = []
  
  Object.keys(gradesByTerm).forEach((termName) => {
    Object.keys(gradesByTerm[termName]).forEach((subjectName) => {
      const subObj = gradesByTerm[termName][subjectName]
      let weightedSum = 0
      let totalWeight = 0

      subObj.grades.forEach((item) => {
        // Si no está publicado, no entra en el cálculo de promedio para el estudiante
        if (!item.is_published) return
        
        // Si tiene nota o inasistencia acumulada
        if (item.is_absent) {
          weightedSum += 1.0 * (item.weight / 100)
          totalWeight += item.weight
        } else if (item.score !== null) {
          weightedSum += item.score * (item.weight / 100)
          totalWeight += item.weight
        }
      })

      const average = totalWeight > 0 ? weightedSum / (totalWeight / 100) : null
      subObj.average = average

      // Si es el período activo (supongamos el último término configurado, o cualquiera con notas)
      if (average !== null) {
        activeTermAverages.push(average)
      }
    })
  })

  // Calcular promedio general acumulado del estudiante
  const overallAverage = activeTermAverages.length > 0 
    ? activeTermAverages.reduce((sum, val) => sum + val, 0) / activeTermAverages.length 
    : null

  // Calcular porcentaje de asistencia
  const totalAttendance = attendance.length
  const presentsAttendance = attendance.filter((a) => a.status === 'presente' || a.status === 'tarde' || a.status === 'justificado').length
  const attendancePercent = totalAttendance > 0 ? Math.round((presentsAttendance / totalAttendance) * 100) : 100

  // Configuración de tipos para avisos
  function getTypeConfig(type: 'urgente' | 'informativo' | 'recordatorio') {
    switch (type) {
      case 'urgente':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          color: 'text-red-600',
          dotColor: 'bg-red-500',
          iconBg: 'bg-zinc-50 border border-zinc-200/60 text-zinc-500',
          label: 'Urgente',
          accentBar: 'bg-red-500',
        }
      case 'recordatorio':
        return {
          icon: <Bell className="w-4 h-4" />,
          color: 'text-amber-600',
          dotColor: 'bg-amber-500',
          iconBg: 'bg-zinc-50 border border-zinc-200/60 text-zinc-500',
          label: 'Recordatorio',
          accentBar: 'bg-amber-500',
        }
      default:
        return {
          icon: <Info className="w-4 h-4" />,
          color: 'text-indigo-600',
          dotColor: 'bg-indigo-500',
          iconBg: 'bg-zinc-50 border border-zinc-200/60 text-zinc-500',
          label: 'Informativo',
          accentBar: 'bg-zinc-400',
        }
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 pb-12 font-sans selection:bg-indigo-100">
      {/* Navbar Superior Fijo con Blur */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-md px-5 py-3.5 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs tracking-tight shadow-sm shadow-indigo-200">
            E
          </div>
          <span className="font-semibold text-zinc-900 tracking-tight text-sm">EduLink</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-zinc-500">
            {student.full_name.split(' ')[0]}
          </span>
          <div className="h-4 w-px bg-zinc-200" />
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-lg transition-all text-[11px] font-medium cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </header>

      {/* Contenedor Principal (Responsivo Premium) */}
      <div className="mx-auto w-full max-w-md lg:max-w-7xl lg:px-8 px-4 py-6 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Columna Lateral (Sidebar en desktop, top en móvil) */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
            {/* Tarjeta de Identificación del Estudiante (Estilo Moderno Sin Finanzas) */}
            <div className="bg-zinc-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
              <div className="absolute right-0 top-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0 shadow-inner">
                  {student.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 block">
                    Portal del Estudiante
                  </span>
                  <h1 className="text-lg font-semibold tracking-tight text-white truncate mt-0.5">
                    {student.full_name}
                  </h1>
                  <p className="text-xs text-zinc-400 font-normal truncate mt-0.5">
                    {course?.name ? `${course.name} (${course.grade_level}° - "${course.section}")` : 'Curso no asignado'}
                  </p>
                </div>
              </div>

              {/* Estadísticas Académicas Rápidas */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-zinc-800">
                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
                    Promedio General
                  </span>
                  <span className="text-2xl font-semibold text-white tracking-tight flex items-baseline gap-1">
                    {overallAverage !== null ? overallAverage.toFixed(2) : '-'}
                    <span className="text-xs text-zinc-500 font-medium">/ 20</span>
                  </span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
                    Asistencia Semanal
                  </span>
                  <span className="text-2xl font-semibold text-emerald-400 tracking-tight flex items-center gap-1.5">
                    {attendancePercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Navigation — Pill Style B2C SaaS */}
            <nav className="bg-zinc-100/80 rounded-full lg:rounded-2xl p-1 lg:p-1.5 border border-zinc-200/60 shadow-sm flex lg:flex-col gap-1" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'academico'}
                onClick={() => setActiveTab('academico')}
                className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2.5 py-2 lg:py-2.5 px-3 lg:px-4 rounded-full lg:rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === 'academico'
                    ? 'bg-white text-zinc-800 shadow-sm border border-zinc-200/50'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50/50'
                }`}
              >
                <BookOpen className={`w-4 h-4 ${activeTab === 'academico' ? 'text-indigo-600' : 'text-zinc-400'}`} />
                <span>Académico</span>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'comunicados'}
                onClick={() => setActiveTab('comunicados')}
                className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2.5 py-2 lg:py-2.5 px-3 lg:px-4 rounded-full lg:rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === 'comunicados'
                    ? 'bg-white text-zinc-800 shadow-sm border border-zinc-200/50'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50/50'
                }`}
              >
                <Megaphone className={`w-4 h-4 ${activeTab === 'comunicados' ? 'text-indigo-600' : 'text-zinc-400'}`} />
                <span>Comunicados</span>
              </button>
            </nav>
          </div>

          {/* Columna Principal (Contenido) */}
          <div className="lg:col-span-8 animate-in fade-in duration-200 print:w-full">
            {activeTab === 'academico' ? (
              <div className="space-y-6">
                
                {/* Asistencia Semanal (Semáforo) */}
                <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ClipboardList className="w-3.5 h-3.5 text-zinc-300" />
                      Asistencia de la Semana
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-normal bg-zinc-50 text-zinc-500 border border-zinc-200 rounded-full">
                      <Percent className="w-3 h-3 text-zinc-400" />
                      {attendancePercent}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 justify-between">
                    {weekDays.map((day, i) => {
                      const dayRecords = attendance.filter((a) => a.attendance_date === day.dateString)

                      let containerClass = 'bg-zinc-50/50 border border-dashed border-zinc-200/60 shadow-xs text-zinc-300'
                      let statusIcon = <span className="text-zinc-300 text-[10px] font-semibold">-</span>

                      if (dayRecords.length > 0) {
                        const hasAbsent = dayRecords.some((r) => r.status === 'ausente')
                        const hasLate = dayRecords.some((r) => r.status === 'tarde')
                        const hasJustified = dayRecords.some((r) => r.status === 'justificado')

                        if (hasAbsent) {
                          containerClass = 'bg-red-50 border border-red-200 text-red-500'
                          statusIcon = <XCircle className="w-4 h-4 text-red-500" />
                        } else if (hasLate) {
                          containerClass = 'bg-amber-50 border border-amber-200 text-amber-500'
                          statusIcon = <Clock className="w-4 h-4 text-amber-500" />
                        } else if (hasJustified) {
                          containerClass = 'bg-blue-50 border border-blue-200 text-blue-500'
                          statusIcon = <ShieldCheck className="w-4 h-4 text-blue-500" />
                        } else {
                          containerClass = 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                          statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        }
                      }

                      // Horario programado
                      const scheduledSubjects = WEEKDAY_SCHEDULES[i] || []

                      const recordedSubjects = dayRecords.map((r) => {
                        const subName = subjects.find((s) => s.id === r.subject_id)?.name || 'Materia'
                        const scheduleEntry = scheduledSubjects.find((ss) => normalizeStr(ss.subject) === normalizeStr(subName))
                        return {
                          name: subName,
                          time: scheduleEntry?.time || 'Horario N/A',
                          icon: scheduleEntry?.icon || '📚',
                          status: r.status,
                        }
                      })

                      const unrecordedScheduled = scheduledSubjects
                        .filter((ss) => !recordedSubjects.some((rs) => normalizeStr(rs.name) === normalizeStr(ss.subject)))
                        .map((ss) => ({
                          name: ss.subject,
                          time: ss.time,
                          icon: ss.icon,
                          status: null,
                        }))

                      const allSubjectsToShow = [...recordedSubjects, ...unrecordedScheduled]

                      const getStatusLabelAndColor = (status: string | null) => {
                        switch (status) {
                          case 'presente':
                            return { text: 'Presente', icon: '🟢', color: 'text-emerald-400 font-semibold' }
                          case 'ausente':
                            return { text: 'Ausente', icon: '🔴', color: 'text-red-400 font-semibold' }
                          case 'tarde':
                            return { text: 'Tarde', icon: '🟡', color: 'text-amber-400 font-semibold' }
                          case 'justificado':
                            return { text: 'Justificado', icon: '🔵', color: 'text-blue-400 font-semibold' }
                          default:
                            return { text: 'Sin registro', icon: '⚪', color: 'text-zinc-500 font-medium' }
                        }
                      }

                      return (
                        <div key={i} className="flex flex-col items-center gap-1.5 relative group">
                          <span className="text-[9px] font-semibold text-zinc-400 uppercase">{day.label}</span>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${containerClass}`}>
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
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-950 border-r border-b border-zinc-800 rotate-45 -mt-1" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Horario de Clases */}
                <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-5">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                    <CalendarDays className="w-3.5 h-3.5 text-zinc-300" />
                    Horario de Clases
                  </span>

                  <div className="space-y-3">
                    {Object.keys(WEEKDAY_SCHEDULES).map((key) => {
                      const dayNum = Number(key)
                      const dayLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
                      const daySchedule = WEEKDAY_SCHEDULES[dayNum]

                      return (
                        <div key={dayNum} className="p-3.5 bg-zinc-50/30 border border-zinc-200/50 rounded-xl text-xs space-y-2">
                          <p className="font-semibold uppercase text-[9px] text-zinc-400 tracking-wider">{dayLabels[dayNum]}</p>
                          <div className="space-y-2">
                            {daySchedule.map((s, sIdx) => (
                              <div key={sIdx} className="flex justify-between items-center text-zinc-800">
                                <span className="font-medium flex items-center gap-1.5">
                                  <span className="text-sm">{s.icon}</span> {s.subject}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-normal flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-zinc-300" /> {s.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Libreta de Calificaciones y Evaluaciones */}
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

                        // Filtrar asignaturas que tienen evaluaciones registradas en este término
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
                                          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
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
                                      
                                      <div className="flex justify-between items-center border-b border-zinc-100/60 pb-1 pt-2.5">
                                        <div className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">
                                          Detalle de Evaluaciones
                                        </div>
                                        {/* Botón de impresión oficial unificada */}
                                        <PrintPlanButton
                                          termName={termName}
                                          teacherName={data.teacherName}
                                          studentName={student.full_name}
                                          subjectName={subName}
                                          courseName={course ? `${course.name} (${course.grade_level}° - "${course.section}")` : 'Curso'}
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
                                          <div key={item.id || idx} className="flex justify-between items-center text-xs">
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
                                                <span className={`font-semibold text-xs ${item.score >= 10 ? 'text-zinc-800' : 'text-red-500'}`}>
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
                  )}
                </div>
              </div>
            ) : (
              /* Comunicados Oficiales */
              <div className="space-y-4">
                <div className="flex items-center justify-between pl-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-zinc-300" />
                    Comunicados de {school.name}
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] font-medium rounded-full">
                    {(communications ?? []).length} aviso{((communications ?? []).length) !== 1 ? 's' : ''}
                  </span>
                </div>

                {(communications ?? []).length === 0 ? (
                  <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-8 text-center">
                    <Megaphone className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                    <p className="text-xs font-normal text-zinc-400">No hay comunicados oficiales en este momento.</p>
                  </div>
                ) : (
                  (communications ?? []).map((comm) => {
                    const config = getTypeConfig(comm.category)
                    const dateObj = new Date(comm.created_at)
                    const dateFormatted = dateObj.toLocaleDateString('es-VE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                    const timeFormatted = dateObj.toLocaleTimeString('es-VE', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })

                    return (
                      <div key={comm.id} className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden relative">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${config.accentBar}`} />

                        <div className="pl-5 pr-5 py-5 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
                              {config.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xs font-semibold text-zinc-800 leading-tight">
                                  {comm.title}
                                </h3>
                                <span className="inline-flex items-center gap-1 text-[9px] font-normal text-zinc-500">
                                  <span className={`w-1 h-1 rounded-full ${config.dotColor}`} />
                                  {config.label}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed whitespace-pre-wrap">
                                {comm.body}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2 border-t border-zinc-100 text-[10px] font-normal text-zinc-400">
                            <span className="flex items-center gap-1">
                              <CalendarCheck className="w-3 h-3 text-zinc-300" />
                              {dateFormatted}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-300" />
                              {timeFormatted}
                            </span>
                            <span className="flex items-center gap-1 ml-auto">
                              <Users className="w-3 h-3 text-zinc-300" />
                              Dirección General
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div> {/* Closes lg:col-span-8 */}
        </div> {/* Closes grid */}
      </div> {/* Closes main container */}

      {/* Contenedores de Impresión (Solo renderizados en el DOM si es el tema activo) */}
      {subjects.map((sub) => {
        const termName = terms[0]?.name || 'Lapso Escolar'
        const termId = terms[0]?.id || ''
        const subEvs = evaluations.filter((ev) => ev.subject_id === sub.id && ev.term_id === termId)
        
        return (
          <PrintPlanButton
            key={sub.id}
            termName={termName}
            teacherName={sub.profiles?.full_name || 'Docente de la Asignatura'}
            studentName={student.full_name}
            subjectName={sub.name}
            courseName={course ? `${course.name} (${course.grade_level}° - "${course.section}")` : 'Curso'}
            evaluations={subEvs}
            allowPrintContainer={printSubjectId === sub.name}
          />
        )
      })}
    </main>
  )
}
