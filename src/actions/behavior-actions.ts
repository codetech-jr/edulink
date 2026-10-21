'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  createBehaviorRecordSchema,
  CreateBehaviorRecordInput,
  acknowledgeBehaviorRecordSchema,
} from '@/lib/schemas/behavior.schema'

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Registra una novedad o mérito conductual para un estudiante.
 * Solo docentes, coordinadores o administradores del mismo colegio pueden crear registros.
 */
export async function createBehaviorRecordAction(
  rawInput: CreateBehaviorRecordInput
): Promise<ActionResponse> {
  const validation = createBehaviorRecordSchema.safeParse(rawInput)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Datos de novedad inválidos',
    }
  }

  try {
    const supabase = await createClient()

    // 1. Validar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'No autorizado. Inicia sesión nuevamente.' }
    }

    // 2. Validar rol del creador
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, school_id, full_name')
      .eq('id', user.id)
      .single()

    const allowedRoles = ['admin', 'coordinador', 'docente']
    if (profileError || !profile || !allowedRoles.includes(profile.role)) {
      return {
        success: false,
        error: 'No tienes permisos suficientes para registrar notas de conducta.',
      }
    }

    const {
      student_id,
      type,
      title,
      description,
      incident_date,
      requires_parent_signature,
    } = validation.data

    // 3. Validar que el estudiante pertenezca al mismo colegio
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, school_id, full_name')
      .eq('id', student_id)
      .single()

    if (studentError || !student) {
      return { success: false, error: 'Estudiante no encontrado en el sistema.' }
    }

    if (profile.school_id && student.school_id !== profile.school_id) {
      return {
        success: false,
        error: 'No puedes registrar incidencias para estudiantes de otra institución.',
      }
    }

    // 4. Insertar registro
    const { data: record, error: insertError } = await supabase
      .from('student_behavior_records')
      .insert({
        school_id: student.school_id,
        student_id,
        created_by: user.id,
        type,
        title,
        description,
        incident_date,
        requires_parent_signature,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error insertando student_behavior_records:', insertError)
      return {
        success: false,
        error: 'Error al guardar la novedad en la base de datos.',
      }
    }

    revalidatePath('/representante')
    revalidatePath('/docente')
    revalidatePath('/docente/conducta')
    revalidatePath('/admin/students')

    return {
      success: true,
      data: record,
    }
  } catch (err: unknown) {
    console.error('Excepción en createBehaviorRecordAction:', err)
    return {
      success: false,
      error: (err as Error)?.message || 'Error inesperado al crear la novedad conductual.',
    }
  }
}

/**
 * Permite al representante marcar una novedad como "Enterado / Notificado".
 * Valida estrictamente que el usuario sea el representante del estudiante.
 */
export async function acknowledgeBehaviorRecordAction(
  recordId: string
): Promise<ActionResponse> {
  const validation = acknowledgeBehaviorRecordSchema.safeParse({ record_id: recordId })
  if (!validation.success) {
    return { success: false, error: 'Identificador de registro no válido.' }
  }

  try {
    const supabase = await createClient()

    // 1. Validar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'No autorizado. Inicia sesión.' }
    }

    // 2. Verificar rol 'representante'
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'representante') {
      return {
        success: false,
        error: 'Solo los representantes pueden firmar la notificación de novedades.',
      }
    }

    // 3. Buscar el registro y comprobar parentesco
    const { data: record, error: recordError } = await supabase
      .from('student_behavior_records')
      .select(`
        id,
        student_id,
        students!inner (
          parent_id
        )
      `)
      .eq('id', recordId)
      .single()

    if (recordError || !record) {
      return { success: false, error: 'Registro de novedad no encontrado.' }
    }

    const studentData = record.students as any
    if (studentData?.parent_id !== user.id) {
      return {
        success: false,
        error: 'No tienes autorización sobre el estudiante asignado a este reporte.',
      }
    }

    // 4. Actualizar firma digital de enterado
    const { error: updateError } = await supabase
      .from('student_behavior_records')
      .update({
        parent_acknowledged_at: new Date().toISOString(),
        parent_acknowledged_by: user.id,
      })
      .eq('id', recordId)

    if (updateError) {
      console.error('Error al actualizar parent_acknowledged_at:', updateError)
      return { success: false, error: 'No se pudo registrar la confirmación.' }
    }

    revalidatePath('/representante')

    return { success: true }
  } catch (err: unknown) {
    console.error('Excepción en acknowledgeBehaviorRecordAction:', err)
    return {
      success: false,
      error: (err as Error)?.message || 'Error inesperado al firmar enterado.',
    }
  }
}

/**
 * Elimina un registro de conducta. Solo el autor del reporte o un administrador pueden borrarlo.
 */
export async function deleteBehaviorRecordAction(
  recordId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'No autorizado.' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Perfil no encontrado.' }
    }

    const { data: record, error: fetchError } = await supabase
      .from('student_behavior_records')
      .select('id, created_by, school_id')
      .eq('id', recordId)
      .single()

    if (fetchError || !record) {
      return { success: false, error: 'Registro no encontrado.' }
    }

    const isAdmin = profile.role === 'admin' || profile.role === 'coordinador'
    const isOwner = record.created_by === user.id

    if (!isAdmin && !isOwner) {
      return {
        success: false,
        error: 'No tienes permisos para eliminar este reporte.',
      }
    }

    const { error: deleteError } = await supabase
      .from('student_behavior_records')
      .delete()
      .eq('id', recordId)

    if (deleteError) {
      console.error('Error eliminando registro:', deleteError)
      return { success: false, error: 'Error al eliminar el registro.' }
    }

    revalidatePath('/representante')
    revalidatePath('/docente/conducta')
    revalidatePath('/docente')

    return { success: true }
  } catch (err: unknown) {
    console.error('Excepción en deleteBehaviorRecordAction:', err)
    return {
      success: false,
      error: (err as Error)?.message || 'Error inesperado al eliminar el registro.',
    }
  }
}
