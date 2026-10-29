import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, LayoutDashboard, AlertCircle, ArrowRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { isAdminRole } from '@/lib/permissions'
import { getMppeAgeStatistics } from '@/lib/services/mppe-statistics.service'
import { StatisticsKPIs } from './_components/StatisticsKPIs'
import { MonthSelector } from './_components/MonthSelector'
import { StatisticsMatrixTable } from './_components/StatisticsMatrixTable'

export const metadata = {
  title: 'Estadística por Edades y Sexo MPPE | EduLink',
  description: 'Cuadro de distribución de matrícula por edad y género según formato oficial del MPPE.',
}

interface PageProps {
  searchParams: {
    month?: string
    year?: string
  }
}

export default async function MppeAgeStatisticsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // 1. Validar usuario autenticado
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 2. Obtener perfil y verificar autorización
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role, school_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.school_id) {
    redirect('/login')
  }

  if (!isAdminRole(profile.role)) {
    redirect('/admin')
  }

  // 3. Procesar parámetros de mes y año
  const today = new Date()
  const monthParam = searchParams.month ? parseInt(searchParams.month, 10) : today.getMonth() + 1
  const yearParam = searchParams.year ? parseInt(searchParams.year, 10) : today.getFullYear()

  // 4. Obtener reporte estadístico
  const report = await getMppeAgeStatistics({
    schoolId: profile.school_id,
    month: isNaN(monthParam) ? today.getMonth() + 1 : monthParam,
    year: isNaN(yearParam) ? today.getFullYear() : yearParam,
  })

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
      {/* Breadcrumb Superior */}
      <nav className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/admin" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
          <LayoutDashboard className="w-4 h-4" />
          <span>Admin</span>
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
        <Link href="/admin/students" className="hover:text-blue-600 transition-colors">
          Alumnado
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
        <span className="text-gray-900 font-bold">Estadística por Edades (MPPE)</span>
      </nav>

      {/* Título y Descripción */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Estadística por Edades y Sexo
          </h1>
          <p className="text-gray-600 mt-1">
            Resumen estadístico mensual de matrícula requerido por el Ministerio del Poder Popular para la Educación (MPPE).
          </p>
        </div>
      </div>

      {/* Selector de Mes y Botón de Descarga PDF */}
      <MonthSelector
        currentMonth={report.monthNumber}
        currentYear={yearParam}
        schoolYearName={report.schoolYear.name}
        cutOffDate={report.cutOffDate}
      />

      {/* Banner de Advertencia si hay alumnos con datos incompletos */}
      {report.summary.incompleteDataTotal > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                {report.summary.incompleteDataTotal} estudiante{report.summary.incompleteDataTotal !== 1 ? 's' : ''} con datos incompletos
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Para que la estadística oficial sea 100% exacta, asegúrate de que todos los alumnos tengan registrada su Fecha de Nacimiento y Sexo (Varón/Hembra).
              </p>
            </div>
          </div>
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <span>Ir a Alumnado</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPIs Resumen */}
      <StatisticsKPIs
        summary={report.summary}
        monthName={report.monthName}
        cutOffDate={report.cutOffDate}
      />

      {/* Tabla Matricial */}
      <StatisticsMatrixTable report={report} />
    </div>
  )
}
