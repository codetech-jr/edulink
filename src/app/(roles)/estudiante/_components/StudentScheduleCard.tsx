'use client'

import { CalendarDays, Clock, Printer } from 'lucide-react'
import { WEEKDAY_SCHEDULES } from './schedule-utils'

interface StudentScheduleCardProps {
  onPrintSchedule?: () => void
}

export function StudentScheduleCard({ onPrintSchedule }: StudentScheduleCardProps) {
  const dayLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-zinc-300" />
          Horario de Clases
        </span>

        {onPrintSchedule && (
          <button
            type="button"
            onClick={onPrintSchedule}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-zinc-700 rounded-xl text-[11px] font-semibold transition-all active:scale-[0.98] cursor-pointer"
            title="Imprimir solo el Horario de Clases"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
            <span>Imprimir Horario</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {Object.keys(WEEKDAY_SCHEDULES).map((key) => {
          const dayNum = Number(key)
          const daySchedule = WEEKDAY_SCHEDULES[dayNum]

          return (
            <div
              key={dayNum}
              className="p-3.5 bg-zinc-50/30 border border-zinc-200/50 rounded-xl text-xs space-y-2"
            >
              <p className="font-semibold uppercase text-[9px] text-zinc-400 tracking-wider">
                {dayLabels[dayNum]}
              </p>
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
  )
}
