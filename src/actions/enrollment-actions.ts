'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { isAdminRole } from '@/lib/permissions'
import {
  CreateEnrollmentRequestSchema,
  ApproveEnrollmentSchema,
  RejectEnrollmentSchema,
} from '@/lib/schemas/enrollment.schema'

export interface EnrollmentActionResult {
  success?: boolean
  error?: string
  requestId?: string
  studentName?: string
  schoolName?: string
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

/**
 * Crea una solicitud de inscripción escolar desde el formulario público.
 * Resuelve el school_id en el servidor mediante el slug para evitar manipulación.
 */
export async function createEnrollmentRequestAction(
  formData: FormData
): Promise<EnrollmentActionResult> {
  // 1. Extraer y validar los campos textuales con Zod
  const rawData = {
    school_slug: formData.get('school_slug'),
    student_name: formData.get('student_name'),
    student_cedula: formData.get('student_cedula') || '',
    student_birth_date: formData.get('student_birth_date') || '',
    grade_requested: formData.get('grade_requested'),
    parent_name: formData.get('parent_name'),
    parent_cedula: formData.get('parent_cedula'),
    parent_phone: formData.get('parent_phone'),
    parent_email: formData.get('parent_email') || '',
    notes: formData.get('notes') || '',
  }

  const validation = CreateEnrollmentRequestSchema.safeParse(rawData)
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'Datos del formulario inválidos' }
  }

  const adminClient = createAdminClient()

  // 2. Resolver school_id a partir del slug en el servidor
  const { data: school, error: schoolError } = await adminClient
    .from('schools')
    .select('id, name')
    .eq('slug', validation.data.school_slug)
    .maybeSingle()

  if (schoolError || !school) {
    console.error('Error buscando colegio por slug:', schoolError)
    return { error: 'El colegio especificado no se encuentra registrado en el sistema.' }
  }

  // 3. Procesar documentos adjuntos (hasta 3 archivos)
  const documentsList: Array<{
    name: string
    path: string
    size: number
    type: string
    uploaded_at: string
  }> = []

  const uploadedFiles = formData.getAll('documents') as File[]

  // Filtrar entradas vacías de inputs de archivo
  const validFiles = uploadedFiles.filter(
    (file) => file && typeof file.size === 'number' && file.size > 0 && file.name
  )

  if (validFiles.length > 3) {
    return { error: 'Solo se permite adjuntar un máximo de 3 documentos.' }
  }

  // Subir archivos a Supabase Storage de forma segura
  for (const file of validFiles) {
    if (file.size > MAX_FILE_SIZE) {
      return {
        error: `El archivo "${file.name}" supera el tamaño máximo permitido de 5 MB.`,
      }
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return {
        error: `El archivo "${file.name}" tiene un formato no admitido. Usa PDF, JPG o PNG.`,
      }
    }

    // Normalizar nombre de archivo seguro
    const fileExt = file.name.split('.').pop() || 'bin'
    const safeBaseName = file.name
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30)
    const uniquePath = `${school.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}_${safeBaseName}.${fileExt}`

    try {
      const fileBuffer = Buffer.from(await file.arrayBuffer())
      const { error: uploadError } = await adminClient.storage
        .from('enrollment-documents')
        .upload(uniquePath, fileBuffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Error subiendo archivo a Supabase Storage:', uploadError)
        // Si el bucket no existe en este entorno, intentamos crearlo
        if (uploadError.message?.includes('not found') || (uploadError as any /* TODO: tipado pendiente */).statusCode === '404') {
          await adminClient.storage.createBucket('enrollment-documents', {
            public: false,
            fileSizeLimit: 5242880,
          })
          // Reintentar subida
          await adminClient.storage
            .from('enrollment-documents')
            .upload(uniquePath, fileBuffer, {
              contentType: file.type,
              upsert: false,
            })
        }
      }

      documentsList.push({
        name: file.name,
        path: uniquePath,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString(),
      })
    } catch (err: any /* TODO: tipado pendiente */) {
      console.error('Fallo procesando documento adjunto:', err)
      return { error: `Error al procesar el archivo "${file.name}". Intenta nuevamente.` }
    }
  }

  // 4. Insertar la solicitud en enrollment_requests
  const { data: requestRecord, error: insertError } = await adminClient
    .from('enrollment_requests')
    .insert({
      school_id: school.id,
      student_name: validation.data.student_name,
      student_cedula: validation.data.student_cedula || null,
      student_birth_date: validation.data.student_birth_date || null,
      grade_requested: validation.data.grade_requested,
      parent_name: validation.data.parent_name,
      parent_cedula: validation.data.parent_cedula,
      parent_phone: validation.data.parent_phone,
      parent_email: validation.data.parent_email || null,
      notes: validation.data.notes || null,
      status: 'pendiente',
      documents: documentsList,
    })
    .select('id')
    .single()

  if (insertError || !requestRecord) {
    console.error('Error al insertar solicitud de inscripción:', insertError)
    return { error: 'Ocurrió un error al registrar tu solicitud. Por favor intenta de nuevo.' }
  }

  revalidatePath('/admin/inscripciones')

  return {
    success: true,
    requestId: requestRecord.id,
    studentName: validation.data.student_name,
    schoolName: school.name,
  }
}

