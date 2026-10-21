import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from './_components/AdminShell'
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

  // Consultar nombre de la institución escolar
  let schoolName = ''
  if (profile.school_id) {
    const { data: school } = await supabase
      .from('schools')
      .select('name')
      .eq('id', profile.school_id)
      .maybeSingle()

    if (school?.name) {
      schoolName = school.name
    }
  }

  const displayName = profile.full_name ?? 'Administrador'
  const roleLabel = ROLE_LABELS[profile.role as AppRole] ?? 'Administrador'

  return (
    <AdminShell
      displayName={displayName}
      roleLabel={roleLabel}
      role={profile.role as AppRole}
      schoolName={schoolName}
    >
      {children}
    </AdminShell>
  )
}
