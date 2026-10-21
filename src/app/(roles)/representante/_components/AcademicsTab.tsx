'use client'

import {
  GraduationCap,
  CalendarDays,
  Clock,
  FileDown,
  BookOpenCheck,
  Sparkles,
  Info,
} from 'lucide-react'
import { WeeklyAttendanceCard } from './WeeklyAttendanceCard'
import { GradesAccordion } from './GradesAccordion'
import { StudentBehaviorCard } from './StudentBehaviorCard'

// Datos simulados de horario semanal
const mockSchedule = [
  { day: 'Lun', subject: 'Matemáticas', time: '7:00–8:30', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { day: 'Mar', subject: 'Castellano', time: '7:00–8:30', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { day: 'Mié', subject: 'Ciencias Nat.', time: '7:00–8:30', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { day: 'Jue', subject: 'Inglés', time: '7:00–8:30', color: 'bg-violet-50 text-violet-700 border-violet-100' },
  { day: 'Vie', subject: 'Ed. Física', time: '7:00–8:30', color: 'bg-rose-50 text-rose-700 border-rose-100' },
]

interface Student {
  id: string
  full_name: string
  courses: any
  attendance?: any[]
  grades?: any[]
  behaviorRecords?: any[]
}

interface AcademicsTabProps {
  students: Student[]
}

export function AcademicsTab({ students }: AcademicsTabProps) {
  return (
    <div className="space-y-5">
      {students.map((student) => {
        // TODO: tipado pendiente
        const course = student.courses as any
        const studentAttendance = student.attendance || []

        const totalRecords = studentAttendance.length
        const presentsCount = studentAttendance.filter(
          (a) => a.status === 'presente' || a.status === 'tarde' || a.status === 'justificado'
        ).length
        const attendancePercent = totalRecords > 0 ? Math.round((presentsCount / totalRecords) * 100) : 100

        return (
          <div key={student.id} className="space-y-4">
            {/* Tarjeta de Información Académica */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
              {/* Cabecera del Estudiante */}
              <div className="p-5 bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100 relative overflow-hidden">
                <div className="flex items-center justify-between gap-3.5">
                  <div className="flex items-center gap-3.5 min-w-0">
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

                  <a
                    href={`/api/boletin/${student.id}`}
                    download
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-all flex-shrink-0 active:scale-[0.98] min-h-[44px] sm:min-h-[34px]"
                    title="Descargar boletín escolar oficial en PDF"
                  >
                    <FileDown className="w-4 h-4" />
                    <span className="hidden sm:inline">Descargar Mi Boletín</span>
                    <span className="sm:hidden">Boletín</span>
                  </a>
                </div>
              </div>

              {/* Asistencia Semanal */}
              <WeeklyAttendanceCard
                studentAttendance={studentAttendance}
                attendancePercent={attendancePercent}
              />

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
              <GradesAccordion
                studentName={student.full_name}
                course={course}
                grades={student.grades}
              />

              {/* Acciones de Boletín */}
              <div className="p-5 space-y-3">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <BookOpenCheck className="w-3.5 h-3.5 text-zinc-300" />
                  Descarga de Boletines Oficiales
                </span>

                <div className="relative group">
                  <a
                    href={`/api/boletin/${student.id}`}
                    download
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full shadow-sm hover:shadow active:scale-[0.98] transition-all duration-150 text-xs cursor-pointer text-center"
                  >
                    <FileDown className="w-4.5 h-4.5" />
                    <span>Descargar Mi Boletín (PDF)</span>
                  </a>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-950 text-white text-[10px] font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <Sparkles className="w-3 h-3 inline mr-1 text-amber-400" />
                    Boletín oficial listo para imprimir y firmar
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-950 rotate-45 -mt-1" />
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 font-normal text-center flex items-center justify-center gap-1">
                  <Info className="w-3 h-3" />
                  Período vigente: 3er Lapso 2025–2026
                </p>
              </div>
            </div>

            {/* Tarjeta de Conducta y Novedades */}
            <StudentBehaviorCard
              studentName={student.full_name}
              records={student.behaviorRecords || []}
            />
          </div>
        )
      })}
    </div>
  )
}
