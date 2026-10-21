'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdminRole } from '@/lib/permissions'
import {
  CreateAnnouncementSchema,
  ArchiveAnnouncementSchema,
  RepublishAnnouncementSchema,
  DeleteAnnouncementSchema,
} from '@/lib/schemas/communication.schema'

export type CommunicationState = {
  success?: boolean
  error?: string | null
}

/**
 * Publica un nuevo comunicado oficial institucional.
 */
export async function createAnnouncementAction(
  prevState: CommunicationState,
  formData: FormData
): Promise<CommunicationState> {
  // 1. Validar campos del formulario con Zod
  const rawData = Object.fromEntries(formData.entries())
  const validation = CreateAnnouncementSchema.safeParse(rawData)

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'Datos del formulario inválidos', success: false }
  }

  const supabase = await createClient()

  // 2. Obtener usuario actual
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'No autorizado. Inicie sesión.', success: false }
  }

  // 3. Validar rol administrativo y obtener school_id de forma segura
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'No se pudo verificar el perfil del usuario.', success: false }
  }

  if (!isAdminRole(profile.role)) {
    return { error: 'Acceso denegado. Se requiere rol de administrador o coordinador.', success: false }
  }

  if (!profile.school_id) {
    return { error: 'No se pudo determinar la institución asociada a tu cuenta.', success: false }
  }

  const { title, category, body, target_audience } = validation.data

  // 4. Registrar en la base de datos (forzando school_id del servidor)
  const { error: insertError } = await supabase.from('communications').insert({
    school_id: profile.school_id,
    title,
    category,
    body,
    target_audience: target_audience || 'todos',
    is_archived: false,
  })

  if (insertError) {
    console.error('Error insertando comunicado:', insertError)
    if (insertError.code === '42501') {
      return { error: 'No tienes permisos suficientes en la base de datos para crear comunicados.', success: false }
    }
    return { error: 'Ocurrió un error al registrar el comunicado en la base de datos.', success: false }
  }

  // 5. Revalidación de caché en el servidor
  revalidatePath('/admin/comunicados')
  revalidatePath('/representante')
  revalidatePath('/estudiante')

  return { success: true, error: null }
}

/**
 * Archiva un comunicado para ocultarlo de la vista principal.
 */
export async function archiveAnnouncementAction(
  announcementId: string
): Promise<{ success?: boolean; error?: string }> {
  const validation = ArchiveAnnouncementSchema.safeParse({ id: announcementId })
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'ID inválido' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdminRole(profile.role) || !profile.school_id) {
    return { error: 'Permisos insuficientes' }
  }

  const { error: updateError } = await supabase
    .from('communications')
    .update({ is_archived: true })
    .eq('id', announcementId)
    .eq('school_id', profile.school_id)

  if (updateError) {
    console.error('Error archivando comunicado:', updateError)
    return { error: 'Error al archivar el comunicado' }
  }

  revalidatePath('/admin/comunicados')
  revalidatePath('/representante')
  revalidatePath('/estudiante')
  return { success: true }
}

/**
 * Desarchiva un comunicado volviéndolo a hacer visible.
 */
export async function unarchiveAnnouncementAction(
  announcementId: string
): Promise<{ success?: boolean; error?: string }> {
  const validation = ArchiveAnnouncementSchema.safeParse({ id: announcementId })
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'ID inválido' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdminRole(profile.role) || !profile.school_id) {
    return { error: 'Permisos insuficientes' }
  }

  const { error: updateError } = await supabase
    .from('communications')
    .update({ is_archived: false })
    .eq('id', announcementId)
    .eq('school_id', profile.school_id)

  if (updateError) {
    console.error('Error desarchivando comunicado:', updateError)
    return { error: 'Error al desarchivar el comunicado' }
  }

  revalidatePath('/admin/comunicados')
  revalidatePath('/representante')
  revalidatePath('/estudiante')
  return { success: true }
}

/**
 * Republica un comunicado: crea una copia con fecha de publicación actual
 * y estado activo (is_archived = false).
 */
export async function republishAnnouncementAction(
  announcementId: string
): Promise<{ success?: boolean; error?: string }> {
  const validation = RepublishAnnouncementSchema.safeParse({ id: announcementId })
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'ID inválido' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdminRole(profile.role) || !profile.school_id) {
    return { error: 'Permisos insuficientes' }
  }

  // Obtener el comunicado original
  const { data: original, error: fetchError } = await supabase
    .from('communications')
    .select('title, category, body, target_audience')
    .eq('id', announcementId)
    .eq('school_id', profile.school_id)
    .single()

  if (fetchError || !original) {
    return { error: 'Comunicado no encontrado' }
  }

  // Insertar copia con fecha actual
  const { error: insertError } = await supabase.from('communications').insert({
    school_id: profile.school_id,
    title: original.title,
    category: original.category,
    body: original.body,
    target_audience: original.target_audience || 'todos',
    is_archived: false,
    created_at: new Date().toISOString(),
  })

  if (insertError) {
    console.error('Error republicando comunicado:', insertError)
    return { error: 'Error al republicar el comunicado' }
  }

  revalidatePath('/admin/comunicados')
  revalidatePath('/representante')
  revalidatePath('/estudiante')
  return { success: true }
}

/**
 * Elimina definitivamente un comunicado.
 */
export async function deleteAnnouncementAction(
  announcementId: string
): Promise<{ success?: boolean; error?: string }> {
  const validation = DeleteAnnouncementSchema.safeParse({ id: announcementId })
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'ID inválido' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdminRole(profile.role) || !profile.school_id) {
    return { error: 'Permisos insuficientes' }
  }

  const { error: deleteError } = await supabase
    .from('communications')
    .delete()
    .eq('id', announcementId)
    .eq('school_id', profile.school_id)

  if (deleteError) {
    console.error('Error eliminando comunicado:', deleteError)
    return { error: 'Error al eliminar el comunicado' }
  }

  revalidatePath('/admin/comunicados')
  revalidatePath('/representante')
  revalidatePath('/estudiante')
  return { success: true }
}
