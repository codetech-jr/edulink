import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClipboardCheck, BookMarked, ArrowUpRight, Sparkles } from 'lucide-react'

export default async function DocenteDashboardPage() {
  const supabase = await createClient()

  // Auth is handled by layout.tsx — we just need the user for data queries
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'docente') {
    redirect('/login')
  }

  // Count the teacher's subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id')
    .eq('teacher_id', user.id)

  const subjectsCount = subjects?.length || 0

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* ── Greeting ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Hola, {profile.full_name || 'Profesor'}
        </h1>
        <p className="mt-1 text-[14px] text-zinc-400">
          Bienvenido al Portal Docente de EduLink.
        </p>
      </div>

      {/* ── Stats Widget ── */}
      <div className="bg-zinc-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">
            Resumen de Actividades
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Clases Activas
          </h2>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
              Materias Asignadas
            </span>
            <span className="text-2xl font-semibold text-white tracking-tight">
              {subjectsCount} {subjectsCount === 1 ? 'Materia' : 'Materias'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-[11px] font-medium rounded-full text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Año Escolar Activo
          </span>
        </div>
      </div>

      {/* ── Direct Access Links ─────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest pl-1">
          Accesos Directos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Asistencia */}
          <Link href="/docente/asistencia" className="group block">
            <div className="h-full flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 transition-all duration-200 hover:border-zinc-300 hover:shadow-sm">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 transition-colors duration-200 group-hover:bg-zinc-100 border border-zinc-200/40">
                  <ClipboardCheck
                    className="h-[18px] w-[18px] text-zinc-600"
                    strokeWidth={1.8}
                  />
                </div>
                <h4 className="mt-4 text-[14px] font-semibold text-zinc-800 group-hover:text-zinc-900">
                  Control de Aula (Asistencia)
                </h4>
                <p className="mt-1.5 text-[12.5px] text-zinc-400 leading-relaxed">
                  Toma la asistencia diaria de tus alumnos y gestiona retardos de forma rápida y sencilla.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-medium text-zinc-400 group-hover:text-zinc-600 transition-colors">
                <span>Ir al Asistenciario</span>
                <ArrowUpRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 transition-all" />
              </div>
            </div>
          </Link>

          {/* Calificaciones */}
          <Link href="/docente/calificaciones" className="group block">
            <div className="h-full flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 transition-all duration-200 hover:border-zinc-300 hover:shadow-sm">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 transition-colors duration-200 group-hover:bg-indigo-100 border border-indigo-100/10">
                  <BookMarked
                    className="h-[18px] w-[18px] text-indigo-600"
                    strokeWidth={1.8}
                  />
                </div>
                <h4 className="mt-4 text-[14px] font-semibold text-zinc-800 group-hover:text-zinc-900">
                  Módulo de Calificaciones
                </h4>
                <p className="mt-1.5 text-[12.5px] text-zinc-400 leading-relaxed">
                  Carga evaluaciones por lapso, calcula promedios y visualiza el rendimiento académico grupal.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">
                <span>Ir a Calificaciones</span>
                <ArrowUpRight className="h-4 w-4 text-indigo-300 group-hover:text-indigo-500 transition-all" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
