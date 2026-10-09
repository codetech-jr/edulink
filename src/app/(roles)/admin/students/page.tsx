import { createClient } from '@/utils/supabase/server'
import { logoutAction } from '@/actions/auth-actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight,
  LogOut,
  LayoutDashboard,
  MoreVertical,
  UserPlus,
  GraduationCap,
  Users,
} from 'lucide-react'

export const metadata = {
  title: 'Gestión de Estudiantes | EduLink',
  description: 'Administración de la matrícula estudiantil.',
}

import { StudentSearch } from './_components/student-search'
import { StudentRowActions } from './_components/student-row-actions'

export default async function StudentsManagementPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = await createClient()
  const query = searchParams.q

  // 1. Verificar sesión autenticada
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Obtener el school_id del admin desde su perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  // 3. Obtener estudiantes del colegio con datos del curso (join)
  let supabaseQuery = supabase
    .from('students')
    .select(`
      id,
      full_name,
      cedula,
      gender,
      is_active,
      courses ( name, grade_level, section )
    `)
    .eq('school_id', profile?.school_id ?? '')

  if (query) {
    supabaseQuery = supabaseQuery.or(`full_name.ilike.%${query}%,cedula.ilike.%${query}%`)
  }

  const { data: students } = await supabaseQuery.order('full_name', { ascending: true })

  const studentList = students ?? []
  const hasStudents = studentList.length > 0 || !!query

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Superior */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium text-gray-500" aria-label="Breadcrumb">
            <Link href="/admin" className="hover:text-blue-600 transition-colors">Admin</Link>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
            <span className="text-gray-900">Estudiantes</span>
          </nav>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full font-semibold text-sm hover:bg-red-100 transition-all border border-red-100"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </form>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Estudiantes</h1>
            <p className="text-gray-600 mt-1">
              {studentList.length > 0
                ? `${studentList.length} estudiante${studentList.length !== 1 ? 's' : ''} encontrado${studentList.length !== 1 ? 's' : ''}`
                : query ? 'No se encontraron resultados para tu búsqueda.' : 'Administra la matrícula de tu institución.'
              }
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <StudentSearch />
            <Link 
              href="/admin/students/new"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 whitespace-nowrap"
            >
              <UserPlus className="w-5 h-5" />
              Nuevo Estudiante
            </Link>
          </div>
        </div>


        {/* Contenido condicional: Tabla, No resultados, o Empty State */}
        {studentList.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiante</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cédula</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Curso</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {studentList.map((student: any) => {
                    const course = student.courses as any
                    const courseName = course
                      ? `${course.grade_level}° "${course.section}" - ${course.name}`
                      : 'Sin asignar'

                    return (
                      <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group/row">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 group-hover/row:bg-blue-600 group-hover/row:text-white transition-colors">
                              {student.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-900">{student.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium text-sm">
                          {student.cedula ?? '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                            {courseName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            student.is_active
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-red-50 text-red-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${student.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} aria-hidden="true" />
                            {student.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <StudentRowActions 
                            studentId={student.id} 
                            studentName={student.full_name} 
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer de Tabla */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 font-medium">
              <span>Mostrando {studentList.length} estudiante{studentList.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        ) : query ? (
          /* ──────────── NO RESULTS SEARCH ──────────── */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-50 p-6 rounded-2xl mb-6">
              <Users className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-500 max-w-sm leading-relaxed">
              No hay estudiantes que coincidan con "<span className="font-bold text-gray-900">{query}</span>". Intenta con otro nombre o cédula.
            </p>
          </div>
        ) : (
          /* ──────────── EMPTY STATE (TOTAL) ──────────── */
          <div role="status" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-blue-50 p-5 rounded-2xl mb-6">
              <GraduationCap className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Aún no hay estudiantes registrados
            </h3>
            <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">
              Comienza agregando al primer estudiante de tu institución para gestionar su información académica.
            </p>
            <Link 
              href="/admin/students/new"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <UserPlus className="w-5 h-5" />
              Inscribir primer estudiante
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}
