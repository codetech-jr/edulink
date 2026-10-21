'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAdminRole } from '@/lib/permissions'
import {
  ApprovePaymentSchema,
  RejectPaymentSchema,
  UpdateExchangeRateSchema,
  CreatePaymentSchema,
} from '@/lib/schemas/payment.schema'

/**
 * Aprueba un pago marcando su estado como 'confirmado'
 */
export async function approvePaymentAction(paymentId: string) {
  const validation = ApprovePaymentSchema.safeParse({ payment_id: paymentId })
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  const supabase = await createClient()

  // 1. Verificar sesión de usuario
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autorizado')
  }

  // 2. Obtener school_id y rol del perfil del administrador
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.school_id) {
    throw new Error('No se pudo determinar la institución asociada')
  }

  if (!isAdminRole(profile.role)) {
    throw new Error('No tienes permisos suficientes para realizar esta operación')
  }

  // 3. Actualizar el pago verificando estrictamente la pertenencia al school_id (RLS / Multitenancy)
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'confirmado',
      processed_by: user.id,
      processed_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq('id', validation.data.payment_id)
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
  const validation = RejectPaymentSchema.safeParse({
    payment_id: paymentId,
    reason,
  })
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  const supabase = await createClient()

  // 1. Verificar sesión de usuario
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autorizado')
  }

  // 2. Obtener school_id y rol del perfil del administrador
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.school_id) {
    throw new Error('No se pudo determinar la institución asociada')
  }

  if (!isAdminRole(profile.role)) {
    throw new Error('No tienes permisos suficientes para realizar esta operación')
  }

  // 3. Actualizar el pago
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'rechazado',
      processed_by: user.id,
      processed_at: new Date().toISOString(),
      rejection_reason: validation.data.reason,
    })
    .eq('id', validation.data.payment_id)
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
  const validation = UpdateExchangeRateSchema.safeParse({ rate })
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  const supabase = await createClient()

  // 1. Verificar sesión de usuario
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autorizado')
  }

  // 2. Obtener school_id y rol
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.school_id) {
    throw new Error('No se pudo determinar la institución asociada')
  }

  if (!isAdminRole(profile.role)) {
    throw new Error('No tienes permisos suficientes para realizar esta operación')
  }

  // 3. Verificar si ya existe una tasa para hoy
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
        rate: validation.data.rate,
        created_by: user.id,
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
        rate: validation.data.rate,
        created_by: user.id,
        currency_from: 'USD',
        currency_to: 'VES',
        source: 'BCV',
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
  // 1. Validar datos del formulario con Zod
  const rawData = Object.fromEntries(formData.entries())
  const validation = CreatePaymentSchema.safeParse(rawData)

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()

  // 2. Verificar sesión de usuario
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'No autorizado. Inicia sesión nuevamente.' }
  }

  // 3. Obtener school_id y rol del perfil del administrador (inyección segura en servidor)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.school_id) {
    return { error: 'No se pudo determinar la institución asociada.' }
  }

  if (!isAdminRole(profile.role)) {
    return { error: 'No tienes permisos suficientes para registrar pagos.' }
  }

  const {
    student_id,
    billing_concept_id,
    payment_method,
    amount_usd,
    reference_number,
    status,
  } = validation.data

  // 4. Insertar el registro en la tabla payments
  const { error: insertError } = await supabase.from('payments').insert({
    school_id: profile.school_id,
    student_id,
    payer_id: user.id,
    payment_method,
    amount_usd,
    reference_number,
    status,
    billing_concept_id,
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

/**
 * Sincroniza la tasa oficial del BCV ejecutando el servicio de sincronización.
 * Requiere rol administrativo ('admin' o 'coordinador').
 */
export async function triggerBcvSyncAction(): Promise<{
  success?: boolean
  error?: string
  rate?: number
  date?: string
}> {
  const supabase = await createClient()

  // 1. Validar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado. Debes iniciar sesión.' }
  }

  // 2. Validar rol administrativo
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdminRole(profile.role) || !profile.school_id) {
    return { error: 'No tienes permisos suficientes para actualizar la tasa oficial.' }
  }

  // 3. Ejecutar sincronización directamente como administrador verificado
  try {
    const { syncBcvRateToAllSchools } = await import('@/lib/services/bcv-sync')
    const result = await syncBcvRateToAllSchools()

    if (!result.success) {
      return { error: result.error || 'Error al sincronizar con el BCV.' }
    }

    // 4. Revalidar vistas dependientes
    revalidatePath('/admin/payments')
    revalidatePath('/admin')
    revalidatePath('/admin/morosidad')
    revalidatePath('/representante')

    return {
      success: true,
      rate: result.rate,
      date: result.date,
    }
  } catch (err: any) {
    console.error('Error al ejecutar sincronización BCV desde Server Action:', err)
    return { error: err?.message || 'Fallo al sincronizar la tasa del BCV.' }
  }
}

