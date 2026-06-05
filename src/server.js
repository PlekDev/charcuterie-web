// server.js — auth server-side contra Cognito + sirve el build de React
//
// package.json necesita: { "type": "module" }
// deps:  npm i express @aws-sdk/client-cognito-identity-provider
//
//
// OJO: el app client debe tener habilitado ALLOW_USER_PASSWORD_AUTH en Cognito,
// si no, /api/login truena con "Auth flow not enabled for this client".

import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHmac } from 'node:crypto'
import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    ConfirmSignUpCommand,
    ResendConfirmationCodeCommand,
    InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const COGNITO_REGION = process.env.COGNITO_REGION ?? 'us-west-2'
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? ''
const COGNITO_CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET ?? ''
const PORT = Number(process.env.PORT ?? 3000)

// Estas APIs de User Pool son no-autenticadas: el cliente NO necesita
// credenciales de IAM, solo el client id + secret.
const cognito = new CognitoIdentityProviderClient({ region: COGNITO_REGION })

// SECRET_HASH = base64( HMAC-SHA256( key=clientSecret, msg=username+clientId ) )
// Se calcula en runtime, nunca toca la DB. Debe usar el MISMO username del request.
function secretHash(username) {
    return createHmac('sha256', COGNITO_CLIENT_SECRET)
        .update(username + COGNITO_CLIENT_ID)
        .digest('base64')
}

// Mapea errores de Cognito a respuestas limpias (sin filtrar si el user existe)
function cognitoError(res, e) {
    console.error('Cognito error:', e.name, '-', e.message)
    const map = {
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
    const [status, msg] = map[e.name] ?? [500, 'Error de autenticacion']
    return res.status(status).json({ error: msg })
}

const app = express()
app.use(express.json())

//  SIGNUP 
// Crea el usuario en Cognito y dispara el email con el codigo de confirmacion.
app.post('/api/signup', async (req, res) => {
    const { email, password, name, phone } = req.body ?? {}
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'email, password y name son requeridos' })
    }
    try {
        const out = await cognito.send(new SignUpCommand({
            ClientId: COGNITO_CLIENT_ID,
            SecretHash: secretHash(email),
            Username: email,
            Password: password,
            UserAttributes: [
                { Name: 'email', Value: email },
                { Name: 'name', Value: name },
                // phone debe ir en formato E.164 (+521234567890) y existir como
                // atributo en el pool. Quita esto si no usas phone.
                ...(phone ? [{ Name: 'phone_number', Value: phone }] : []),
            ],
        }))
        res.json({ ok: true, userConfirmed: out.UserConfirmed, sub: out.UserSub })
    } catch (e) {
        return cognitoError(res, e)
    }
})

//  CONFIRM 
// El usuario mete el codigo que le llego por email.
app.post('/api/confirm', async (req, res) => {
    const { email, code } = req.body ?? {}
    if (!email || !code) {
        return res.status(400).json({ error: 'email y code son requeridos' })
    }
    try {
        await cognito.send(new ConfirmSignUpCommand({
            ClientId: COGNITO_CLIENT_ID,
            SecretHash: secretHash(email),
            Username: email,
            ConfirmationCode: code,
        }))
        res.json({ ok: true })
    } catch (e) {
        return cognitoError(res, e)
    }
})

//  RESEND CODE 
app.post('/api/resend-code', async (req, res) => {
    const { email } = req.body ?? {}
    if (!email) return res.status(400).json({ error: 'email requerido' })
    try {
        await cognito.send(new ResendConfirmationCodeCommand({
            ClientId: COGNITO_CLIENT_ID,
            SecretHash: secretHash(email),
            Username: email,
        }))
        res.json({ ok: true })
    } catch (e) {
        return cognitoError(res, e)
    }
})

//  LOGIN 
// Devuelve los tokens. El browser usa el accessToken para pegarle a Supabase.
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body ?? {}
    if (!email || !password) {
        return res.status(400).json({ error: 'email y password son requeridos' })
    }
    try {
        const out = await cognito.send(new InitiateAuthCommand({
            ClientId: COGNITO_CLIENT_ID,
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
                SECRET_HASH: secretHash(email),
            },
        }))

        const r = out.AuthenticationResult
        if (!r) {
            // p.ej. NEW_PASSWORD_REQUIRED, MFA, etc. (no manejado en este corte)
            return res.status(401).json({ error: 'Challenge requerido', challenge: out.ChallengeName })
        }

        res.json({
            accessToken: r.AccessToken,
            idToken: r.IdToken,
            refreshToken: r.RefreshToken,
            expiresIn: r.ExpiresIn,
        })
    } catch (e) {
        return cognitoError(res, e)
    }
})

//  REFRESH 
// REFRESH_TOKEN_AUTH tambien necesita SECRET_HASH, y el SECRET_HASH se calcula
// con el username -> por eso el browser tiene que mandar el email aqui.
// No regresa un refreshToken nuevo: el original sigue valido hasta que expire.
app.post('/api/refresh', async (req, res) => {
    const { refreshToken, email } = req.body ?? {}
    if (!refreshToken || !email) {
        return res.status(400).json({ error: 'refreshToken y email son requeridos' })
    }
    try {
        const out = await cognito.send(new InitiateAuthCommand({
            ClientId: COGNITO_CLIENT_ID,
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            AuthParameters: {
                REFRESH_TOKEN: refreshToken,
                SECRET_HASH: secretHash(email),
            },
        }))
        const r = out.AuthenticationResult
        res.json({
            accessToken: r.AccessToken,
            idToken: r.IdToken,
            expiresIn: r.ExpiresIn,
        })
    } catch (e) {
        return cognitoError(res, e)
    }
})

//  Servir el build de React 
// Ajusta 'dist' a donde Vite/CRA deje el build (Vite=dist, CRA=build).
const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))

// SPA fallback como middleware final (robusto en Express 4 y 5; evita el
// problema del wildcard '*' de path-to-regexp en Express 5).
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Not found' })
    }
    res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => console.log(`server on :${PORT}`))