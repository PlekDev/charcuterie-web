// POST /api/auth/resend-code — body { email }
// Reenvia el codigo de confirmacion. Respuesta { ok: true }.

import { NextRequest, NextResponse } from 'next/server'
import { ResendConfirmationCodeCommand } from '@aws-sdk/client-cognito-identity-provider'
import {
  cognito,
  COGNITO_CLIENT_ID,
  secretHash,
  cognitoErrorResponse,
} from '@/lib/cognito-server'

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}))
  if (!email) {
    return NextResponse.json({ error: 'email requerido' }, { status: 400 })
  }

  try {
    await cognito.send(
      new ResendConfirmationCodeCommand({
        ClientId: COGNITO_CLIENT_ID,
        SecretHash: secretHash(email),
        Username: email,
      })
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    return cognitoErrorResponse(e)
  }
}
