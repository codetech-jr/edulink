'use client'

import {
  ClipboardList,
  Percent,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { getWeekDays, WEEKDAY_SCHEDULES, normalizeStr } from './schedule-utils'

interface StudentAttendanceWeekProps {
  // TODO: tipado pendiente
  attendance: any[]
  // TODO: tipado pendiente
  subjects: any[]
  attendancePercent: number
}

export function StudentAttendanceWeek({
  attendance,
  subjects,
  attendancePercent,
}: StudentAttendanceWeekProps) {
  const weekDays = getWeekDays()

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

          let containerClass =
            'bg-zinc-50/50 border border-dashed border-zinc-200/60 shadow-xs text-zinc-300'
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

          const scheduledSubjects = WEEKDAY_SCHEDULES[i] || []

          const recordedSubjects = dayRecords.map((r) => {
            const subName = subjects.find((s) => s.id === r.subject_id)?.name || 'Materia'
            const scheduleEntry = scheduledSubjects.find(
              (ss) => normalizeStr(ss.subject) === normalizeStr(subName)
            )
            return {
              name: subName,
              time: scheduleEntry?.time || 'Horario N/A',
              icon: scheduleEntry?.icon || '📚',
              status: r.status,
            }
          })

          const unrecordedScheduled = scheduledSubjects
            .filter(
              (ss) =>
                !recordedSubjects.some((rs) => normalizeStr(rs.name) === normalizeStr(ss.subject))
            )
            .map((ss) => ({
              name: ss.subject,
              time: ss.time,
              icon: ss.icon,
              status: null,
            }))

          const allSubjectsToShow = [...recordedSubjects, ...unrecordedScheduled]

          return (
            <div key={i} className="flex flex-col items-center gap-1.5 relative group">
              <span className="text-[9px] font-semibold text-zinc-400 uppercase">{day.label}</span>
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
