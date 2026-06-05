// POST /api/auth/login — body { email, password }
// Mirror del contrato de server.js, pero el refreshToken NO vuelve al browser:
// se guarda en una cookie httpOnly. Body de respuesta: { accessToken, idToken,
// expiresIn }.
//
// Requiere ALLOW_USER_PASSWORD_AUTH habilitado en el app client de Cognito.

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

// Validez del refresh token (default del User Pool de Cognito: 30 días).
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}))
  if (!email || !password) {
    return NextResponse.json({ error: 'email y password son requeridos' }, { status: 400 })
  }

  try {
    const out = await cognito.send(
      new InitiateAuthCommand({
        ClientId: COGNITO_CLIENT_ID,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          SECRET_HASH: secretHash(email),
        },
      })
    )

    const r = out.AuthenticationResult
    if (!r) {
      // p.ej. NEW_PASSWORD_REQUIRED, MFA, etc. (no manejado en este corte)
      return NextResponse.json(
        { error: 'Challenge requerido', challenge: out.ChallengeName },
        { status: 401 }
      )
    }

    // accessToken/idToken/expiresIn van al body (el front los maneja en memoria).
    const res = NextResponse.json({
      accessToken: r.AccessToken,
      idToken: r.IdToken,
      expiresIn: r.ExpiresIn,
    })

    // refreshToken -> cookie httpOnly. El JS del browser nunca lo ve.
    if (r.RefreshToken) {
      res.cookies.set(REFRESH_COOKIE, r.RefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: REFRESH_MAX_AGE,
      })
    }

    // Cookie de role firmada para el gate server-side (middleware /admin).
    // El role sale de chaputeria.users, NO de Cognito. httpOnly + firmada => no
    // falsificable desde el browser.
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
    return cognitoErrorResponse(e)
  }
}