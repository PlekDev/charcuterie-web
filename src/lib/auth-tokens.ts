// Manejo del accessToken de Cognito en el browser.
//
// Diseño de seguridad (acordado):
// - El refreshToken vive SOLO en una cookie httpOnly que setean los route
//   handlers /api/auth/login y /api/auth/refresh. El JS del browser nunca lo
//   lee ni lo guarda -> cierra el hoyo de XSS.
// - El accessToken (corto, ~1h) vive en MEMORIA. Un reload lo pierde; se
//   rehidrata pidiendo /api/auth/refresh al arrancar (la cookie viaja sola).
// - El email se persiste en localStorage (dato no sensible) porque
//   /api/auth/refresh lo necesita para el SECRET_HASH de Cognito.

const EMAIL_KEY = 'chaputeria-auth-email'
const EXPIRY_SKEW_MS = 60_000 // refresca 60s antes de expirar

type AccessState = {
  accessToken: string
  idToken: string | null
  expiresAt: number // epoch ms
}

// Estado en memoria. El accessToken NUNCA se persiste.
let state: AccessState | null = null

// Single-flight: si ya hay un refresh en vuelo, las demás llamadas esperan la
// MISMA promesa en vez de disparar su propio /api/auth/refresh. El callback
// `accessToken` de supabase-js corre en CADA request y puede llamarse en
// paralelo (lo dice su propia doc); sin este lock, varias queries con el token
// vencido dispararían refreshes concurrentes y Cognito (REFRESH_TOKEN_AUTH)
// podría auto-invalidar la sesión.
let inFlightRefresh: Promise<string | null> | null = null

const isBrowser = typeof window !== 'undefined'

// ---- email persistido (no sensible) ----

export function getStoredEmail(): string | null {
  if (!isBrowser) return null
  return window.localStorage.getItem(EMAIL_KEY)
}

function setStoredEmail(email: string): void {
  if (!isBrowser) return
  window.localStorage.setItem(EMAIL_KEY, email)
}

// ---- ciclo de vida del accessToken ----

// Guarda el accessToken tras login o refresh. NO recibe refreshToken: ese vive
// en la cookie httpOnly. `expiresIn` viene de Cognito en segundos.
export function saveAccessToken(params: {
  accessToken: string
  idToken?: string | null
  expiresIn: number
  email?: string
}): void {
  state = {
    accessToken: params.accessToken,
    idToken: params.idToken ?? null,
    expiresAt: Date.now() + params.expiresIn * 1000,
  }
  if (params.email) setStoredEmail(params.email)
}

export function clearTokens(): void {
  state = null
  if (isBrowser) window.localStorage.removeItem(EMAIL_KEY)
}

export function getIdToken(): string | null {
  return state?.idToken ?? null
}

// Refresh real contra el backend. La cookie httpOnly con el refresh token viaja
// automáticamente (same-origin); el body solo lleva el email para el SECRET_HASH.
async function doRefresh(): Promise<string | null> {
  const email = getStoredEmail()
  if (!email) return null
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) {
      // refresh inválido/revocado -> sesión muerta
      clearTokens()
      return null
    }
    const data = await res.json()
    saveAccessToken({
      accessToken: data.accessToken,
      idToken: data.idToken ?? null,
      expiresIn: data.expiresIn,
    })
    return data.accessToken as string
  } catch {
    return null
  }
}

// Refresh con dedupe single-flight.
export function refreshAccessToken(): Promise<string | null> {
  if (!inFlightRefresh) {
    inFlightRefresh = doRefresh().finally(() => {
      inFlightRefresh = null
    })
  }
  return inFlightRefresh
}

// La función que consume el callback `accessToken` de supabase-js.
// Devuelve el token vigente; si está por expirar o falta (p.ej. tras un reload),
// dispara/se une a un refresh single-flight. Firma alineada con supabase-js v2:
// () => Promise<string | null>.
export async function getCognitoAccessToken(): Promise<string | null> {
  if (state && state.expiresAt - EXPIRY_SKEW_MS > Date.now()) {
    return state.accessToken
  }
  return refreshAccessToken()
}

// Decodifica el payload (claims) de un JWT.
// OJO: esto es SOLO lectura de datos. NO valida la firma ni es una decisión de
// seguridad: la validación real la hace Supabase contra el JWKS de Cognito y la
// autorización la fuerza RLS en el servidor. Nunca confíes en algo decodificado
// aquí para autorizar al usuario; úsalo solo como dato (clave de búsqueda,
// prellenar campos, etc.).
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    let b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    b64 += '='.repeat((4 - (b64.length % 4)) % 4) // padding base64
    const json = isBrowser ? window.atob(b64) : Buffer.from(b64, 'base64').toString('binary')
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

// Atajo para leer el claim `sub` (id de Cognito) como clave de búsqueda.
export function decodeJwtSub(token: string): string | null {
  const claims = decodeJwtPayload(token)
  return typeof claims?.sub === 'string' ? claims.sub : null
}
