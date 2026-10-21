'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { isDirectorOnly, ADMIN_ROLES } from '@/lib/permissions'

export type StaffActionState = {
  error: string | null
  success?: boolean
}

/**
 * Crea una cuenta de staff (coordinador o docente) y la vincula
 * al colegio del director que la invoca.
 * Solo ejecutable por usuarios con rol 'admin' (Director).
 */
export async function createStaffMemberAction(
  prevState: StaffActionState,
  formData: FormData
): Promise<StaffActionState> {
  const supabase = await createClient()

  // 1. Verificar sesión
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'No autorizado. Inicia sesión nuevamente.' }
  }

  // 2. Verificar que el usuario sea Director
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id || !isDirectorOnly(profile.role)) {
    return { error: 'Solo el Director(a) puede crear cuentas de personal.' }
  }

  // 3. Extraer y validar datos del formulario
  const fullName = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = (formData.get('password') as string)
  const role = (formData.get('role') as string)

  if (!fullName || fullName.length < 3) {
    return { error: 'El nombre completo debe tener al menos 3 caracteres.' }
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Ingresa un correo electrónico válido.' }
  }

  if (!password || password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  // Solo se permite crear coordinadores y docentes desde esta acción
  const allowedNewRoles = ['coordinador', 'docente']
  if (!allowedNewRoles.includes(role)) {
    return { error: 'El rol seleccionado no es válido. Solo se permite: Coordinador o Docente.' }
  }

  // 4. Crear el usuario con el cliente Admin (salta RLS)
  const adminClient = createAdminClient()

  const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  })

  if (createError || !authData.user) {
    if (createError?.message?.includes('already been registered')) {
      return { error: 'Ya existe una cuenta con ese correo electrónico.' }
    }
    console.error('Error creando usuario staff:', createError)
    return { error: 'No se pudo crear la cuenta. Intenta nuevamente.' }
  }

  const newUserId = authData.user.id

  // 5. Actualizar el perfil con el rol y el school_id del director
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({
      role,
      school_id: profile.school_id,
      full_name: fullName,
    })
    .eq('id', newUserId)

  if (profileError) {
    // Rollback: eliminar el usuario de Auth
    await adminClient.auth.admin.deleteUser(newUserId)
    console.error('Error asignando perfil al staff:', profileError)
    return { error: 'Se creó la cuenta pero no se pudo asignar el rol. Intenta de nuevo.' }
  }

  // 6. Revalidar la página de usuarios
  revalidatePath('/admin/usuarios')

  return { error: null, success: true }
}
