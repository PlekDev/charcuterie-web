// Cookie de sesión de ROLE, firmada (HMAC-SHA256) y httpOnly.
//
// La setea el SERVER en login/refresh, leyendo el role real de chaputeria.users
// (vía service_role). El middleware solo la VERIFICA: no pega a la DB en cada
// navegación. Al ir firmada, cambiar el valor desde devtools invalida la firma
// -> no se puede auto-promover a admin. (La barrera dura de los DATOS sigue
// siendo el RLS de Postgres; esto es el gate de ruta server-side.)
//
// Usa Web Crypto (no node:crypto) a propósito: el MISMO código corre en el route
// handler (runtime Node) y en el middleware (runtime Edge).

export const ROLE_COOKIE = 'chaputeria_role'
export const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 // 1 día (se re-emite en cada refresh)

export type SessionRole = 'customer' | 'admin'

type Payload = { role: SessionRole; sub: string; exp: number }

// Secret server-only. Cae a COGNITO_CLIENT_SECRET para no exigir config nueva en
// la demo; en prod conviene un AUTH_COOKIE_SECRET dedicado (ver .env.example).
function secret(): string {
  return process.env.AUTH_COOKIE_SECRET || process.env.COGNITO_CLIENT_SECRET || ''
}

const enc = new TextEncoder()

function b64urlFromBytes(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlEncode(s: string): string {
  return b64urlFromBytes(enc.encode(s))
}

function b64urlDecode(s: string): string {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return b64urlFromBytes(new Uint8Array(sig))
}

// Firma { role, sub, exp } -> "<payload>.<firma>".
export async function signRoleCookie(role: SessionRole, sub: string): Promise<string> {
  const payload: Payload = { role, sub, exp: Date.now() + ROLE_COOKIE_MAX_AGE * 1000 }
  const body = b64urlEncode(JSON.stringify(payload))
  return `${body}.${await hmac(body)}`
}

// Verifica firma + expiración. Devuelve el payload o null si es inválida/falsa.
export async function verifyRoleCookie(token: string | undefined): Promise<Payload | null> {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null

  const expected = await hmac(body)
  // Comparación en tiempo (cuasi) constante para no filtrar la firma por timing.
  if (sig.length !== expected.length) return null
  let diff = 0
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i)
  if (diff !== 0) return null

  try {
    const payload = JSON.parse(b64urlDecode(body)) as Payload
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

// Saca el `sub` del idToken de Cognito SIN verificar firma: viene directo de la
// respuesta de Cognito en este mismo request, así que ya es de confianza.
export function subFromIdToken(idToken: string | undefined): string | null {
  if (!idToken) return null
  const parts = idToken.split('.')
  if (parts.length < 2) return null
  try {
    const payload = JSON.parse(b64urlDecode(parts[1])) as { sub?: string }
    return payload.sub ?? null
  } catch {
    return null
  }
}