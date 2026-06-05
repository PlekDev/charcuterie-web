// Infra de Cognito del lado servidor (route handlers de /api/auth/*).
//
// Mirror EXACTO de la lógica de server.js (fuente de verdad): mismo cálculo de
// SECRET_HASH y mismo mapeo de errores. No reescribimos server.js; portamos su
// contrato a route handlers de Next. Estas APIs de User Pool son no-autenticadas:
// solo necesitan client id + secret, ningún credencial de IAM.
//
// OJO: requiere COGNITO_CLIENT_SECRET en el entorno del servidor (ver .env.example).
// Estas vars NO llevan prefijo NEXT_PUBLIC_ -> nunca llegan al bundle del browser.

import { createHmac } from 'node:crypto'
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'
import { NextResponse } from 'next/server'

export const COGNITO_REGION = process.env.COGNITO_REGION ?? 'us-west-2'
export const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? ''
const COGNITO_CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET ?? ''

// Nombre de la cookie httpOnly donde vive el refresh token. Compartido entre
// el handler de login (la setea) y el de refresh (la lee). El JS del browser
// NUNCA lee esta cookie.
export const REFRESH_COOKIE = 'chaputeria_rt'

export const cognito = new CognitoIdentityProviderClient({ region: COGNITO_REGION })

// SECRET_HASH = base64( HMAC-SHA256( key=clientSecret, msg=username+clientId ) )
// Se calcula en runtime con el MISMO username del request.
export function secretHash(username: string): string {
  return createHmac('sha256', COGNITO_CLIENT_SECRET)
    .update(username + COGNITO_CLIENT_ID)
    .digest('base64')
}

// Mapea errores de Cognito a respuestas limpias (sin filtrar si el user existe).
export function cognitoErrorResponse(e: unknown): NextResponse {
  const err = e as { name?: string; message?: string }
  console.error('Cognito error:', err?.name, '-', err?.message)
  const map: Record<string, [number, string]> = {
    UsernameExistsException:   [409, 'Ese email ya esta registrado'],
    UserNotConfirmedException: [403, 'Falta confirmar el email'],
    CodeMismatchException:     [400, 'Codigo incorrecto'],
    ExpiredCodeException:      [400, 'El codigo expiro, pide uno nuevo'],
    NotAuthorizedException:    [401, 'Credenciales invalidas'],
    UserNotFoundException:     [401, 'Credenciales invalidas'], // no revelar existencia
    InvalidPasswordException:  [400, 'La contrasena no cumple los requisitos'],
    InvalidParameterException: [400, 'Parametros invalidos'],
    LimitExceededException:    [429, 'Demasiados intentos, espera un momento'],
  }
  const [status, msg] = map[err?.name ?? ''] ?? [500, 'Error de autenticacion']
  return NextResponse.json({ error: msg }, { status })
}
