import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DocenteShell } from './_components/DocenteShell'

export const metadata = {
  title: 'Panel Docente | EduLink',
  description: 'Panel de control para docentes de EduLink.',
}

export default async function DocenteLayout({
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

  if (!profile || profile.role !== 'docente') {
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

  const displayName = profile.full_name ?? 'Profesor'

  return (
    <DocenteShell displayName={displayName} schoolName={schoolName}>
      {children}
    </DocenteShell>
  )
}
