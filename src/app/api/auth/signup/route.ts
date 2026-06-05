// POST /api/auth/signup — body { email, password, name, phone? }
// Crea el usuario en Cognito y dispara el email con el codigo de confirmacion.
// Respuesta: { ok: true, userConfirmed, sub }. Mirror del contrato de server.js.

import { NextRequest, NextResponse } from 'next/server'
import { SignUpCommand } from '@aws-sdk/client-cognito-identity-provider'
import {
  cognito,
  COGNITO_CLIENT_ID,
  secretHash,
  cognitoErrorResponse,
} from '@/lib/cognito-server'

export async function POST(req: NextRequest) {
  const { email, password, name, phone } = await req.json().catch(() => ({}))
  if (!email || !password || !name) {
    return NextResponse.json(
      { error: 'email, password y name son requeridos' },
      { status: 400 }
    )
  }

  try {
    const out = await cognito.send(
      new SignUpCommand({
        ClientId: COGNITO_CLIENT_ID,
        SecretHash: secretHash(email),
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: name },
          // phone debe ir en formato E.164 (+521234567890) y existir como
          // atributo en el pool. Se omite si no se manda.
          ...(phone ? [{ Name: 'phone_number', Value: phone }] : []),
        ],
      })
    )
    return NextResponse.json({
      ok: true,
      userConfirmed: out.UserConfirmed,
      sub: out.UserSub,
    })
  } catch (e) {
    return cognitoErrorResponse(e)
  }
}
