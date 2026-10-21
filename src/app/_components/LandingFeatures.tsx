import Link from 'next/link'
import { School, BookOpen, Users, UserCheck, CheckCircle2, ChevronRight } from 'lucide-react'

export function LandingFeatures() {
  return (
    <section id="caracteristicas" className="py-20 lg:py-32 bg-slate-50/50 relative" aria-labelledby="features-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <h2 id="features-title" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-wrap-balance leading-tight">
            Una plataforma integrada en cuatro portales dedicados
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 text-pretty">
            EduLink reúne todos los roles de tu comunidad escolar en un único ecosistema digital conectado en tiempo real.
          </p>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Portal 1: Colegio (Primario: Azul Marino) */}
          <div className="group relative rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                <School className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">Portal del Colegio</h3>
              <p className="text-primary-900/60 text-xs font-semibold uppercase tracking-wider mt-1">Dirección y Administración</p>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                Control total administrativo, contable y académico. Automatiza las conciliaciones y obtén reportes financieros en tiempo real sin hojas de cálculo complejas.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-600" role="list">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span>Conciliación automática de transferencias y Pago Móvil.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span>Control e historial de morosidad por estudiante y sección.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span>Configuración de planes de pago y conceptos de facturación.</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">ADMINISTRADOR</span>
              <Link href="/register" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors duration-150">
                Probar ahora <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Portal 2: Docente (Secundario: Verde Esmeralda) */}
          <div className="group relative rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors duration-300 shadow-sm">
                <BookOpen className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">Portal del Docente</h3>
              <p className="text-emerald-800 text-xs font-semibold uppercase tracking-wider mt-1">Control Académico y Aula</p>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                Planificación digital, carga rápida de calificaciones por lapsos y registro diario de asistencia desde cualquier dispositivo, incluso sin conexión a internet permanente.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-600" role="list">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" aria-hidden="true" />
                  <span>Carga rápida de calificaciones por lapsos académicos.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" aria-hidden="true" />
                  <span>Registro de asistencia diaria en vivo en menos de un minuto.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" aria-hidden="true" />
                  <span>Diseño ágil de planes de evaluación adaptados al plantel.</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">DOCENTE</span>
              <Link href="/register" className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:text-emerald-700 transition-colors duration-150">
                Probar ahora <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Portal 3: Representante (Acento: Ámbar Cálido) */}
          <div className="group relative rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-sm">
                <Users className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">Portal del Representante</h3>
              <p className="text-amber-800 text-xs font-semibold uppercase tracking-wider mt-1">Familia y Finanzas</p>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                Tranquilidad y transparencia. Permite cargar comprobantes de pago desde el teléfono, revisar saldos en tiempo real y recibir avisos inmediatos sobre su representado.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-600" role="list">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" aria-hidden="true" />
                  <span>Reporte rápido de pagos vía móvil o transferencias bancarias.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" aria-hidden="true" />
                  <span>Visualización instantánea de boletas y reportes académicos.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" aria-hidden="true" />
                  <span>Notificaciones de inasistencia o avisos institucionales.</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">REPRESENTANTE</span>
              <Link href="/register" className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-amber-700 transition-colors duration-150">
                Probar ahora <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Portal 4: Alumno (Primario: Azul Marino) */}
          <div className="group relative rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                <UserCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">Portal del Estudiante</h3>
              <p className="text-primary-900/60 text-xs font-semibold uppercase tracking-wider mt-1">Seguimiento Académico</p>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                Fomenta la responsabilidad del alumno. Permite consultar calificaciones publicadas, planes de evaluación y tareas pendientes en un formato optimizado y amigable.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-600" role="list">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span>Consulta rápida de notas publicadas por materia y lapso.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span>Calendario interactivo con cronogramas de evaluaciones.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span>Historial propio de asistencia y inasistencias justificadas.</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">ESTUDIANTE</span>
              <Link href="/register" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors duration-150">
                Probar ahora <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
