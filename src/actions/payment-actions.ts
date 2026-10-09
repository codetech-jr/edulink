'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Aprueba un pago marcando su estado como 'confirmado'
 */
export async function approvePaymentAction(paymentId: string) {
  const supabase = await createClient()

  // 1. Verificar sesión de usuario
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

  // 3. Actualizar el pago verificando estrictamente la pertenencia al school_id (RLS / Multitenancy)
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'confirmado',
      processed_by: user.id,
      processed_at: new Date().toISOString(),
      rejection_reason: null // Limpiar el motivo de rechazo si existiera
    })
    .eq('id', paymentId)
    .eq('school_id', profile.school_id)

  if (updateError) {
    console.error('Error al confirmar pago:', updateError)
    if (updateError.code === '42501') {
      throw new Error('No tienes permisos suficientes para realizar esta operación')
    }
    throw new Error('Error al procesar la aprobación del pago')
  }

  // 4. Invalidar la caché de la página de pagos
  revalidatePath('/admin/payments')
  return { success: true }
}

/**
 * Rechaza un pago con un motivo específico
 */
export async function rejectPaymentAction(paymentId: string, reason: string) {
  const supabase = await createClient()

  if (!reason || reason.trim() === '') {
    throw new Error('El motivo de rechazo es obligatorio')
  }

  // 1. Verificar sesión de usuario
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

  // 3. Actualizar el pago
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'rechazado',
      processed_by: user.id,
      processed_at: new Date().toISOString(),
      rejection_reason: reason.trim()
    })
    .eq('id', paymentId)
    .eq('school_id', profile.school_id)

  if (updateError) {
    console.error('Error al rechazar pago:', updateError)
    if (updateError.code === '42501') {
      throw new Error('No tienes permisos suficientes para realizar esta operación')
    }
    throw new Error('Error al procesar el rechazo del pago')
  }

  // 4. Invalidar la caché
  revalidatePath('/admin/payments')
  return { success: true }
}

/**
 * Inserta o actualiza la tasa de cambio BCV del día actual
 */
export async function updateExchangeRateAction(rate: number) {
  const supabase = await createClient()

  if (!rate || isNaN(rate) || rate <= 0) {
    throw new Error('La tasa de cambio debe ser un número válido mayor a cero')
  }

  // 1. Verificar sesión de usuario
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autorizado')
  }

  // 2. Obtener school_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.school_id) {
    throw new Error('No se pudo determinar la institución asociada')
  }

  // 3. Verificar si ya existe una tasa para hoy (según zona horaria UTC/local del servidor)
  const todayStr = new Date().toISOString().split('T')[0]

  const { data: existingRate, error: selectError } = await supabase
    .from('exchange_rates')
    .select('id')
    .eq('school_id', profile.school_id)
    .eq('rate_date', todayStr)
    .maybeSingle()

  if (selectError) {
    console.error('Error consultando tasa existente:', selectError)
  }

  if (existingRate) {
    // Actualizar tasa existente
    const { error: updateError } = await supabase
      .from('exchange_rates')
      .update({
        rate: rate,
        created_by: user.id
      })
      .eq('id', existingRate.id)
      .eq('school_id', profile.school_id)

    if (updateError) {
      console.error('Error al actualizar tasa de cambio:', updateError)
      throw new Error('Error al actualizar la tasa de cambio')
    }
  } else {
    // Insertar nueva tasa
    const { error: insertError } = await supabase
      .from('exchange_rates')
      .insert({
        school_id: profile.school_id,
        rate_date: todayStr,
        rate: rate,
        created_by: user.id,
        currency_from: 'USD',
        currency_to: 'VES',
        source: 'BCV'
      })

    if (insertError) {
      console.error('Error al insertar tasa de cambio:', insertError)
      throw new Error('Error al guardar la tasa de cambio')
    }
  }

  // 4. Invalidar la caché
  revalidatePath('/admin/payments')
  return { success: true }
}

/**
 * Registra un pago manualmente desde el formulario del administrador.
 * Inyecta el school_id del perfil del admin de forma segura en el servidor.
 * Compatible con useActionState (prevState, formData).
 */
export async function createPaymentAction(
  prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  // 1. Verificar sesión de usuario
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'No autorizado. Inicia sesión nuevamente.' }
  }

  // 2. Obtener school_id del perfil del administrador (inyección segura en servidor)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.school_id) {
    return { error: 'No se pudo determinar la institución asociada.' }
  }

  // 3. Extraer y validar campos del formulario
  const studentId = formData.get('student_id') as string
  const paymentMethod = formData.get('payment_method') as string
  const amountRaw = formData.get('amount_usd') as string
  const referenceNumber = (formData.get('reference_number') as string)?.trim() || null
  const status = formData.get('status') as string
  const billingConceptId = formData.get('billing_concept_id') as string

  if (!studentId || !paymentMethod || !amountRaw || !status || !billingConceptId) {
    return { error: 'Todos los campos obligatorios deben ser completados.' }
  }

  const amountUsd = parseFloat(amountRaw)
  if (isNaN(amountUsd) || amountUsd <= 0) {
    return { error: 'El monto debe ser un número válido mayor a cero.' }
  }

  const validMethods = ['pago_movil', 'zelle', 'efectivo', 'transferencia']
  if (!validMethods.includes(paymentMethod)) {
    return { error: 'Método de pago no válido.' }
  }

  const validStatuses = ['pendiente', 'confirmado']
  if (!validStatuses.includes(status)) {
    return { error: 'Estado inicial no válido.' }
  }

  // 4. Insertar el registro en la tabla payments
  const { error: insertError } = await supabase
    .from('payments')
    .insert({
      school_id: profile.school_id,
      student_id: studentId,
      payer_id: user.id,
      payment_method: paymentMethod,
      amount_usd: amountUsd,
      reference_number: referenceNumber,
      status: status,
      billing_concept_id: billingConceptId,
      transaction_date: new Date().toISOString().split('T')[0],
    })

  if (insertError) {
    console.error('Error al registrar pago:', insertError)
    if (insertError.code === '23503') {
      return { error: 'El estudiante seleccionado no existe o no pertenece a tu institución.' }
    }
    return { error: 'Error al registrar el pago. Intenta nuevamente.' }
  }

  // 5. Invalidar caché y redirigir
  revalidatePath('/admin/payments')
  redirect('/admin/payments')
}
