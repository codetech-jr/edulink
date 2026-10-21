'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { ROLE_DASHBOARD_MAP } from '@/lib/permissions'

export type AuthState = {
  error: string | null
}

export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'El correo y la contraseña son obligatorios.' }
  }

  const supabase = await createClient()

  // 1. Autenticar con Supabase (esto guarda la sesión en las cookies vía setAll)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    let errorMessage = 'Ocurrió un error inesperado al iniciar sesión.'
    if (authError.message.includes('Invalid login credentials')) {
      errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.'
    }
    return { error: errorMessage }
  }

  // 2. Buscar el perfil en la tabla "profiles" usando el cliente ADMIN
  let profile, profileError
  try {
    const adminClient = createAdminClient()
    const result = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', authData.user!.id)
      .single()
    profile = result.data
    profileError = result.error
  } catch (err) {
    return { error: 'Error de configuración del servidor. Verifica las claves de Supabase.' }
  }

  if (profileError || !profile) {
    return { error: 'Tu cuenta existe, pero no pudimos verificar tu rol. Contacta al administrador.' }
  }

  // 3. Redirigir al dashboard según el rol usando el mapa centralizado
  const role = profile.role
  const redirectPath = ROLE_DASHBOARD_MAP[role as keyof typeof ROLE_DASHBOARD_MAP]

  if (!redirectPath) {
    return { error: 'El rol asignado no es válido o no tiene una vista asignada.' }
  }

  // CRÍTICO: revalidar antes de redirigir para que Next.js propague las cookies
  revalidatePath('/', 'layout')
  redirect(redirectPath)
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ────────────────────────────────────────────────────────────────────────────
// REGISTER SCHOOL ACTION — Self-service B2B SaaS onboarding
// ────────────────────────────────────────────────────────────────────────────

export type RegisterState = {
  error: string | null
  fieldErrors?: Partial<Record<string, string>>
}

export async function registerSchoolAction(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  // ── 1. Extraer y validar campos ──────────────────────────────────────────
  const schoolName = (formData.get('schoolName') as string)?.trim()
  const rif = (formData.get('rif') as string)?.trim()
  const directorName = (formData.get('directorName') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  const fieldErrors: Partial<Record<string, string>> = {}

  if (!schoolName || schoolName.length < 3) {
    fieldErrors.schoolName = 'El nombre del colegio debe tener al menos 3 caracteres.'
  }
  if (!rif || rif.length < 5) {
    fieldErrors.rif = 'El RIF es obligatorio (mínimo 5 caracteres).'
  }
  if (!directorName || directorName.length < 3) {
    fieldErrors.directorName = 'El nombre del director debe tener al menos 3 caracteres.'
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = 'Ingresa un correo electrónico válido.'
  }
  if (!password || password.length < 6) {
    fieldErrors.password = 'La contraseña debe tener al menos 6 caracteres.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Corrige los campos marcados.', fieldErrors }
  }

  // ── 2. Crear cliente Admin (salta RLS) ───────────────────────────────────
  let adminClient: ReturnType<typeof createAdminClient>
  try {
    adminClient = createAdminClient()
  } catch {
    return { error: 'Error de configuración del servidor. Contacta soporte.' }
  }

  // ── 3. Insertar la nueva escuela en `schools` ───────────────────────────
  const { data: school, error: schoolError } = await adminClient
    .from('schools')
    .insert({
      name: schoolName,
      rif,
      email,
    })
    .select('id')
    .single()

  if (schoolError || !school) {
    // Si el RIF ya existe, Supabase devuelve un error unique
    if (schoolError?.code === '23505') {
      return { error: 'Ya existe un colegio registrado con ese RIF.' }
    }
    return { error: 'No se pudo registrar el colegio. Intenta de nuevo.' }
  }

  const schoolId = school.id

  // ── 4. Crear el usuario en Supabase Auth ─────────────────────────────────
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: directorName,
    },
  })

  if (authError || !authData.user) {
    // ROLLBACK: Eliminar la escuela recién creada
    await adminClient.from('schools').delete().eq('id', schoolId)

    if (authError?.message?.includes('already been registered')) {
      return { error: 'Ya existe una cuenta con ese correo electrónico.' }
    }
    return { error: 'No se pudo crear la cuenta de usuario. Intenta de nuevo.' }
  }

  const userId = authData.user.id

  // ── 5. Actualizar el perfil con role='admin' y school_id ─────────────────
  //    El trigger handle_new_user ya creó la fila en profiles con rol
  //    'representante'. Actualizamos a 'admin' y vinculamos school_id.
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({
      role: 'admin',
      school_id: schoolId,
      full_name: directorName,
    })
    .eq('id', userId)

  if (profileError) {
    // ROLLBACK: Eliminar usuario de Auth y la escuela
    await adminClient.auth.admin.deleteUser(userId)
    await adminClient.from('schools').delete().eq('id', schoolId)
    return { error: 'No se pudo configurar el perfil administrativo. Intenta de nuevo.' }
  }

  // ── 6. Iniciar sesión automáticamente con el nuevo usuario ───────────────
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    // El registro fue exitoso, pero el auto-login falló. Redirigir a login.
    revalidatePath('/', 'layout')
    redirect('/login')
  }

  // ── 7. Redirigir al dashboard de administrador ───────────────────────────
  revalidatePath('/', 'layout')
  redirect('/admin')
}
