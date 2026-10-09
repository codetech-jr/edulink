'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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
  try {
    const supabase = await createClient()

    // 1. Verificar sesión de usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'No autorizado. Por favor, inicia sesión nuevamente.', success: false }
    }

    // 2. Verificar rol 'representante' del usuario autenticado
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'representante') {
      return { error: 'Acción no permitida. Solo los representantes pueden reportar pagos.', success: false }
    }

    // 3. Extraer y validar campos del formulario
    const studentId = formData.get('student_id') as string
    const billingConceptId = formData.get('billing_concept_id') as string
    const paymentMethod = formData.get('payment_method') as string
    const amountRaw = formData.get('amount_usd') as string
    const referenceNumber = (formData.get('reference_number') as string)?.trim()

    if (!studentId || !billingConceptId || !paymentMethod || !amountRaw || !referenceNumber) {
      return { error: 'Todos los campos obligatorios deben ser completados.', success: false }
    }

    const amountUsd = parseFloat(amountRaw)
    if (isNaN(amountUsd) || amountUsd <= 0) {
      return { error: 'El monto debe ser un número válido mayor a cero.', success: false }
    }

    const validMethods = ['pago_movil', 'zelle', 'efectivo', 'transferencia']
    if (!validMethods.includes(paymentMethod)) {
      return { error: 'Método de pago no válido.', success: false }
    }

    // 4. Validar relación representante-estudiante y obtener el school_id del estudiante
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('school_id, parent_id')
      .eq('id', studentId)
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
      .eq('id', billingConceptId)
      .single()

    if (conceptError || !concept || !concept.is_active) {
      return { error: 'El concepto de facturación seleccionado no es válido o está inactivo.', success: false }
    }

    if (concept.school_id !== student.school_id) {
      return { error: 'El concepto de facturación no coincide con la institución del estudiante.', success: false }
    }

    // 6. Insertar el pago en estado pendiente
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        school_id: student.school_id,
        student_id: studentId,
        billing_concept_id: billingConceptId,
        payer_id: user.id,
        payment_method: paymentMethod,
        amount_usd: amountUsd,
        reference_number: referenceNumber,
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
  } catch (err: any) {
    console.error('Error no controlado en reportPaymentAction:', err)
    return { error: 'Ocurrió un error inesperado al procesar la solicitud.', success: false }
  }
}
