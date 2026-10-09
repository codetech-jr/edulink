'use client'

import { useRouter, usePathname } from 'next/navigation'
import { BookOpen, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Subject {
  id: string
  name: string
  courses: {
    id: string
    name: string
    grade_level: string
    section: string
  } | null
}

interface Term {
  id: string
  name: string
  term_number: number
}

interface SelectorHeaderProps {
  subjects: Subject[]
  terms: Term[]
  selectedSubjectId: string
  selectedTermId: string
}

export function SelectorHeader({
  subjects,
  terms,
  selectedSubjectId,
  selectedTermId,
}: SelectorHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSubjectChange = (subjectId: string) => {
    const params = new URLSearchParams()
    if (subjectId) params.set('subjectId', subjectId)
    if (selectedTermId) params.set('termId', selectedTermId)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleTermChange = (termId: string) => {
    const params = new URLSearchParams()
    if (selectedSubjectId) params.set('subjectId', selectedSubjectId)
    if (termId) params.set('termId', termId)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
      {/* Cabecera superior con botón de regreso */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Cuaderno de Calificaciones</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Selecciona la materia y el lapso para cargar la planilla de notas.
          </p>
        </div>
        <Link
          href="/docente"
          className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-700 transition-all hover:bg-slate-100 active:scale-[0.98] flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al Home
        </Link>
      </div>

      {/* Selectores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selector de Materia */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1 pl-1">
            <BookOpen className="w-3.5 h-3.5" />
            Asignatura / Curso
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-2xl text-xs font-bold text-slate-900 outline-none transition-all cursor-pointer"
          >
            {subjects.length === 0 ? (
              <option value="">No hay materias asignadas</option>
            ) : (
              subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} — {sub.courses ? `${sub.courses.name} (${sub.courses.grade_level} "${sub.courses.section}")` : 'Sin Curso'}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Selector de Lapso */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1 pl-1">
            <Calendar className="w-3.5 h-3.5" />
            Período Escolar (Lapso)
          </label>
          <select
            value={selectedTermId}
            onChange={(e) => handleTermChange(e.target.value)}
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-2xl text-xs font-bold text-slate-900 outline-none transition-all cursor-pointer"
          >
            {terms.length === 0 ? (
              <option value="">No hay lapsos creados</option>
            ) : (
              terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>
    </div>
  )
}
