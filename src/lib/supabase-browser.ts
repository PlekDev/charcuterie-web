// Cliente de Supabase del BROWSER, ligado al usuario logueado vía Cognito.
//
// A diferencia de src/lib/supabase.ts (anon para lecturas públicas + admin
// service_role solo-servidor), este cliente inyecta el accessToken de Cognito
// en CADA request mediante el callback `accessToken` (mecanismo de third-party
// auth de supabase-js v2). RLS valida ese JWT contra el JWKS de Cognito y filtra
// los datos según el usuario.
//
// Firma verificada contra supabase-js 2.107.0:
//   accessToken?: () => Promise<string | null>
// La doc oficial advierte que ese callback "may be called concurrently and many
// times" -> getCognitoAccessToken usa single-flight para no disparar refreshes
// en paralelo. Además, con `accessToken` seteado NO se puede usar el namespace
// supabase.auth.* (no usamos Supabase Auth, así que ok).

import { createClient } from '@supabase/supabase-js'
import { getCognitoAccessToken } from './auth-tokens'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !anonKey) {
  throw new Error(
    'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local'
  )
}

// db.schema 'chaputeria' es obligatorio; sin él pega a `public` y truena con
// "relation does not exist".
export const supabaseBrowser = createClient(supabaseUrl, anonKey, {
  db: { schema: 'chaputeria' },
  accessToken: async () => getCognitoAccessToken(),
})
