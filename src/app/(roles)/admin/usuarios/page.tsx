import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { isDirectorOnly } from '@/lib/permissions'
import { CreateStaffForm } from './_components/CreateStaffForm'
import {
  UserCog,
  Shield,
  Users,
  Lock,
} from 'lucide-react'

export const metadata = {
  title: 'Gestión de Usuarios | EduLink',
  description: 'Administra las cuentas del personal de tu institución.',
}

export default async function UsuariosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id, full_name')
    .eq('id', user.id)
    .single()

  // Solo el director puede gestionar usuarios
  if (!profile || !isDirectorOnly(profile.role)) {
    redirect('/admin')
  }

  // Obtener todos los perfiles del staff de este colegio (excluye representantes y estudiantes)
  const { data: staffData } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at, email:id')
    .eq('school_id', profile.school_id)
    .in('role', ['admin', 'coordinador', 'docente'])
    .order('role', { ascending: true })
    .order('full_name', { ascending: true })

  const staff = staffData ?? []

  const roleCounts = {
    admin: staff.filter((s) => s.role === 'admin').length,
    coordinador: staff.filter((s) => s.role === 'coordinador').length,
    docente: staff.filter((s) => s.role === 'docente').length,
  }

  const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
    admin: {
      label: 'Director(a)',
      color: 'text-indigo-700',
      bg: 'bg-indigo-50 border-indigo-200',
    },
    coordinador: {
      label: 'Coordinador(a)',
      color: 'text-violet-700',
      bg: 'bg-violet-50 border-violet-200',
    },
    docente: {
      label: 'Docente',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
    },
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[13px] text-zinc-400 mb-1.5">
          <UserCog className="h-3.5 w-3.5" strokeWidth={1.8} />
          Solo visible para el Director(a)
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Gestión de Usuarios
        </h1>
        <p className="mt-1 text-[14.5px] text-zinc-400">
          Administra las cuentas del personal docente y administrativo.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(
          [
            { key: 'admin', icon: Shield, label: 'Directores' },
            { key: 'coordinador', icon: UserCog, label: 'Coordinadores' },
            { key: 'docente', icon: Users, label: 'Docentes' },
          ] as const
        ).map(({ key, icon: Icon, label }) => (
          <div
            key={key}
            className="rounded-xl border border-zinc-200/80 bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-lg p-2.5 ${roleConfig[key].bg}`}>
                <Icon
                  className={`h-[18px] w-[18px] ${roleConfig[key].color}`}
                  strokeWidth={1.8}
                />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-[28px] font-semibold leading-none tracking-tight text-zinc-900">
                {roleCounts[key]}
              </span>
              <p className="mt-1.5 text-[13px] font-medium text-zinc-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Staff list */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Users className="h-4 w-4" strokeWidth={1.8} />
            Personal activo
          </h2>

          {staff.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200/80 bg-white p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-zinc-300 mb-3" strokeWidth={1.5} />
              <p className="text-sm text-zinc-400">No hay personal registrado aún.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200/80 bg-white overflow-hidden">
              {staff.map((member, idx) => {
                const config = roleConfig[member.role] ?? roleConfig.docente
                const isCurrentUser = member.id === user.id

                return (
                  <div
                    key={member.id}
                    className={`flex items-center gap-3.5 px-5 py-3.5 ${
                      idx !== staff.length - 1
                        ? 'border-b border-zinc-100'
                        : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[12px] font-semibold text-zinc-600">
                      {(member.full_name ?? '?').charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-zinc-800">
                        {member.full_name ?? '—'}
                        {isCurrentUser && (
                          <span className="ml-1.5 text-[11px] font-normal text-zinc-400">
                            (tú)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Role badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${config.bg} ${config.color}`}
                    >
                      {member.role === 'coordinador' && (
                        <Lock className="h-2.5 w-2.5" strokeWidth={2} />
                      )}
                      {config.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Create staff form */}
        <div className="lg:col-span-2">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-3">
            <UserCog className="h-4 w-4" strokeWidth={1.8} />
            Añadir miembro
          </h2>
          <CreateStaffForm schoolId={profile.school_id} />
        </div>
      </div>
    </div>
  )
}
