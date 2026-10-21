'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAdminRole } from '@/lib/permissions'
import {
  CreateCourseSchema,
  UpdateCourseSchema,
  DeleteCourseSchema,
} from '@/lib/schemas/course.schema'

export async function createCourse(formData: FormData) {
  // 1. Validar datos del formulario con Zod
  const rawData = Object.fromEntries(formData.entries())
  const validation = CreateCourseSchema.safeParse(rawData)

  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  const supabase = await createClient()

  // 2. Verificar sesión
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('No autorizado')

  // 3. Obtener school_id y rol del admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) throw new Error('No se encontró institución asociada')

  if (!isAdminRole(profile.role)) {
    throw new Error('No tienes permisos para crear cursos')
  }

  // 4. Obtener el año escolar activo
  const { data: activeYear, error: yearError } = await supabase
    .from('school_years')
    .select('id')
    .eq('school_id', profile.school_id)
    .eq('is_active', true)
    .single()

  if (yearError || !activeYear?.id) {
    console.error('Error obteniendo año activo:', yearError)
    throw new Error('No hay un año escolar activo. Debes crear uno antes de registrar cursos.')
  }

  const { name, grade_level, section } = validation.data

  // 5. Insertar curso con school_year_id y school_id del servidor
  const { error: insertError } = await supabase.from('courses').insert({
    school_id: profile.school_id,
    school_year_id: activeYear.id,
    name,
    grade_level,
    section,
  })

  if (insertError) {
    console.error('Error insertando curso:', insertError)

    if (insertError.code === '42501') {
      throw new Error('No tienes permisos suficientes para crear cursos (RLS)')
    }
    if (insertError.code === '23502') {
      throw new Error('Faltan datos obligatorios. Verifica el año escolar y los campos del formulario.')
    }
    if (insertError.code === '23514') {
      throw new Error('El grado debe estar entre 1 y 6 (Restricción de base de datos)')
    }

    throw new Error('Error al crear el curso en la base de datos')
  }

  // 6. Redirigir
  revalidatePath('/admin/courses')
  revalidatePath('/admin/students/new')
  redirect('/admin/courses')
}

export async function deleteCourse(courseId: string) {
  // 1. Validar ID con Zod
  const validation = DeleteCourseSchema.safeParse({ id: courseId })
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  const supabase = await createClient()

  // 2. Verificar sesión y perfil
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
    throw new Error('No tienes permisos para eliminar cursos')
  }

  // 3. Eliminar curso
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', validation.data.id)
    .eq('school_id', profile.school_id)

  if (error) {
    console.error('Error eliminando curso:', error)

    if (error.code === '23503') {
      throw new Error('No se puede eliminar el curso porque tiene estudiantes inscritos.')
    }

    throw new Error('Error al eliminar el curso')
  }

  revalidatePath('/admin/courses')
}

export async function updateCourse(id: string, formData: FormData) {
  // 1. Validar ID y datos del formulario con Zod
  const rawData = { id, ...Object.fromEntries(formData.entries()) }
  const validation = UpdateCourseSchema.safeParse(rawData)

  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  const supabase = await createClient()

  // 2. Verificar sesión y perfil
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
    throw new Error('No tienes permisos para editar cursos')
  }

  const { name, grade_level, section } = validation.data

  // 3. Actualizar curso
  const { error } = await supabase
    .from('courses')
    .update({
      name,
      grade_level,
      section,
    })
    .eq('id', validation.data.id)
    .eq('school_id', profile.school_id)

  if (error) {
    console.error('Error actualizando curso:', error)
    throw new Error('Error al actualizar el curso')
  }

  // 4. Redirigir
  revalidatePath('/admin/courses')
  redirect('/admin/courses')
}
