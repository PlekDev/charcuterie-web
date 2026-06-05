// POST /api/auth/logout
// Borra la cookie httpOnly del refresh token. El accessToken vive en memoria del
// browser y lo limpia el cliente (clearTokens). No requiere body.
//
// Nota: esto invalida el uso del refresh token desde ESTE browser (ya no se
// manda la cookie). Si en el futuro se quiere revocar el token en Cognito
// (RevokeTokenCommand), se haría aquí leyendo la cookie antes de borrarla.

import { NextResponse } from 'next/server'
import { REFRESH_COOKIE } from '@/lib/cognito-server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(REFRESH_COOKIE)
  return res
}
