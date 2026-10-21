import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  ChevronRight,
  LogOut,
  Receipt,
  Calendar,
  DollarSign,
  Coins,
  AlertCircle,
} from 'lucide-react'
import { logoutAction } from '@/actions/auth-actions'
import { BillingForm } from './_components/billing-form'

export const metadata = {
  title: 'Conceptos de Facturación (Aranceles) | EduLink',
  description: 'Gestión y catálogo de aranceles de la institución.',
}

// Función auxiliar para extraer y formatear la fecha de vencimiento almacenada en description
function formatDueDate(description: string | null): string {
  if (!description) return 'Sin vencimiento'
  
  // Expresión regular para buscar "Vence: YYYY-MM-DD"
  const match = description.match(/Vence:\s*([\w-]+)/)
  if (match) {
    const dateStr = match[1]
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      // Retornar formato amigable local DD/MM/YYYY
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  }
  
  // Retornar la descripción tal cual si no coincide
  return description
}

export default async function BillingPage() {
  const supabase = await createClient()

  // 1. Verificar sesión autenticada
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Obtener school_id del perfil del administrador
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) {
    redirect('/login')
  }

  // 3. Obtener aranceles (conceptos de facturación) activos del colegio utilizando el cliente Admin para saltar restricciones de RLS
  const adminSupabase = createAdminClient()
  const { data: billingConcepts } = await adminSupabase
    .from('billing_concepts')
    .select('id, name, amount_usd, description, is_active')
    .eq('school_id', profile.school_id)
    .eq('is_active', true)
    .order('created_at', { ascending: false }) // Mostrar los más nuevos arriba

  const conceptsList = billingConcepts ?? []

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
            <Link href="/admin/payments" className="hover:text-emerald-600 transition-colors">Pagos</Link>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
            <span className="text-gray-900">Aranceles</span>
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
        {/* Cabecera de Página */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="bg-emerald-600 w-2 h-8 rounded-full inline-block" />
            Conceptos de Facturación (Aranceles)
          </h1>
          <p className="text-gray-500 mt-1.5 font-medium">
            Define, visualiza y gestiona las mensualidades, inscripciones y otros aranceles de tu institución.
          </p>
        </div>

        {/* Layout en 2 Columnas (Listado y Formulario) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Columna Izquierda: Listado de Aranceles (8 de 12 columnas) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-600" />
                  Aranceles Activos
                </h2>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full">
                  {conceptsList.length} total{conceptsList.length !== 1 ? 'es' : ''}
                </span>
              </div>

              {/* Si no hay registros, mostramos Empty State premium */}
              {conceptsList.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 mb-4">
                    <Receipt className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No hay aranceles registrados</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-sm">
                    Registra tu primer concepto de facturación utilizando el formulario de la derecha para empezar a administrar los pagos.
                  </p>
                </div>
              ) : (
                /* Grilla con scrollbars refinados */
                <div className="divide-y divide-gray-100 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th scope="col" className="px-6 py-4">Concepto</th>
                        <th scope="col" className="px-6 py-4">Monto (USD)</th>
                        <th scope="col" className="px-6 py-4">Vencimiento</th>
                        <th scope="col" className="px-6 py-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-900">
                      {conceptsList.map((concept) => (
                        <tr key={concept.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                          {/* Nombre */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                                <Receipt className="w-4.5 h-4.5" />
                              </div>
                              <span className="font-bold text-gray-800">{concept.name}</span>
                            </div>
                          </td>
                          {/* Monto USD */}
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1 text-gray-900 font-extrabold text-base">
                              <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              {parseFloat(String(concept.amount_usd)).toFixed(2)}
                            </span>
                          </td>
                          {/* Fecha Vencimiento */}
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold">
                              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              {formatDueDate(concept.description)}
                            </span>
                          </td>
                          {/* Estado */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              Activo
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Formulario de Creación (4 de 12 columnas) */}
          <div className="lg:col-span-4">
            <BillingForm />
          </div>

        </div>
      </main>
    </div>
  )
}
