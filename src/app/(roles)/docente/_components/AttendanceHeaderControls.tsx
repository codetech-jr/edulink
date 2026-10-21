'use client'

import React from 'react'
import { BookOpen, Calendar } from 'lucide-react'

interface Student {
  id: string
  full_name: string
  cedula: string | null
  list_number: number | null
  is_active: boolean
}

interface Course {
  id: string
  name: string
  grade_level: number
  section: string
  students: Student[]
}

interface Subject {
  id: string
  name: string
  courses: Course | null
}

interface AttendanceHeaderControlsProps {
  subjects: Subject[]
  selectedSubjectId: string
  setSelectedSubjectId: (id: string) => void
  selectedDate: string
  setSelectedDate: (date: string) => void
  totalStudents: number
  presentCount: number
  absentCount: number
  tardyCount: number
  justifiedCount: number
}

export function AttendanceHeaderControls({
  subjects,
  selectedSubjectId,
  setSelectedSubjectId,
  selectedDate,
  setSelectedDate,
  totalStudents,
  presentCount,
  absentCount,
  tardyCount,
  justifiedCount,
}: AttendanceHeaderControlsProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selector de Asignatura */}
        <div className="space-y-1.5">
          <label
            htmlFor="subject-select"
            className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Asignatura / Curso
          </label>
          <div className="relative">
            <select
              id="subject-select"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent appearance-none cursor-pointer transition-all"
            >
              <option value="">Seleccione una asignatura...</option>
              {subjects.map((sub) => {
                const course = sub.courses
                const courseLabel = course
                  ? `${course.name} (${course.grade_level}° "${course.section}")`
                  : 'Sin salón'
                return (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} — {courseLabel}
                  </option>
                )
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Selector de Fecha */}
        <div className="space-y-1.5">
          <label
            htmlFor="date-select"
            className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            Fecha del Pase de Lista
          </label>
          <div className="relative">
            <input
              id="date-select"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Resumen de Asistencia */}
      {selectedSubjectId && totalStudents > 0 && (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Resumen:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-extrabold bg-slate-200/60 text-slate-700 rounded-full">
              Total: {totalStudents}
            </span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
              Presentes: {presentCount}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-100 rounded-full">
              Ausentes: {absentCount}
            </span>
            {tardyCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100 rounded-full">
                Tardes: {tardyCount}
              </span>
            )}
            {justifiedCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-100 rounded-full">
                Justificados: {justifiedCount}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
