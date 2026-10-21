'use client'

interface StudentProfileCardProps {
  fullName: string
  // TODO: tipado pendiente
  course: any
  overallAverage: number | null
  attendancePercent: number
}

export function StudentProfileCard({
  fullName,
  course,
  overallAverage,
  attendancePercent,
}: StudentProfileCardProps) {
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="bg-zinc-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
      <div className="absolute right-0 top-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0 shadow-inner">
          {initials}
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 block">
            Portal del Estudiante
          </span>
          <h1 className="text-lg font-semibold tracking-tight text-white truncate mt-0.5">
            {fullName}
          </h1>
          <p className="text-xs text-zinc-400 font-normal truncate mt-0.5">
            {course?.name
              ? `${course.name} (${course.grade_level}° - "${course.section}")`
              : 'Curso no asignado'}
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
  )
}
