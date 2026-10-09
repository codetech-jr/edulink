'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type CommunicationState = {
  success?: boolean
  error?: string | null
}

export async function createAnnouncementAction(
  prevState: CommunicationState,
  formData: FormData
): Promise<CommunicationState> {
  const supabase = await createClient()

  // 1. Obtener usuario actual
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'No autorizado. Inicie sesión.' }
  }

  // 2. Validar rol de admin y obtener school_id de forma segura en el servidor
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'No se pudo verificar el perfil del usuario.' }
  }

  if (profile.role !== 'admin') {
    return { error: 'Acceso denegado. Se requiere rol de administrador.' }
  }

  if (!profile.school_id) {
    return { error: 'No se pudo determinar la institución asociada a tu cuenta.' }
  }

  // 3. Extraer y validar datos del formulario
  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const body = formData.get('body') as string

  if (!title || !category || !body) {
    return { error: 'Todos los campos son obligatorios.' }
  }

  const trimmedTitle = title.trim()
  const trimmedBody = body.trim()

  if (trimmedTitle.length < 3) {
    return { error: 'El título del comunicado debe tener al menos 3 caracteres.' }
  }

  if (trimmedBody.length < 5) {
    return { error: 'El cuerpo del comunicado debe tener al menos 5 caracteres.' }
  }

  if (!['urgente', 'informativo', 'recordatorio'].includes(category)) {
    return { error: 'La categoría seleccionada no es válida.' }
  }

  // 4. Registrar en la base de datos (forzando school_id del servidor)
  const { error: insertError } = await supabase
    .from('communications')
    .insert({
      school_id: profile.school_id,
      title: trimmedTitle,
      category,
      body: trimmedBody
    })

  if (insertError) {
    console.error('Error insertando comunicado:', insertError)
    if (insertError.code === '42501') {
      return { error: 'No tienes permisos suficientes en la base de datos para crear comunicados.' }
    }
    return { error: 'Ocurrió un error al registrar el comunicado en la base de datos.' }
  }

  // 5. Revalidación múltiple de caché en el servidor
  revalidatePath('/admin/comunicados')
  revalidatePath('/representante')
  revalidatePath('/estudiante')

  return { success: true, error: null }
}
