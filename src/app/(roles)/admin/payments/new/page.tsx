import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { logoutAction } from '@/actions/auth-actions'
import { PaymentForm } from '../_components/payment-form'

export const metadata = {
  title: 'Registrar Pago | EduLink',
  description: 'Formulario de registro manual de pagos.',
}

export default async function NewPaymentPage() {
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

  // 3. Traer estudiantes activos del colegio (id + full_name)
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name')
    .eq('school_id', profile.school_id)
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  // 4. Traer conceptos de facturación activos del colegio utilizando el cliente Admin para saltar restricciones de RLS
  const adminSupabase = createAdminClient()
  const { data: billingConcepts } = await adminSupabase
    .from('billing_concepts')
    .select('id, name, amount_usd')
    .eq('school_id', profile.school_id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  const studentList = students ?? []
  const conceptList = billingConcepts ?? []

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
            <span className="text-gray-900">Nuevo Pago</span>
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
      <main className="flex-1 p-6 lg:p-10 max-w-3xl mx-auto w-full">
        <PaymentForm students={studentList} billingConcepts={conceptList} />
      </main>
    </div>
  )
}
