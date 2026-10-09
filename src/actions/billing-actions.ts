'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createBillingConceptAction(
  prevState: { error: string | null; success?: boolean },
  formData: FormData
): Promise<{ error: string | null; success?: boolean }> {
  const supabase = await createClient()

  // 1. Verificar sesión de usuario
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'No autorizado. Inicia sesión nuevamente.', success: false }
  }

  // 2. Obtener school_id y rol del perfil del administrador (inyección segura en el servidor)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.school_id) {
    return { error: 'No se pudo determinar la institución asociada.', success: false }
  }

  // Verificar rol administrativo
  const allowedRoles = ['admin', 'director', 'coordinador', 'secretaria']
  if (!profile.role || !allowedRoles.includes(profile.role)) {
    return { error: 'No tienes permisos suficientes para realizar esta operación.', success: false }
  }

  // 3. Extraer y validar campos del formulario
  const name = (formData.get('name') as string)?.trim()
  const amountRaw = formData.get('amount_usd') as string
  const dueDate = formData.get('due_date') as string // YYYY-MM-DD

  if (!name || !amountRaw) {
    return { error: 'Todos los campos obligatorios deben ser completados.', success: false }
  }

  const amountUsd = parseFloat(amountRaw)
  if (isNaN(amountUsd) || amountUsd <= 0) {
    return { error: 'El monto debe ser un número válido mayor a cero.', success: false }
  }

  // Mapear fecha de vencimiento a la columna description
  const description = dueDate ? `Vence: ${dueDate}` : ''

  // 4. Insertar el registro utilizando el cliente Admin para saltar las restricciones de RLS
  const adminSupabase = createAdminClient()
  const { error: insertError } = await adminSupabase
    .from('billing_concepts')
    .insert({
      school_id: profile.school_id,
      name: name,
      amount_usd: amountUsd,
      description: description,
      is_recurring: false, // Valor por defecto
      is_active: true
    })

  if (insertError) {
    console.error('Error al registrar arancel:', insertError)
    return { error: 'Error al registrar el arancel. Intenta nuevamente.', success: false }
  }

  // 5. Invalidar caché para reflejar los cambios en tiempo real
  revalidatePath('/admin/billing')
  revalidatePath('/admin/payments/new')

  return { error: null, success: true }
}
