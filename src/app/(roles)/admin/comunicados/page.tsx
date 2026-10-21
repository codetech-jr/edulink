import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { logoutAction } from '@/actions/auth-actions'
import { AnnouncementForm } from './_components/announcement-form'
import { CommunicationsList } from './_components/CommunicationsList'

export const metadata = {
  title: 'Comunicados Oficiales | EduLink',
  description: 'Publicación y gestión de anuncios y notificaciones institucionales.',
}

export default async function AdminComunicadosPage() {
  const supabase = await createClient()

  // 1. Validar sesión de usuario
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Obtener perfil del usuario para validar school_id y rol
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || !profile.school_id) {
    redirect('/login')
  }

  const schoolId = profile.school_id

  // 3. Consultar listado de comunicados y cursos en paralelo
  const [communicationsRes, coursesRes] = await Promise.all([
    supabase
      .from('communications')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false }),
    supabase
      .from('courses')
      .select('id, name, grade_level, section')
      .eq('school_id', schoolId)
      .order('grade_level', { ascending: true }),
  ])

  if (communicationsRes.error) {
    console.error('Error fetching communications:', communicationsRes.error)
  }

  const communications = communicationsRes.data ?? []
  const courses = coursesRes.data ?? []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Superior */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="bg-emerald-600 p-2 rounded-lg hover:bg-emerald-700 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium text-gray-500" aria-label="Breadcrumb">
            <Link href="/admin" className="hover:text-emerald-600 transition-colors">Admin</Link>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
            <span className="text-gray-900">Comunicados</span>
          </nav>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full font-semibold text-sm hover:bg-red-100 transition-all border border-red-100 cursor-pointer min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </form>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        {/* Cabecera de Página */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="bg-emerald-600 w-2 h-8 rounded-full inline-block" />
            Comunicados Oficiales
          </h1>
          <p className="text-gray-500 mt-1.5 font-medium">
            Registra y difunde avisos institucionales con plantillas oficiales, segmentación por audiencia y soporte de WhatsApp.
          </p>
        </div>

        {/* Layout en 2 Columnas (Listado y Formulario) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Historial de Comunicados con Tabs (Activos / Archivados) (7 de 12 columnas) */}
          <div className="lg:col-span-7 space-y-6">
            <CommunicationsList initialCommunications={communications} />
          </div>

          {/* Columna Derecha: Formulario con Selector de Plantillas y Preview (5 de 12 columnas) */}
          <div className="lg:col-span-5">
            <AnnouncementForm courses={courses} />
          </div>

        </div>
      </main>
    </div>
  )
}
