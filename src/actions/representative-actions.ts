'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { ReportPaymentSchema } from '@/lib/schemas/payment.schema'
import { isAdminRole } from '@/lib/permissions'

export interface ReportPaymentState {
  error: string | null
  success?: boolean
}

/**
 * Reporta un pago realizado por un representante para un estudiante específico.
 * Forzar el status a 'pendiente' y validar estrictamente la propiedad del estudiante en el servidor.
 */
export async function reportPaymentAction(
  prevState: ReportPaymentState,
  formData: FormData
): Promise<ReportPaymentState> {
  // 1. Validar campos con Zod
  const rawData = Object.fromEntries(formData.entries())
  const validation = ReportPaymentSchema.safeParse(rawData)

  if (!validation.success) {
    return { error: validation.error.issues[0].message, success: false }
  }

  try {
    const supabase = await createClient()

    // 2. Verificar sesión de usuario
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'No autorizado. Por favor, inicia sesión nuevamente.', success: false }
    }

    // 3. Verificar rol 'representante' del usuario autenticado
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'representante') {
      return { error: 'Acción no permitida. Solo los representantes pueden reportar pagos.', success: false }
    }

    const {
      student_id,
      billing_concept_id,
      payment_method,
      amount_usd,
      reference_number,
    } = validation.data

    // 4. Validar relación representante-estudiante y obtener el school_id del estudiante
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('school_id, parent_id')
      .eq('id', student_id)
      .single()

    if (studentError || !student) {
      return { error: 'El estudiante seleccionado no es válido o no existe.', success: false }
    }

    if (student.parent_id !== user.id) {
      return { error: 'No tienes permisos para reportar pagos de este estudiante.', success: false }
    }

    // 5. Validar que el concepto de facturación exista y esté activo
    const { data: concept, error: conceptError } = await supabase
      .from('billing_concepts')
      .select('id, school_id, is_active')
      .eq('id', billing_concept_id)
      .single()

    if (conceptError || !concept || !concept.is_active) {
      return { error: 'El concepto de facturación seleccionado no es válido o está inactivo.', success: false }
    }

    if (concept.school_id !== student.school_id) {
      return { error: 'El concepto de facturación no coincide con la institución del estudiante.', success: false }
    }

    // 6. Insertar el pago en estado pendiente usando el school_id del estudiante verificado
    const { error: insertError } = await supabase.from('payments').insert({
      school_id: student.school_id,
      student_id,
      billing_concept_id,
      payer_id: user.id,
      payment_method,
      amount_usd,
      reference_number,
      status: 'pendiente',
      transaction_date: new Date().toISOString().split('T')[0],
    })

    if (insertError) {
      console.error('Error insertando pago reportado:', insertError)
      return { error: 'Error al registrar el pago en el sistema. Intenta de nuevo.', success: false }
    }

    // 7. Invalidar la caché de las páginas correspondientes
    revalidatePath('/representante')
    revalidatePath('/admin/payments')

    return { error: null, success: true }
  } catch (err: any /* TODO: tipado pendiente */) {
    console.error('Error no controlado en reportPaymentAction:', err)
    return { error: 'Ocurrió un error inesperado al procesar la solicitud.', success: false }
  }
}

/**
 * Actualiza los datos de perfil (nombre, cédula, teléfono) de un representante/tutor.
 * Solo puede ser ejecutada por personal administrativo (Admin / Coordinador) del mismo colegio.
 */
export async function updateRepresentativeAction(data: {
  representativeId: string
  fullName: string
  cedula?: string | null
  phone?: string | null
}): Promise<{ error: string | null; success?: boolean }> {
  try {
    const supabase = await createClient()

    // 1. Validar sesión
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'No autorizado. Por favor inicia sesión.', success: false }
    }

    // 2. Validar que el usuario tenga rol administrativo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.school_id || !isAdminRole(profile.role)) {
      return { error: 'No tienes permisos para modificar representantes.', success: false }
    }

    const representativeId = data.representativeId?.trim()
    const fullName = data.fullName?.trim()

    if (!representativeId) {
      return { error: 'Identificador de representante no válido.', success: false }
    }

    if (!fullName || fullName.length < 3) {
      return { error: 'El nombre completo debe tener al menos 3 caracteres.', success: false }
    }

    const { createAdminClient } = await import('@/utils/supabase/admin')
    const adminClient = createAdminClient()

    // 3. Verificar que el representante pertenece al mismo colegio
    const { data: targetRep, error: repError } = await adminClient
      .from('profiles')
      .select('id, school_id, role')
      .eq('id', representativeId)
      .single()

    if (repError || !targetRep || targetRep.school_id !== profile.school_id) {
      return { error: 'El representante no existe o no pertenece a tu colegio.', success: false }
    }

    // 4. Actualizar datos en profiles
    const cleanCedula = data.cedula?.trim() || null
    const cleanPhone = data.phone?.trim() || null

    const { error: updateError } = await adminClient
      .from('profiles')
      .update({
        full_name: fullName,
        cedula: cleanCedula,
        phone: cleanPhone,
      })
      .eq('id', representativeId)

    if (updateError) {
      console.error('Error al actualizar representante:', updateError)
      return { error: 'Error al actualizar los datos en el sistema.', success: false }
    }

    revalidatePath('/admin/representantes')
    return { error: null, success: true }
  } catch (err: any) {
    console.error('Error no controlado en updateRepresentativeAction:', err)
    return { error: err.message || 'Error inesperado al guardar.', success: false }
  }
}
