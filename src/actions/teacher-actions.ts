'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  DailyAttendanceSchema,
  EvaluationPlanSchema,
  SaveGradesSchema,
  PublishGradesSchema,
  ResetEvaluationPlanSchema,
  type AttendanceRecordInput,
  type EvaluationPlanItemInput,
  type GradeRecordInput,
} from '@/lib/schemas/teacher.schema'

export type { AttendanceRecordInput, EvaluationPlanItemInput, GradeRecordInput }

export type AttendanceResult = {
  success: boolean
  error?: string
}

export async function saveDailyAttendanceAction(
  date: string,
  records: AttendanceRecordInput[]
): Promise<AttendanceResult> {
  // 1. Validar parámetros con Zod
  const validation = DailyAttendanceSchema.safeParse({ date, records })
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  try {
    const supabase = await createClient()

    // 2. Obtener usuario logueado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Sesión no iniciada o no autorizada.' }
    }

    // 3. Verificar rol de docente y obtener school_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error al obtener perfil:', profileError)
      return { success: false, error: 'No se encontró el perfil del usuario.' }
    }

    if (profile.role !== 'docente') {
      return { success: false, error: 'Acceso no autorizado: Solo los docentes pueden registrar asistencia.' }
    }

    const schoolId = profile.school_id
    if (!schoolId) {
      return { success: false, error: 'El docente no está asociado a ninguna institución (school_id).' }
    }

    const validatedData = validation.data

    // 4. Prevenir duplicados del mismo salón/materia en el mismo día
    const subjectIds = Array.from(new Set(validatedData.records.map((r) => r.subject_id)))

    const { data: existingRecords, error: checkError } = await supabase
      .from('attendance')
      .select('subject_id')
      .eq('attendance_date', validatedData.date)
      .in('subject_id', subjectIds)
      .limit(1)

    if (checkError) {
      console.error('Error al verificar asistencia existente:', checkError)
      return { success: false, error: 'Error al verificar registros previos de asistencia.' }
    }

    if (existingRecords && existingRecords.length > 0) {
      return {
        success: false,
        error: 'Ya se ha registrado el pase de lista para este salón hoy. No se permiten registros duplicados.',
      }
    }

    // 5. Inserción masiva (bulk insert)
    const rowsToInsert = validatedData.records.map((record) => ({
      school_id: schoolId,
      student_id: record.student_id,
      subject_id: record.subject_id,
      teacher_id: user.id,
      attendance_date: validatedData.date,
      status: record.status,
      notes: record.notes,
    }))

    const { error: insertError } = await supabase
      .from('attendance')
      .insert(rowsToInsert)

    if (insertError) {
      console.error('Error insertando asistencia masiva:', insertError)
      if (insertError.code === '23505') {
        return {
          success: false,
          error: 'Ya existe un registro de asistencia para este estudiante y asignatura hoy.',
        }
      }
      return { success: false, error: `Error al guardar asistencia: ${insertError.message}` }
    }

    // 6. Revalidar la vista del docente
    revalidatePath('/docente')

    return { success: true }
  } catch (err: any /* TODO: tipado pendiente */) {
    console.error('Excepción en saveDailyAttendanceAction:', err)
    return { success: false, error: 'Error interno de servidor al guardar la asistencia.' }
  }
}

export async function saveEvaluationPlanAction(
  subjectId: string,
  termId: string,
  evaluations: EvaluationPlanItemInput[]
): Promise<{ success: boolean; error?: string }> {
  // 1. Validar parámetros con Zod (incluye chequeo de 100% de ponderación)
  const validation = EvaluationPlanSchema.safeParse({
    subject_id: subjectId,
    term_id: termId,
    evaluations,
  })

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  try {
    const supabase = await createClient()

    // 2. Obtener usuario logueado y verificar rol
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Sesión no iniciada o no autorizada.' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'docente') {
      return { success: false, error: 'Acceso denegado: solo docentes pueden configurar el plan.' }
    }

    const schoolId = profile.school_id
    const validatedData = validation.data

    // 3. Validar que la asignatura pertenezca al docente
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', validatedData.subject_id)
      .eq('teacher_id', user.id)
      .single()

    if (subjectError || !subject) {
      return { success: false, error: 'La asignatura especificada no le pertenece o no existe.' }
    }

    // 4. Eliminar evaluaciones existentes para este lapso y asignatura (se cascadean las notas)
    const { error: deleteError } = await supabase
      .from('evaluations')
      .delete()
      .eq('subject_id', validatedData.subject_id)
      .eq('term_id', validatedData.term_id)

    if (deleteError) {
      console.error('Error eliminando evaluaciones previas:', deleteError)
      return { success: false, error: 'Error al limpiar el plan de evaluación anterior.' }
    }

    // 5. Insertar las nuevas evaluaciones
    const rowsToInsert = validatedData.evaluations.map((ev) => ({
      school_id: schoolId,
      subject_id: validatedData.subject_id,
      term_id: validatedData.term_id,
      name: ev.name,
      weight: ev.weight,
      evaluation_date: ev.evaluation_date,
      is_published: false,
    }))

    const { error: insertError } = await supabase.from('evaluations').insert(rowsToInsert)

    if (insertError) {
      console.error('Error insertando nuevo plan de evaluación:', insertError)
      return { success: false, error: 'Error al guardar el nuevo plan de evaluación.' }
    }

    revalidatePath('/docente/calificaciones')
    revalidatePath('/representante')
    revalidatePath('/estudiante')
    return { success: true }
  } catch (err: any /* TODO: tipado pendiente */) {
    console.error('Excepción en saveEvaluationPlanAction:', err)
    return { success: false, error: 'Error interno del servidor al guardar el plan.' }
  }
}

