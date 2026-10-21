'use client'

import { ClipboardList, Percent, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react'

// Función para calcular los días de la semana actual (Lunes a Viernes)
export const getWeekDays = () => {
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

// Horario de clases por día (0: Lunes, 1: Martes, 2: Miércoles, 3: Jueves, 4: Viernes)
export const WEEKDAY_SCHEDULES: Record<number, Array<{ subject: string; time: string; icon: string }>> = {
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
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

// TODO: tipado pendiente
function getSubjectData(record: any) {
  if (!record) return null
  const sub = record.subjects || record.subject
  if (!sub) return null
  if (Array.isArray(sub)) {
    return sub[0]
  }
  return sub
}

interface AttendanceRecord {
  id: string
  attendance_date: string
  status: 'presente' | 'ausente' | 'tarde' | 'justificado'
  notes: string | null
  // TODO: tipado pendiente
  subjects?: any
}

interface WeeklyAttendanceCardProps {
  studentAttendance: AttendanceRecord[]
  attendancePercent: number
}

export function WeeklyAttendanceCard({
  studentAttendance,
  attendancePercent,
}: WeeklyAttendanceCardProps) {
  const weekDays = getWeekDays()

  return (
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

          let containerClass =
            'bg-zinc-50/50 border border-dashed border-zinc-200/60 shadow-xs text-zinc-300'
          let statusIcon = (
            <span className="text-zinc-300 text-[10px] font-bold">-</span>
          )

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

          const scheduledSubjects = WEEKDAY_SCHEDULES[i] || []

          const recordedSubjects = dayRecords.map((r) => {
            const sInfo = getSubjectData(r)
            const subjectName = sInfo?.name || 'Materia'
            const scheduleEntry = scheduledSubjects.find(
              (ss) => normalizeStr(ss.subject) === normalizeStr(subjectName)
            )
            return {
              name: subjectName,
              time:
                sInfo?.start_time && sInfo?.end_time
                  ? `${sInfo.start_time}–${sInfo.end_time}`
                  : scheduleEntry?.time || 'Horario N/A',
              icon: scheduleEntry?.icon || '📚',
              status: r.status as string | null,
            }
          })

          const unrecordedScheduled = scheduledSubjects
            .filter(
              (ss) =>
                !recordedSubjects.some(
                  (rs) => normalizeStr(rs.name) === normalizeStr(ss.subject)
                )
            )
            .map((ss) => ({
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
              <span className="text-[9px] font-semibold text-zinc-400 uppercase">
                {day.label}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${containerClass}`}
              >
                {statusIcon}
              </div>

              {/* Tooltip flotante */}
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
                        <span
                          className={`text-[9px] font-semibold ${statusInfo.color} flex-shrink-0 whitespace-nowrap self-center`}
                        >
                          {statusInfo.icon} {statusInfo.text}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-950 border-r border-b border-zinc-800 rotate-45 -mt-1" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
