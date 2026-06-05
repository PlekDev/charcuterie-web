// POST /api/auth/refresh — body { email }
// El refresh token se lee de la cookie httpOnly (no del body): por eso el front
// solo manda el email (necesario para el SECRET_HASH). No rota la cookie; el
// refresh token original sigue válido hasta que expire. Devuelve
// { accessToken, idToken, expiresIn }.

import { NextRequest, NextResponse } from 'next/server'
import { InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider'
import {
  cognito,
  COGNITO_CLIENT_ID,
  secretHash,
  cognitoErrorResponse,
  REFRESH_COOKIE,
} from '@/lib/cognito-server'
import { roleForCognitoSub } from '@/lib/supabase'
import {
  ROLE_COOKIE,
  ROLE_COOKIE_MAX_AGE,
  signRoleCookie,
  subFromIdToken,
} from '@/lib/admin-cookie'

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}))
  if (!email) {
    return NextResponse.json({ error: 'email es requerido' }, { status: 400 })
  }

  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value
  if (!refreshToken) {
    return NextResponse.json({ error: 'No hay sesion activa' }, { status: 401 })
  }

  try {
    const out = await cognito.send(
      new InitiateAuthCommand({
        ClientId: COGNITO_CLIENT_ID,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
          SECRET_HASH: secretHash(email),
        },
      })
    )

    const r = out.AuthenticationResult
    if (!r) {
      return NextResponse.json({ error: 'No se pudo refrescar la sesion' }, { status: 401 })
    }
    // return NextResponse.json({
    const res = NextResponse.json({
      accessToken: r.AccessToken,
      idToken: r.IdToken,
      expiresIn: r.ExpiresIn,
    })
    
//} catch (e) {
    // Refresh token vencido/revocado -> limpia la cookie para forzar re-login.
    //const res = cognitoErrorResponse(e)
    //res.cookies.delete(REFRESH_COOKIE)
    
    // Re-emite la cookie de role en cada refresh (~cada hora y en cada reload):
    // mantiene el gate fresco y aplica revocaciones de admin sin esperar 30 días.
    const sub = subFromIdToken(r.IdToken)
    if (sub) {
      const role = await roleForCognitoSub(sub)
      res.cookies.set(ROLE_COOKIE, await signRoleCookie(role, sub), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: ROLE_COOKIE_MAX_AGE,
      })
    }

    return res
  } catch (e) {
    // Refresh token vencido/revocado -> limpia las cookies para forzar re-login.
    const res = cognitoErrorResponse(e)
    res.cookies.delete(REFRESH_COOKIE)
    res.cookies.delete(ROLE_COOKIE)
    return res
  }
}
