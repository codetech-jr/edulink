import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { isAdminRole } from '@/lib/permissions'
import { getAdminAttendanceReport } from '@/lib/services/admin-attendance.service'
import { AttendanceViewTab } from '@/lib/types/attendance-admin'
import { AttendanceHeader } from './_components/AttendanceHeader'
import { AttendanceKPIs } from './_components/AttendanceKPIs'
import { AttendanceClientContainer } from './_components/AttendanceClientContainer'

export const metadata = {
  title: 'Control de Asistencia e Inasistencias | EduLink',
  description: 'Monitoreo diario, semanal y acumulado mensual de inasistencias de alumnos según normativa MPPE / LOPNNA.',
}

interface PageProps {
  searchParams: {
    tab?: string
    date?: string
    month?: string
    year?: string
    course_id?: string
  }
}

export default async function AdminAttendancePage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // 1. Validar usuario autenticado
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 2. Obtener perfil y verificar privilegios administrativos
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

  // 3. Normalizar parámetros
  const tab: AttendanceViewTab =
    searchParams.tab === 'diario' || searchParams.tab === 'semanal' || searchParams.tab === 'mensual'
      ? searchParams.tab
      : 'mensual'

  const dateParam = searchParams.date
  const monthParam = searchParams.month ? parseInt(searchParams.month, 10) : undefined
  const yearParam = searchParams.year ? parseInt(searchParams.year, 10) : undefined
  const courseIdParam = searchParams.course_id || 'all'

  // 4. Obtener reporte de asistencia
  const report = await getAdminAttendanceReport({
    schoolId: profile.school_id,
    tab,
    date: dateParam,
    month: monthParam,
    year: yearParam,
    courseId: courseIdParam,
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado y navegación */}
      <AttendanceHeader schoolName={report.schoolName} />

      {/* Tarjetas de Métricas y KPIs */}
      <AttendanceKPIs kpis={report.kpis} tab={report.tab} />

      {/* Contenedor interactivo (Pestañas, filtros y tablas de datos) */}
      <AttendanceClientContainer report={report} />
    </div>
  )
}
