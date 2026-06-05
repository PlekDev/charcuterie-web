// Sesión del lado cliente: asegura que el usuario logueado tenga su fila en
// chaputeria.users, sembrándola vía la edge function en el PRIMER login.
//
// Flujo (ARCHITECTURE §6): Cognito NO crea la fila; lo hace la edge function
// create-user-from-cognito. La función verifica el accessToken, saca el `sub`,
// e inserta vía RPC (idempotente). El admin ya está sembrado a mano.

import { supabaseBrowser } from './supabase-browser'
import { getCognitoAccessToken, getIdToken, decodeJwtSub, decodeJwtPayload } from './auth-tokens'

export type UserRole = 'customer' | 'admin'
export type UserRow = {
  id: string
  role: UserRole
  name: string
  email: string
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Llama a la edge function para sembrar la fila. Los datos (email/name/phone)
// salen del idToken de Cognito (claims). El `sub` lo saca la función del
// accessToken verificado, no del body.
async function seedUserFromCognito(): Promise<void> {
  const accessToken = await getCognitoAccessToken()
  const idToken = getIdToken()
  if (!accessToken || !idToken) {
    throw new Error('No hay sesión activa para sembrar el usuario')
  }

  const claims = decodeJwtPayload(idToken) ?? {}
  const email = typeof claims.email === 'string' ? claims.email : null
  const name = typeof claims.name === 'string' ? claims.name : null
  // phone_number es opcional (E.164) si el pool lo trae.
  const phone = typeof claims.phone_number === 'string' ? claims.phone_number : undefined

  if (!email || !name) {
    throw new Error('El idToken no trae email/name para sembrar el usuario')
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-cognito-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // El token de Cognito que la función verifica contra el JWKS.
      Authorization: `Bearer ${accessToken}`,
      // El gateway de Edge Functions exige apikey; va la anon (pública).
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ email, name, phone }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || `Edge function respondió ${res.status}`)
  }
}

// Lee la fila del usuario logueado por su cognito_id (RLS deja leer la propia).
async function fetchOwnUserRow(sub: string): Promise<UserRow | null> {
  const { data, error } = await supabaseBrowser
    .from('users')
    .select('id, role, name, email')
    .eq('cognito_id', sub)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data as UserRow) ?? null
}

// Asegura que exista la fila del usuario. Si ya existe (admin sembrado a mano o
// re-login), no llama a la edge function. Devuelve la fila resultante. Pensado
// para correr justo después de guardar los tokens en el login.
export async function ensureUserRow(): Promise<UserRow | null> {
  const accessToken = await getCognitoAccessToken()
  if (!accessToken) return null

  const sub = decodeJwtSub(accessToken)
  if (!sub) return null

  // 1. ¿Ya existe? (no sembrar admin ni re-sembrar en cada login)
  const existing = await fetchOwnUserRow(sub)
  if (existing) return existing

  // 2. Primer login: sembrar vía edge function.
  await seedUserFromCognito()

  // 3. Releer la fila ya creada.
  return fetchOwnUserRow(sub)
}
