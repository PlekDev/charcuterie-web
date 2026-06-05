// POST /api/auth/confirm — body { email, code }
// El usuario pone el código que le llega por email.
// Respuesta { ok: true }.

import { NextRequest, NextResponse } from 'next/server'
import { ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider'
import {
  cognito,
  COGNITO_CLIENT_ID,
  secretHash,
  cognitoErrorResponse,
} from '@/lib/cognito-server'

export async function POST(req: NextRequest) {
  const { email, code } = await req.json().catch(() => ({}))
  if (!email || !code) {
    return NextResponse.json({ error: 'email y code son requeridos' }, { status: 400 })
  }

  try {
    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: COGNITO_CLIENT_ID,
        SecretHash: secretHash(email),
        Username: email,
        ConfirmationCode: code,
      })
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    return cognitoErrorResponse(e)
  }
}