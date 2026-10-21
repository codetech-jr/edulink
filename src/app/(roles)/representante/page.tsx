import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logoutAction } from '@/actions/auth-actions'
import { DashboardTabs } from './_components/DashboardTabs'
import { FinancesTab } from './_components/FinancesTab'
import { AcademicsTab } from './_components/AcademicsTab'
import { CommunicationsTab } from './_components/CommunicationsTab'
import { PWAInstallBanner } from './_components/PWAInstallBanner'
import { OfflineStatusBanner } from './_components/OfflineStatusBanner'
import { getRepresentativeData } from './_lib/getRepresentativeData'
import {
  LogOut,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  Building,
} from 'lucide-react'

export const metadata = {
  title: 'Portal de Representante | EduLink',
  description: 'Portal bancario y académico para padres y representantes.',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export default async function RepresentanteDashboardPage() {
  const supabase = await createClient()

  // 1. Validar sesión
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const data = await getRepresentativeData(supabase, user.id)

  // Si no hay estudiantes asociados, mostrar Empty State amigable
  if ('isEmpty' in data) {
    return (
      <main className="flex min-h-screen flex-col bg-zinc-50 text-zinc-800 p-4 font-sans">
        <div className="mx-auto w-full max-w-md flex flex-col justify-center items-center min-h-[80vh] space-y-6">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
            <User className="w-10 h-10 animate-pulse" />
          </div>

          <div className="text-center space-y-2 px-4">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Hola, {data.profile.full_name}
            </h1>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Cuenta sin Vincular
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              Actualmente no tienes estudiantes asociados a tu cuenta en nuestra base de datos.
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-medium text-left mt-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>¿Qué debo hacer?</strong> Acuda a la secretaría del plantel con la cédula escolar de sus representados para enlazarse de inmediato.
              </span>
            </div>
          </div>

          <form action={logoutAction} className="w-full pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl shadow-xs transition-all text-xs min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </main>
    )
  }

  const {
    profile,
    rawStudents,
    billingConcepts,
    bcvRate,
    school,
    representedStudents,
    studentsWithAcademicData,
    communications,
    totalPagadoGlobal,
    totalDeudaGlobal,
    pendingPaymentsGlobal,
  } = data

  const profileCard = (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xs border border-zinc-800">
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-indigo-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Portal del Representante</span>
        </div>
        <h2 className="text-lg font-bold tracking-tight text-white truncate">
          {profile.full_name}
        </h2>
        <p className="text-2xs text-zinc-400 truncate">
          {school.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-zinc-800/80">
        <div className="space-y-0.5">
          <span className="text-2xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Total Pagado
          </span>
          <span className="text-xl font-bold text-white tracking-tight font-mono">
            {formatCurrency(totalPagadoGlobal)}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-2xs font-semibold text-zinc-400 uppercase tracking-wider block">
            {totalDeudaGlobal > 0 ? 'Saldo Pendiente' : 'Estado'}
          </span>
          {totalDeudaGlobal > 0 ? (
            <span className="text-xl font-bold text-rose-400 tracking-tight font-mono">
              {formatCurrency(totalDeudaGlobal)}
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Solvente</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )

  const quickSummaryCard = (
    <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex flex-col justify-between">
      <div className="space-y-3">
        <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block">
          Resumen Familiar
        </span>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-zinc-400" />
              Hijos Matriculados:
            </span>
            <span className="font-bold text-zinc-800 font-mono">
              {rawStudents.length}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              Pagos por Verificar:
            </span>
            <span className="font-bold text-amber-600 font-mono">
              {pendingPaymentsGlobal.length}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 flex items-center gap-2">
              <Building className="w-4 h-4 text-zinc-400" />
              Tasa Oficial BCV:
            </span>
            <span className="font-bold text-emerald-700 font-mono">
              {bcvRate.toFixed(2)} Bs/$
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-2 border-t border-zinc-100 flex items-center justify-between text-2xs text-zinc-400">
        <span>Información protegida</span>
        <span className="font-mono text-indigo-600 font-semibold">EduLink 2026</span>
      </div>
    </div>
  )

  const financesTabContent = (
    <FinancesTab
      students={representedStudents}
      billingConcepts={billingConcepts}
      bcvRate={bcvRate}
      school={school}
    />
  )

  const academicsTabContent = (
    <AcademicsTab students={studentsWithAcademicData as any} />
  )

  const communicationsTabContent = (
    <CommunicationsTab schoolName={school.name} communications={communications} />
  )

  return (
    <main className="min-h-screen bg-zinc-50/70 text-zinc-800 pb-16 font-sans">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-6 py-3 shadow-2xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              EL
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-zinc-900 tracking-tight leading-tight">
                EduLink Portal
              </h1>
              <p className="text-[11px] text-zinc-400 leading-none">
                Familia y Representantes
              </p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors min-h-[44px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        <PWAInstallBanner />
        <OfflineStatusBanner />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            {profileCard}
          </div>
          <div>
            {quickSummaryCard}
          </div>
        </div>

        <DashboardTabs
          financesContent={financesTabContent}
          academicsContent={academicsTabContent}
          communicationsContent={communicationsTabContent}
        />
      </div>
    </main>
  )
}
