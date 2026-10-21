'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { isAdminRole } from '@/lib/permissions'
import { CreateBillingConceptSchema } from '@/lib/schemas/billing.schema'

export async function createBillingConceptAction(
  prevState: { error: string | null; success?: boolean },
  formData: FormData
): Promise<{ error: string | null; success?: boolean }> {
  // 1. Validar campos del formulario con Zod
  const rawData = Object.fromEntries(formData.entries())
  const validation = CreateBillingConceptSchema.safeParse(rawData)

  if (!validation.success) {
    return { error: validation.error.issues[0].message, success: false }
  }

  const supabase = await createClient()

  // 2. Verificar sesión de usuario
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'No autorizado. Inicia sesión nuevamente.', success: false }
  }

  // 3. Obtener school_id y rol del perfil (inyección segura en el servidor)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.school_id) {
    return { error: 'No se pudo determinar la institución asociada.', success: false }
  }

  // Verificar rol administrativo (admin o coordinador)
  if (!isAdminRole(profile.role)) {
    return { error: 'No tienes permisos suficientes para realizar esta operación.', success: false }
  }

  const { name, amount_usd, due_date } = validation.data
  const description = due_date ? `Vence: ${due_date}` : ''

  // 4. Insertar el registro utilizando el cliente Admin para saltar las restricciones de RLS
  const adminSupabase = createAdminClient()
  const { error: insertError } = await adminSupabase
    .from('billing_concepts')
    .insert({
      school_id: profile.school_id,
      name,
      amount_usd,
      description,
      is_recurring: false,
      is_active: true,
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
