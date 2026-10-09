import { createClient } from '@supabase/supabase-js'

/**
 * Crea un cliente de Supabase con privilegios administrativos (service_role).
 * Este cliente SALTA el Row Level Security (RLS).
 * SOLO debe usarse en el servidor.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Faltan variables de entorno para el cliente Admin de Supabase. ' +
      'Asegúrate de configurar SUPABASE_SERVICE_ROLE_KEY en .env.local'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
