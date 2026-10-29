'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAdminRole } from '@/lib/permissions'
import {
  CreateStudentSchema,
  UpdateStudentSchema,
  DeleteStudentSchema,
} from '@/lib/schemas/student.schema'

export async function createStudent(formData: FormData) {
  // 1. Validar datos del formulario con Zod
  const rawData = Object.fromEntries(formData.entries())
  const validation = CreateStudentSchema.safeParse(rawData)

  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  const supabase = await createClient()

  // 2. Obtener usuario actual para seguridad multi-tenant
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('No autorizado')
  }

  // 3. Obtener school_id y rol del perfil del administrador
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.school_id) {
    throw new Error('No se pudo determinar la institución asociada')
  }

  if (!isAdminRole(profile.role)) {
    throw new Error('No tienes permisos suficientes para registrar estudiantes')
  }

  const {
    full_name,
    cedula,
    course_id,
    birth_date,
    gender,
    parent_id,
    relationship,
    new_parent_name,
    new_parent_cedula,
    new_parent_phone,
    secondary_guardian_name,
    secondary_guardian_phone,
    secondary_guardian_relationship,
  } = validation.data

  // 4. Resolver ID del representante (existente o nuevo)
  let effectiveParentId = parent_id || null

  if (!effectiveParentId && new_parent_name && new_parent_cedula) {
    const { createAdminClient } = await import('@/utils/supabase/admin')
    const adminClient = createAdminClient()

    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('cedula', new_parent_cedula)
      .eq('school_id', profile.school_id)
      .maybeSingle()

    if (existingProfile) {
      effectiveParentId = existingProfile.id
    } else {
      const { data: newProfile, error: createProfileError } = await adminClient
        .from('profiles')
        .insert({
          school_id: profile.school_id,
          full_name: new_parent_name,
          cedula: new_parent_cedula,
          phone: new_parent_phone || null,
          role: 'representante',
        })
        .select('id')
        .single()

      if (!createProfileError && newProfile) {
        effectiveParentId = newProfile.id
      }
    }
  }

  // 5. Insertar estudiante forzando el school_id obtenido del servidor
  const baseStudentData: Record<string, any> = {
    school_id: profile.school_id,
    course_id,
    full_name,
    cedula,
    birth_date: birth_date || null,
    gender: gender || null,
    parent_id: effectiveParentId,
    is_active: true,
  }

  const fullStudentData = {
    ...baseStudentData,
    relationship: relationship || null,
    secondary_guardian_name: secondary_guardian_name || null,
    secondary_guardian_phone: secondary_guardian_phone || null,
    secondary_guardian_relationship: secondary_guardian_relationship || null,
  }

  let { error: insertError } = await supabase.from('students').insert(fullStudentData)

  if (insertError && insertError.code === '42703') {
    const retry = await supabase.from('students').insert(baseStudentData)
    insertError = retry.error
  }

  if (insertError) {
    console.error('Error insertando estudiante:', insertError)

    if (insertError.code === '23505') {
      throw new Error('Ya existe un estudiante registrado con esa cédula')
    }
    if (insertError.code === '42501') {
      throw new Error('No tienes permisos suficientes para realizar esta operación (RLS)')
    }
    if (insertError.code === '23502') {
      throw new Error('Faltan datos obligatorios. Por favor, completa todos los campos.')
    }

    throw new Error('Error al registrar el estudiante en la base de datos')
  }

  // 5. Invalidar caché y redirigir
  revalidatePath('/admin/students')
  redirect('/admin/students')
}

export async function deleteStudent(studentId: string) {
  // 1. Validar ID con Zod
  const validation = DeleteStudentSchema.safeParse({ id: studentId })
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  const supabase = await createClient()

  // 2. Obtener usuario actual y perfil
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) throw new Error('No autorizado')

  if (!isAdminRole(profile.role)) {
    throw new Error('No tienes permisos para eliminar estudiantes')
  }

  // 3. Eliminar estudiante asegurando filtro por school_id
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', validation.data.id)
    .eq('school_id', profile.school_id)

  if (error) {
    console.error('Error eliminando estudiante:', error)
    throw new Error('Error al eliminar el estudiante')
  }

  revalidatePath('/admin/students')
}

export async function updateStudent(id: string, formData: FormData) {
  // 1. Validar ID y datos del formulario con Zod
  const rawData = { id, ...Object.fromEntries(formData.entries()) }
  const validation = UpdateStudentSchema.safeParse(rawData)

  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  const supabase = await createClient()

  // 2. Obtener usuario actual y perfil
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) throw new Error('No autorizado')

  if (!isAdminRole(profile.role)) {
    throw new Error('No tienes permisos para editar estudiantes')
  }

  const {
    full_name,
    cedula,
    course_id,
    birth_date,
    gender,
    parent_id,
    relationship,
    new_parent_name,
    new_parent_cedula,
    new_parent_phone,
    secondary_guardian_name,
    secondary_guardian_phone,
    secondary_guardian_relationship,
  } = validation.data

  let effectiveParentId = parent_id !== undefined ? (parent_id || null) : undefined

  if (!effectiveParentId && new_parent_name && new_parent_cedula) {
    const { createAdminClient } = await import('@/utils/supabase/admin')
    const adminClient = createAdminClient()

    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('cedula', new_parent_cedula)
      .eq('school_id', profile.school_id)
      .maybeSingle()

    if (existingProfile) {
      effectiveParentId = existingProfile.id
    } else {
      const { data: newProfile, error: createProfileError } = await adminClient
        .from('profiles')
        .insert({
          school_id: profile.school_id,
          full_name: new_parent_name,
          cedula: new_parent_cedula,
          phone: new_parent_phone || null,
          role: 'representante',
        })
        .select('id')
        .single()

      if (!createProfileError && newProfile) {
        effectiveParentId = newProfile.id
      }
    }
  }

  // 3. Actualizar estudiante
  const baseUpdateData: Record<string, any> = {
    full_name,
    cedula,
    course_id,
    birth_date: birth_date || null,
    gender: gender || null,
  }

  if (effectiveParentId !== undefined) {
    baseUpdateData.parent_id = effectiveParentId
  }

  const fullUpdateData = {
    ...baseUpdateData,
    relationship: relationship || null,
    secondary_guardian_name: secondary_guardian_name || null,
    secondary_guardian_phone: secondary_guardian_phone || null,
    secondary_guardian_relationship: secondary_guardian_relationship || null,
  }

  let { error } = await supabase
    .from('students')
    .update(fullUpdateData)
    .eq('id', validation.data.id)
    .eq('school_id', profile.school_id)

  if (error && error.code === '42703') {
    const retry = await supabase
      .from('students')
      .update(baseUpdateData)
      .eq('id', validation.data.id)
      .eq('school_id', profile.school_id)
    error = retry.error
  }

  if (error) {
    console.error('Error actualizando estudiante:', error)
    if (error.code === '23505') {
      throw new Error('Ya existe otro estudiante registrado con esa cédula')
    }
    throw new Error('Error al actualizar el estudiante')
  }

  // 4. Invalidar y redirigir
  revalidatePath('/admin/students')
  redirect('/admin/students')
}
