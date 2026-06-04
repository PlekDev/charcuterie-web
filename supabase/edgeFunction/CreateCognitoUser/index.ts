// supabase/functions/create-user-from-cognito/index.ts
//
// Deploy con verificacion de JWT de Supabase DESACTIVADA (este endpoint
// recibe un token de Cognito, no uno de Supabase):
//   supabase functions deploy create-user-from-cognito --no-verify-jwt
//
// Env vars a setear (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY las inyecta
// Supabase automaticamente):
//   COGNITO_REGION         (ej. us-east-1)
//   COGNITO_USER_POOL_ID
//   COGNITO_CLIENT_ID      (app client id; opcional pero recomendado)

// Codigo de CCL adaptado pa charcuterie.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import * as jose from 'https://esm.sh/jose@5'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const COGNITO_REGION = Deno.env.get('COGNITO_REGION') ?? 'us-east-1'
const COGNITO_USER_POOL_ID = Deno.env.get('COGNITO_USER_POOL_ID') ?? ''
const COGNITO_CLIENT_ID = Deno.env.get('COGNITO_CLIENT_ID') ?? '' // opcional

const ISSUER = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`

// createRemoteJWKSet cachea el JWKS entre invocaciones (no re-fetchea cada vez)
const JWKS = jose.createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`))

async function verifyCognitoAccessToken(token: string): Promise<jose.JWTPayload> {
    // jwtVerify valida firma (via JWKS + kid), exp, nbf e issuer.
    const { payload } = await jose.jwtVerify(token, JWKS, { issuer: ISSUER })

    // Cognito ACCESS token: token_use='access' y el app client id va en
    // `client_id` (NO en `aud`, que solo trae el ID token).
    if (payload.token_use !== 'access') {
        throw new Error(`Unexpected token_use: ${String(payload.token_use)}`)
    }
    if (COGNITO_CLIENT_ID && payload.client_id !== COGNITO_CLIENT_ID) {
        throw new Error('Token client_id mismatch')
    }

    return payload
}

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return json({ error: 'Missing Authorization header' }, 401)
        }

        const token = authHeader.slice('Bearer '.length)

        let payload: jose.JWTPayload
        try {
            payload = await verifyCognitoAccessToken(token)
        } catch (e) {
            return json({ error: 'Invalid Cognito token', details: (e as Error).message }, 401)
        }

        // cognito_id sale del token verificado, nunca del body
        const verifiedCognitoId = payload.sub as string
        const { email, name, phone } = await req.json()

        if (!email || !name) {
            return json({ error: 'Missing required fields: email, name' }, 400)
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        )

        const { data, error } = await supabaseAdmin
            .schema('chaputeria')
            .rpc('create_user_from_cognito', {
                p_cognito_id: verifiedCognitoId,
                p_email: email,
                p_name: name,
                p_phone: phone ?? null,
            })

        if (error) {
            console.error('create_user_from_cognito failed:', error)
            return json({ error: error.message }, 500)
        }

        return json({ success: true, id: data, message: 'User upserted' }, 200)
    } catch (error) {
        console.error('Edge function error:', error)
        return json({ error: (error as Error).message ?? 'Unknown error' }, 500)
    }
})