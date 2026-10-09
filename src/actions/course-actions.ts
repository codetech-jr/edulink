'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCourse(formData: FormData) {
  const supabase = await createClient()

  // 1. Verificar sesión
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('No autorizado')

  // 2. Obtener school_id del admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) throw new Error('No se encontró institución asociada')

  // 3. Obtener el año escolar activo
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

  console.log('Insertando curso para año escolar:', activeYear.id)

  // 4. Extraer datos del formulario
  const name = formData.get('name') as string
  const gradeLevel = parseInt(formData.get('grade_level') as string)
  const section = formData.get('section') as string

  if (!name || isNaN(gradeLevel) || !section) {
    throw new Error('Todos los campos son obligatorios')
  }

  if (gradeLevel < 1 || gradeLevel > 6) {
    throw new Error('El grado debe estar entre 1 y 6')
  }

  // 5. Insertar curso con school_year_id
  const { error: insertError } = await supabase
    .from('courses')
    .insert({
      school_id: profile.school_id,
      school_year_id: activeYear.id,
      name,
      grade_level: gradeLevel,
      section: section.toUpperCase()
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

  // 5. Redirigir
  revalidatePath('/admin/courses')
  revalidatePath('/admin/students/new') // Para que el select se actualice
  redirect('/admin/courses')
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient()

  // 1. Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  // 2. Obtener school_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) throw new Error('No autorizado')

  // 3. Eliminar curso
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)
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
  const supabase = await createClient()

  // 1. Verificar sesión
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
  const name = formData.get('name') as string
  const gradeLevel = parseInt(formData.get('grade_level') as string)
  const section = formData.get('section') as string

  if (!name || isNaN(gradeLevel) || !section) {
    throw new Error('Todos los campos son obligatorios')
  }

  // 4. Actualizar
  const { error } = await supabase
    .from('courses')
    .update({
      name,
      grade_level: gradeLevel,
      section: section.toUpperCase()
    })
    .eq('id', id)
    .eq('school_id', profile.school_id)

  if (error) {
    console.error('Error actualizando curso:', error)
    throw new Error('Error al actualizar el curso')
  }

  // 5. Invalidar y redirigir
  revalidatePath('/admin/courses')
  redirect('/admin/courses')
}
