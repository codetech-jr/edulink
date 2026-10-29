import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, LayoutDashboard, Users, UserCheck, AlertTriangle, UserPlus } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { isAdminRole } from '@/lib/permissions'
import { RepresentantesClient, RepresentativeWithStudents } from './_components/RepresentantesClient'

export const metadata = {
  title: 'Directorio de Representantes y Tutores | EduLink',
  description: 'Control de representantes legales, tutores y familiares de la institución.',
}

export default async function RepresentantesPage() {
  const supabase = await createClient()

  // 1. Validar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 2. Obtener perfil
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

  // 3. Obtener cliente administrativo para consultas multi-entidad seguras
  let dbClient: any = supabase
  try {
    dbClient = createAdminClient()
  } catch {
    // fallback a supabase de sesión
  }

  // 4. Consultar representantes registrados
  const { data: rawReps } = await dbClient
    .from('profiles')
    .select('id, full_name, cedula, phone')
    .eq('school_id', profile.school_id)
    .eq('role', 'representante')
    .order('full_name', { ascending: true })

  // 5. Consultar estudiantes activos para mapear la tutela
  let rawStudents: any[] = []
  try {
    const { data: studentsWithRel } = await dbClient
      .from('students')
      .select(`
        id,
        full_name,
        cedula,
        parent_id,
        relationship,
        courses ( id, name, grade_level, section )
      `)
      .eq('school_id', profile.school_id)
      .eq('is_active', true)
    rawStudents = studentsWithRel || []
  } catch {
    // Si la columna relationship aún no está migrada en BD, consultar columnas base
    const { data: studentsBase } = await dbClient
      .from('students')
      .select(`
        id,
        full_name,
        cedula,
        parent_id,
        courses ( id, name, grade_level, section )
      `)
      .eq('school_id', profile.school_id)
      .eq('is_active', true)
    rawStudents = studentsBase || []
  }

  // 6. Agrupar alumnos por su representante (parent_id)
  const studentsByParent = new Map<string, typeof rawStudents>()
  let unassignedStudentsCount = 0

  for (const s of rawStudents) {
    if (!s.parent_id) {
      unassignedStudentsCount++
      continue
    }
    const current = studentsByParent.get(s.parent_id) || []
    current.push(s)
    studentsByParent.set(s.parent_id, current)
  }

  // 7. Construir lista unificada de representantes con sus representados
  const representativesList: RepresentativeWithStudents[] = (rawReps || []).map((rep: any) => {
    const myStudents = studentsByParent.get(rep.id) || []

    return {
      id: rep.id,
      fullName: rep.full_name,
      cedula: rep.cedula,
      phone: rep.phone,
      students: myStudents.map((ms: any) => {
        const c = Array.isArray(ms.courses) ? ms.courses[0] : ms.courses
        const courseName = c
          ? `${c.grade_level ? `${c.grade_level}°` : ''} "${c.section || ''}"`
          : 'Sin curso'

        return {
          id: ms.id,
          fullName: ms.full_name,
          cedula: ms.cedula,
          courseName,
          relationship: ms.relationship || null,
        }
      }),
    }
  })

  // 8. Métricas KPI
  const totalReps = representativesList.length
  const multiChildFamilies = representativesList.filter((r) => r.students.length > 1).length
  const assignedStudentsTotal = rawStudents.length - unassignedStudentsCount

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-medium text-gray-500" aria-label="Breadcrumb">
        <Link href="/admin" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
          <LayoutDashboard className="w-4 h-4" />
          <span>Admin</span>
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
        <span className="text-gray-900 font-bold">Representantes y Tutores</span>
      </nav>

      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Directorio de Representantes y Tutores
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión de las personas responsables (abuelos, tíos, tutores legales y padres) a cargo de los estudiantes.
          </p>
        </div>

        <Link
          href="/admin/students/new"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-all active:scale-95 whitespace-nowrap self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Alumno / Tutor</span>
        </Link>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Total Tutores */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Tutores Registrados
            </span>
            <span className="text-3xl font-extrabold text-gray-900 mt-1 block">
              {totalReps}
            </span>
            <span className="text-xs text-gray-500 mt-0.5 block font-medium">
              Representantes con perfil
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Familias con 2+ Estudiantes */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block">
              Familias Múltiples
            </span>
            <span className="text-3xl font-extrabold text-blue-700 mt-1 block">
              {multiChildFamilies}
            </span>
            <span className="text-xs text-gray-500 mt-0.5 block font-medium">
              Tutores con 2 o más alumnos
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Cobertura de Tutela */}
        <div className={`rounded-2xl p-5 border shadow-sm flex items-center justify-between ${
          unassignedStudentsCount > 0
            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
            : 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
        }`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block">
              {unassignedStudentsCount > 0 ? 'Sin Tutor Asignado' : '100% Asignados'}
            </span>
            <span className="text-3xl font-extrabold mt-1 block">
              {unassignedStudentsCount}
            </span>
            <span className="text-xs opacity-80 mt-0.5 block font-medium">
              {unassignedStudentsCount > 0
                ? 'Alumnos pendientes por vincular'
                : `${assignedStudentsTotal} alumnos con tutor legal`}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            unassignedStudentsCount > 0
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Cliente Interactivo de Búsqueda y Tabla */}
      <RepresentantesClient representatives={representativesList} />
    </div>
  )
}
