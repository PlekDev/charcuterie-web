import { supabaseAdmin } from '@/lib/supabase'

// Re-exporta las constantes de estado (definidas en un módulo client-safe).
export {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from '@/lib/order-status'

// Usuario de prueba fijo: mientras no exista login (Cognito), todos los
// pedidos se crean a nombre de este usuario demo.
export const DEMO_USER = {
  email: 'demo@charcuteria.com',
  name: 'Cliente Demo',
}

// Devuelve el id del usuario demo, creándolo si no existe.
// Requiere service_role (salta RLS).
export async function ensureDemoUser(): Promise<string> {
  if (!supabaseAdmin) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en el servidor')
  }

  const { data: existing, error: selErr } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', DEMO_USER.email)
    .maybeSingle()

  if (selErr) throw new Error(selErr.message)
  if (existing) return existing.id

  const { data: created, error: insErr } = await supabaseAdmin
    .from('users')
    .insert({ name: DEMO_USER.name, email: DEMO_USER.email })
    .select('id')
    .single()

  if (insErr) throw new Error(insErr.message)
  return created.id
}
