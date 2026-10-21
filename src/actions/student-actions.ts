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

  const { full_name, cedula, course_id } = validation.data

  // 4. Insertar estudiante forzando el school_id obtenido del servidor
  const { error: insertError } = await supabase.from('students').insert({
    school_id: profile.school_id,
    course_id,
    full_name,
    cedula,
    is_active: true,
  })

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

  const { full_name, cedula, course_id } = validation.data

  // 3. Actualizar estudiante
  const { error } = await supabase
    .from('students')
    .update({
      full_name,
      cedula,
      course_id,
    })
    .eq('id', validation.data.id)
    .eq('school_id', profile.school_id)

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
