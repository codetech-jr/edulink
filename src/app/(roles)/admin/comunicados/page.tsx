import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  ChevronRight,
  LogOut,
  Megaphone,
  Bell,
  Info,
  AlertTriangle,
  Calendar,
  Clock,
  Trash2,
} from 'lucide-react'
import { logoutAction } from '@/actions/auth-actions'
import { AnnouncementForm } from './_components/announcement-form'

export const metadata = {
  title: 'Comunicados Oficiales | EduLink',
  description: 'Publicación y gestión de anuncios y notificaciones institucionales.',
}

function getTypeConfig(type: 'urgente' | 'informativo' | 'recordatorio') {
  switch (type) {
    case 'urgente':
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        color: 'bg-rose-50 text-rose-700 border-rose-100',
        iconBg: 'bg-rose-100 text-rose-600',
        label: 'Urgente',
        accentBar: 'bg-rose-500',
      }
    case 'recordatorio':
      return {
        icon: <Bell className="w-4 h-4" />,
        color: 'bg-amber-50 text-amber-700 border-amber-100',
        iconBg: 'bg-amber-100 text-amber-600',
        label: 'Recordatorio',
        accentBar: 'bg-amber-500',
      }
    default:
      return {
        icon: <Info className="w-4 h-4" />,
        color: 'bg-blue-50 text-blue-700 border-blue-100',
        iconBg: 'bg-blue-100 text-blue-600',
        label: 'Informativo',
        accentBar: 'bg-blue-500',
      }
  }
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

  // 3. Consultar listado de comunicados en la base de datos
  const { data: communicationsList, error: communicationsError } = await supabase
    .from('communications')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  if (communicationsError) {
    console.error('Error fetching communications:', communicationsError)
  }

  const communications = communicationsList ?? []

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
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full font-semibold text-sm hover:bg-red-100 transition-all border border-red-100 cursor-pointer"
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
            Registra y difunde comunicados institucionales en tiempo real para representantes y estudiantes.
          </p>
        </div>

        {/* Layout en 2 Columnas (Listado y Formulario) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Columna Izquierda: Listado de Comunicados Enviados (8 de 12 columnas) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-emerald-600" />
                  Historial de Anuncios
                </h2>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full">
                  {communications.length} enviado{communications.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Si no hay registros, mostramos Empty State premium */}
              {communications.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 mb-4">
                    <Megaphone className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No hay comunicados registrados</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-sm font-medium">
                    Utiliza el formulario de la derecha para redactar y publicar el primer comunicado del colegio.
                  </p>
                </div>
              ) : (
                /* Lista de comunicados */
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {communications.map((comm) => {
                    const config = getTypeConfig(comm.category)
                    const dateObj = new Date(comm.created_at)
                    const dateFormatted = dateObj.toLocaleDateString('es-VE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                    const timeFormatted = dateObj.toLocaleTimeString('es-VE', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })

                    return (
                      <div
                        key={comm.id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden relative transition-all hover:shadow-sm"
                      >
                        {/* Barra de Acento Lateral */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${config.accentBar}`} />

                        <div className="pl-5 pr-5 py-4 space-y-3">
                          {/* Cabecera del Comunicado */}
                          <div className="flex items-start gap-3 justify-between">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${config.iconBg}`}>
                                {config.icon}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                                    {comm.title}
                                  </h3>
                                  <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-extrabold border rounded-full flex-shrink-0 ${config.color}`}>
                                    {config.label}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
                                  {comm.body}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Metadatos en el pie del comunicado */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-300" />
                              {dateFormatted}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-300" />
                              {timeFormatted}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Formulario de Creación (4 de 12 columnas) */}
          <div className="lg:col-span-4">
            <AnnouncementForm />
          </div>

        </div>
      </main>
    </div>
  )
}
