'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type AttendanceRecordInput = {
  student_id: string
  subject_id: string
  status: 'presente' | 'ausente' | 'tarde' | 'justificado'
  notes?: string
}

export type AttendanceResult = {
  success: boolean
  error?: string
}

export async function saveDailyAttendanceAction(
  date: string,
  records: AttendanceRecordInput[]
): Promise<AttendanceResult> {
  // 1. Validaciones iniciales
  if (!date) {
    return { success: false, error: 'La fecha es obligatoria.' }
  }
  if (!records || records.length === 0) {
    return { success: false, error: 'No se recibieron registros de asistencia.' }
  }

  try {
    const supabase = await createClient()

    // 2. Obtener usuario logueado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
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

    // 4. Prevenir duplicados del mismo salón/materia en el mismo día
    // Obtenemos los subject_ids únicos de los registros enviados
    const subjectIds = Array.from(new Set(records.map((r) => r.subject_id)))

    if (subjectIds.length === 0) {
      return { success: false, error: 'Datos de asignatura no válidos.' }
    }

    // Consultamos si ya existe asistencia en la tabla para esta asignatura y fecha
    const { data: existingRecords, error: checkError } = await supabase
      .from('attendance')
      .select('subject_id')
      .eq('attendance_date', date)
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
    const rowsToInsert = records.map((record) => ({
      school_id: schoolId,
      student_id: record.student_id,
      subject_id: record.subject_id,
      teacher_id: user.id,
      attendance_date: date,
      status: record.status,
      notes: record.notes || null,
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
  } catch (err: any) {
    console.error('Excepción en saveDailyAttendanceAction:', err)
    return { success: false, error: 'Error interno de servidor al guardar la asistencia.' }
  }
}

export type EvaluationPlanInput = {
  name: string
  weight: number
  evaluation_date?: string
}

export async function saveEvaluationPlanAction(
  subjectId: string,
  termId: string,
  evaluations: EvaluationPlanInput[]
): Promise<{ success: boolean; error?: string }> {
  if (!subjectId || !termId) {
    return { success: false, error: 'Asignatura y lapso son obligatorios.' }
  }
  if (!evaluations || evaluations.length === 0) {
    return { success: false, error: 'Debe ingresar al menos una evaluación.' }
  }

  // 1. Validar sumatoria de ponderaciones en el servidor
  const totalWeight = evaluations.reduce((sum, ev) => sum + Number(ev.weight), 0)
  if (totalWeight !== 100) {
    return { success: false, error: `La sumatoria de ponderaciones debe ser exactamente 100%. Suma actual: ${totalWeight}%` }
  }

  // 2. Validar nombres de evaluaciones
  for (const ev of evaluations) {
    if (!ev.name || ev.name.trim().length < 2) {
      return { success: false, error: 'El nombre de cada evaluación debe tener al menos 2 caracteres.' }
    }
    if (ev.weight <= 0 || ev.weight > 100) {
      return { success: false, error: 'La ponderación de cada evaluación debe ser mayor a 0 y menor o igual a 100.' }
    }
  }

  try {
    const supabase = await createClient()

    // 3. Obtener usuario logueado y verificar rol
    const { data: { user }, error: authError } = await supabase.auth.getUser()
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

    // 4. Validar que la asignatura pertenezca al docente
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', subjectId)
      .eq('teacher_id', user.id)
      .single()

    if (subjectError || !subject) {
      return { success: false, error: 'La asignatura especificada no le pertenece o no existe.' }
    }

    // 5. Eliminar evaluaciones existentes para este lapso y asignatura (se cascadean las notas)
    const { error: deleteError } = await supabase
      .from('evaluations')
      .delete()
      .eq('subject_id', subjectId)
      .eq('term_id', termId)

    if (deleteError) {
      console.error('Error eliminando evaluaciones previas:', deleteError)
      return { success: false, error: 'Error al limpiar el plan de evaluación anterior.' }
    }

    // 6. Insertar las nuevas evaluaciones
    const rowsToInsert = evaluations.map((ev) => ({
      school_id: schoolId,
      subject_id: subjectId,
      term_id: termId,
      name: ev.name.trim(),
      weight: ev.weight,
      evaluation_date: ev.evaluation_date || null,
      is_published: false
    }))

    const { error: insertError } = await supabase
      .from('evaluations')
      .insert(rowsToInsert)

    if (insertError) {
      console.error('Error insertando nuevo plan de evaluación:', insertError)
      return { success: false, error: 'Error al guardar el nuevo plan de evaluación.' }
    }

    revalidatePath('/docente/calificaciones')
    revalidatePath('/representante')
    revalidatePath('/estudiante')
    return { success: true }
  } catch (err: any) {
    console.error('Excepción en saveEvaluationPlanAction:', err)
    return { success: false, error: 'Error interno del servidor al guardar el plan.' }
  }
}

export type GradeRecordInput = {
  student_id: string
  evaluation_id: string
  score: number | null
  is_absent: boolean
  notes?: string
}

export async function saveGradesAction(
  grades: GradeRecordInput[]
): Promise<{ success: boolean; error?: string }> {
  if (!grades || grades.length === 0) {
    return { success: false, error: 'No se recibieron calificaciones para guardar.' }
  }

  // 1. Validar escala de notas venezolana (1-20)
  for (const g of grades) {
    if (!g.is_absent && g.score !== null) {
      if (g.score < 1 || g.score > 20) {
        return { success: false, error: 'Todas las notas deben estar en el rango de 1 a 20 (escala venezolana).' }
      }
    }
  }

  try {
    const supabase = await createClient()

    // 2. Validar sesión y rol de docente
    const { data: { user }, error: authError } = await supabase.auth.getUser()
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
    const rowsToUpsert = grades.map((g) => ({
      school_id: schoolId,
      student_id: g.student_id,
      evaluation_id: g.evaluation_id,
      teacher_id: user.id,
      score: g.is_absent ? null : g.score,
      is_absent: g.is_absent,
      notes: g.notes || null,
      updated_at: new Date().toISOString()
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
  } catch (err: any) {
    console.error('Excepción en saveGradesAction:', err)
    return { success: false, error: 'Error interno del servidor al guardar calificaciones.' }
  }
}

export async function publishGradesAction(
  subjectId: string,
  termId: string,
  publish: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!subjectId || !termId) {
    return { success: false, error: 'Asignatura y lapso son obligatorios.' }
  }

  try {
    const supabase = await createClient()

    // 1. Validar sesión y rol de docente
    const { data: { user }, error: authError } = await supabase.auth.getUser()
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

    // 2. Validar que la asignatura sea del docente
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', subjectId)
      .eq('teacher_id', user.id)
      .single()

    if (subjectError || !subject) {
      return { success: false, error: 'La asignatura especificada no le pertenece o no existe.' }
    }

    // 3. Actualizar el estado de publicación en todas las evaluaciones del lapso
    const { error: updateError } = await supabase
      .from('evaluations')
      .update({ is_published: publish })
      .eq('subject_id', subjectId)
      .eq('term_id', termId)

    if (updateError) {
      console.error('Error al actualizar publicación de evaluaciones:', updateError)
      return { success: false, error: 'Error al cambiar el estado de publicación de las notas.' }
    }

    revalidatePath('/docente/calificaciones')
    revalidatePath('/representante')
    revalidatePath('/estudiante')
    return { success: true }
  } catch (err: any) {
    console.error('Excepción en publishGradesAction:', err)
    return { success: false, error: 'Error interno del servidor al publicar calificaciones.' }
  }
}

export async function resetEvaluationPlanAction(
  subjectId: string,
  termId: string
): Promise<{ success: boolean; error?: string }> {
  if (!subjectId || !termId) {
    return { success: false, error: 'Asignatura y lapso son obligatorios.' }
  }

  try {
    const supabase = await createClient()

    // 1. Validar sesión y rol de docente
    const { data: { user }, error: authError } = await supabase.auth.getUser()
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

    // 2. Validar que la asignatura sea del docente
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', subjectId)
      .eq('teacher_id', user.id)
      .single()

    if (subjectError || !subject) {
      return { success: false, error: 'La asignatura especificada no le pertenece o no existe.' }
    }

    // 3. Eliminar evaluaciones (lo que cascadea notas)
    const { error: deleteError } = await supabase
      .from('evaluations')
      .delete()
      .eq('subject_id', subjectId)
      .eq('term_id', termId)

    if (deleteError) {
      console.error('Error al resetear plan de evaluación:', deleteError)
      return { success: false, error: 'Error al restablecer el plan de evaluación.' }
    }

    revalidatePath('/docente/calificaciones')
    revalidatePath('/representante')
    revalidatePath('/estudiante')
    return { success: true }
  } catch (err: any) {
    console.error('Excepción en resetEvaluationPlanAction:', err)
    return { success: false, error: 'Error interno del servidor al reconfigurar plan.' }
  }
}