export async function saveGradesAction(
  grades: GradeRecordInput[]
): Promise<{ success: boolean; error?: string }> {
  // 1. Validar calificaciones con Zod (incluye escala 1-20 y condición de ausencia)
  const validation = SaveGradesSchema.safeParse({ grades })
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  try {
    const supabase = await createClient()

    // 2. Validar sesión y rol de docente
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Sesión no iniciada o no autorizada.' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'docente') {
      return { success: false, error: 'Acceso denegado: solo docentes pueden guardar calificaciones.' }
    }

    const schoolId = profile.school_id

    // 3. Preparar filas para upsert masivo
    const rowsToUpsert = validation.data.grades.map((g) => ({
      school_id: schoolId,
      student_id: g.student_id,
      evaluation_id: g.evaluation_id,
      teacher_id: user.id,
      score: g.is_absent ? null : g.score,
      is_absent: g.is_absent,
      notes: g.notes,
      updated_at: new Date().toISOString(),
    }))

    // 4. Ejecutar upsert en Supabase con conflicto en (evaluation_id, student_id)
    const { error: upsertError } = await supabase
      .from('grades')
      .upsert(rowsToUpsert, { onConflict: 'evaluation_id,student_id' })

    if (upsertError) {
      console.error('Error en upsert masivo de calificaciones:', upsertError)
      return { success: false, error: `Error al guardar notas: ${upsertError.message}` }
    }

    revalidatePath('/docente/calificaciones')
    revalidatePath('/representante')
    revalidatePath('/estudiante')
    return { success: true }
  } catch (err: any /* TODO: tipado pendiente */) {
    console.error('Excepción en saveGradesAction:', err)
    return { success: false, error: 'Error interno del servidor al guardar calificaciones.' }
  }
}

export async function publishGradesAction(
  subjectId: string,
  termId: string,
  publish: boolean
): Promise<{ success: boolean; error?: string }> {
  // 1. Validar parámetros con Zod
  const validation = PublishGradesSchema.safeParse({
    subject_id: subjectId,
    term_id: termId,
    publish,
  })

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  try {
    const supabase = await createClient()

    // 2. Validar sesión y rol de docente
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Sesión no iniciada o no autorizada.' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'docente') {
      return { success: false, error: 'Acceso denegado: solo docentes pueden publicar calificaciones.' }
    }

    const validatedData = validation.data

    // 3. Validar que la asignatura sea del docente
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', validatedData.subject_id)
      .eq('teacher_id', user.id)
      .single()

    if (subjectError || !subject) {
      return { success: false, error: 'La asignatura especificada no le pertenece o no existe.' }
    }

    // 4. Actualizar el estado de publicación en todas las evaluaciones del lapso
    const { error: updateError } = await supabase
      .from('evaluations')
      .update({ is_published: validatedData.publish })
      .eq('subject_id', validatedData.subject_id)
      .eq('term_id', validatedData.term_id)

    if (updateError) {
      console.error('Error al actualizar publicación de evaluaciones:', updateError)
      return { success: false, error: 'Error al cambiar el estado de publicación de las notas.' }
    }

    revalidatePath('/docente/calificaciones')
    revalidatePath('/representante')
    revalidatePath('/estudiante')
    return { success: true }
  } catch (err: any /* TODO: tipado pendiente */) {
    console.error('Excepción en publishGradesAction:', err)
    return { success: false, error: 'Error interno del servidor al publicar calificaciones.' }
  }
}

export async function resetEvaluationPlanAction(
  subjectId: string,
  termId: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Validar parámetros con Zod
  const validation = ResetEvaluationPlanSchema.safeParse({
    subject_id: subjectId,
    term_id: termId,
  })

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  try {
    const supabase = await createClient()

    // 2. Validar sesión y rol de docente
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Sesión no iniciada o no autorizada.' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'docente') {
      return { success: false, error: 'Acceso denegado: solo docentes pueden reconfigurar planes.' }
    }

    const validatedData = validation.data

    // 3. Validar que la asignatura sea del docente
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', validatedData.subject_id)
      .eq('teacher_id', user.id)
      .single()

    if (subjectError || !subject) {
      return { success: false, error: 'La asignatura especificada no le pertenece o no existe.' }
    }

    // 4. Eliminar evaluaciones (lo que cascadea notas)
    const { error: deleteError } = await supabase
      .from('evaluations')
      .delete()
      .eq('subject_id', validatedData.subject_id)
      .eq('term_id', validatedData.term_id)

    if (deleteError) {
      console.error('Error al resetear plan de evaluación:', deleteError)
      return { success: false, error: 'Error al restablecer el plan de evaluación.' }
    }

    revalidatePath('/docente/calificaciones')
    revalidatePath('/representante')
    revalidatePath('/estudiante')
    return { success: true }
  } catch (err: any /* TODO: tipado pendiente */) {
    console.error('Excepción en resetEvaluationPlanAction:', err)
    return { success: false, error: 'Error interno del servidor al reconfigurar plan.' }
  }
}
