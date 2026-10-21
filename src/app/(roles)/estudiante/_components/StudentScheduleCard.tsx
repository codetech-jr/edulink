'use client'

import { CalendarDays, Clock } from 'lucide-react'
import { WEEKDAY_SCHEDULES } from './schedule-utils'

export function StudentScheduleCard() {
  const dayLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-5">
      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
        <CalendarDays className="w-3.5 h-3.5 text-zinc-300" />
        Horario de Clases
      </span>

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
