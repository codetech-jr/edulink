'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createStudent(formData: FormData) {
  const supabase = await createClient()

  // 1. Obtener usuario actual para seguridad multi-tenant
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('No autorizado')
  }

  // 2. Obtener school_id del perfil del administrador
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.school_id) {
    throw new Error('No se pudo determinar la institución asociada')
  }

  // 3. Extraer y validar datos del formulario
  const fullName = formData.get('full_name') as string
  const cedula = formData.get('cedula') as string
  const courseId = formData.get('course_id') as string

  if (!fullName || !cedula || !courseId) {
    throw new Error('Todos los campos son obligatorios, incluyendo la asignación de curso')
  }

  // 4. Insertar estudiante forzando el school_id obtenido del servidor
  const { error: insertError } = await supabase
    .from('students')
    .insert({
      school_id: profile.school_id,
      course_id: courseId,
      full_name: fullName,
      cedula: cedula,
      is_active: true
    })

  if (insertError) {
    console.error('Error insertando estudiante:', insertError)
    
    // Manejo de errores específicos de base de datos
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
  const supabase = await createClient()

  // 1. Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  // 2. Obtener school_id para validación extra
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) throw new Error('No autorizado')

  // 3. Eliminar estudiante
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId)
    .eq('school_id', profile.school_id)

  if (error) {
    console.error('Error eliminando estudiante:', error)
    throw new Error('Error al eliminar el estudiante')
  }

  revalidatePath('/admin/students')
}

export async function updateStudent(id: string, formData: FormData) {
  const supabase = await createClient()

  // 1. Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  // 2. Obtener school_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) throw new Error('No autorizado')

  // 3. Extraer datos
  const fullName = formData.get('full_name') as string
  const cedula = formData.get('cedula') as string
  const courseId = formData.get('course_id') as string

  // 4. Actualizar
  const { error } = await supabase
    .from('students')
    .update({
      full_name: fullName,
      cedula: cedula,
      course_id: courseId
    })
    .eq('id', id)
    .eq('school_id', profile.school_id)

  if (error) {
    console.error('Error actualizando estudiante:', error)
    throw new Error('Error al actualizar el estudiante')
  }

  // 5. Invalidar y redirigir
  revalidatePath('/admin/students')
  redirect('/admin/students')
}

