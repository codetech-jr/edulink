import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './_components/AdminSidebar'
import { isAdminRole, ROLE_LABELS, type AppRole } from '@/lib/permissions'

export const metadata = {
  title: 'Panel Administrativo | EduLink',
  description: 'Gestión centralizada para directivos de EduLink.',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // ── Auth gate ────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ── Profile fetch ────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, school_id')
    .eq('id', user.id)
    .single()

  // Solo admin y coordinador pueden acceder al panel
  if (!profile || !isAdminRole(profile.role)) {
    redirect('/login')
  }

  const displayName = profile.full_name ?? 'Administrador'
  const roleLabel = ROLE_LABELS[profile.role as AppRole] ?? 'Administrador'

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sidebar (fixed on desktop, overlay on mobile) */}
      <AdminSidebar
        displayName={displayName}
        roleLabel={roleLabel}
        role={profile.role as AppRole}
      />

      {/* Main content area — offset by sidebar width on desktop */}
      <main className="md:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-200/70 bg-white/80 px-6 backdrop-blur-xl md:px-8">
          {/* Left spacer for mobile menu button */}
          <div className="w-10 md:w-0" />

          {/* Right: user indicator */}
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-[13px] text-zinc-400 sm:block">
              {displayName}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-[12px] font-semibold text-indigo-600">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