/**
 * Aprueba una solicitud de inscripción:
 * Crea automáticamente el registro en la tabla students y actualiza el estado a 'aprobado'.
 * Requiere rol administrativo ('admin' o 'coordinador').
 */
export async function approveEnrollmentRequestAction(
  requestId: string,
  courseId?: string
): Promise<{ success?: boolean; error?: string }> {
  const validation = ApproveEnrollmentSchema.safeParse({
    request_id: requestId,
    course_id: courseId || '',
  })

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'Datos de aprobación inválidos' }
  }

  const supabase = await createClient()

  // 1. Validar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado. Debes iniciar sesión.' }
  }

  // 2. Validar rol y school_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdminRole(profile.role) || !profile.school_id) {
    return { error: 'No tienes permisos suficientes para aprobar inscripciones.' }
  }

  const adminClient = createAdminClient()

  // 3. Obtener la solicitud
  const { data: requestData, error: reqError } = await adminClient
    .from('enrollment_requests')
    .select('*')
    .eq('id', requestId)
    .eq('school_id', profile.school_id)
    .single()

  if (reqError || !requestData) {
    return { error: 'La solicitud de inscripción no fue encontrada.' }
  }

  if (requestData.status === 'aprobado') {
    return { error: 'Esta solicitud ya fue aprobada previamente.' }
  }

  // 4. Crear el estudiante en la tabla students
  const targetCourseId = courseId && courseId.trim() !== '' ? courseId : null

  const { error: studentInsertError } = await adminClient.from('students').insert({
    school_id: profile.school_id,
    course_id: targetCourseId,
    full_name: requestData.student_name,
    cedula: requestData.student_cedula || null,
    is_active: true,
  })

  if (studentInsertError) {
    console.error('Error creando estudiante desde solicitud:', studentInsertError)
    if (studentInsertError.code === '23505') {
      return { error: 'Ya existe un estudiante registrado con esa misma cédula.' }
    }
    return { error: 'Error al registrar el estudiante en el alumnado.' }
  }

  // 5. Marcar la solicitud como aprobada
  const { error: updateError } = await adminClient
    .from('enrollment_requests')
    .update({
      status: 'aprobado',
      rejection_reason: null,
    })
    .eq('id', requestId)
    .eq('school_id', profile.school_id)

  if (updateError) {
    console.error('Error actualizando estado de solicitud:', updateError)
    return { error: 'Estudiante creado, pero no se pudo actualizar el estado de la solicitud.' }
  }

  revalidatePath('/admin/inscripciones')
  revalidatePath('/admin/students')
  revalidatePath('/admin')

  return { success: true }
}

/**
 * Rechaza una solicitud de inscripción con un motivo explícito.
 * Requiere rol administrativo ('admin' o 'coordinador').
 */
export async function rejectEnrollmentRequestAction(
  requestId: string,
  rejectionReason: string
): Promise<{ success?: boolean; error?: string }> {
  const validation = RejectEnrollmentSchema.safeParse({
    request_id: requestId,
    rejection_reason: rejectionReason,
  })

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'Datos de rechazo inválidos' }
  }

  const supabase = await createClient()

  // 1. Validar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado. Debes iniciar sesión.' }
  }

  // 2. Validar rol y school_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdminRole(profile.role) || !profile.school_id) {
    return { error: 'No tienes permisos suficientes para rechazar solicitudes.' }
  }

  const adminClient = createAdminClient()

  // 3. Actualizar la solicitud con estado 'rechazado' y motivo
  const { error: updateError } = await adminClient
    .from('enrollment_requests')
    .update({
      status: 'rechazado',
      rejection_reason: validation.data.rejection_reason,
    })
    .eq('id', requestId)
    .eq('school_id', profile.school_id)

  if (updateError) {
    console.error('Error al rechazar solicitud:', updateError)
    return { error: 'Error al rechazar la solicitud de inscripción.' }
  }

  revalidatePath('/admin/inscripciones')

  return { success: true }
}

/**
 * Genera una URL firmada de Supabase Storage para previsualizar o descargar un documento
 * de forma segura por parte de un administrador autenticado.
 */
export async function getSignedDocumentUrlAction(
  storagePath: string
): Promise<{ success?: boolean; url?: string; error?: string }> {
  const supabase = await createClient()

  // 1. Validar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado.' }
  }

  // 2. Validar rol administrativo
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdminRole(profile.role)) {
    return { error: 'Acceso denegado.' }
  }

  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient.storage
      .from('enrollment-documents')
      .createSignedUrl(storagePath, 60 * 60) // 1 hora de validez

    if (error || !data?.signedUrl) {
      console.error('Error generando URL firmada:', error)
      return { error: 'No se pudo generar el enlace de descarga del documento.' }
    }

    return { success: true, url: data.signedUrl }
  } catch (err: any /* TODO: tipado pendiente */) {
    console.error('Error en getSignedDocumentUrlAction:', err)
    return { error: 'Error al consultar el almacenamiento seguro.' }
  }
}
