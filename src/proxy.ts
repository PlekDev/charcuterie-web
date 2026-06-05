// Gate server-side de /admin (Next 16: convención `proxy`, runtime nodejs).
// Corre ANTES de renderizar: si no hay una cookie de role 'admin' firmada y
// vigente, redirige a /login. No pega a la DB — solo verifica la firma HMAC de
// la cookie (la setea login/refresh leyendo chaputeria.users). Es defensa en
// capas; la barrera dura de los DATOS sigue siendo el RLS de Postgres.

import { NextRequest, NextResponse } from 'next/server'
import { ROLE_COOKIE, verifyRoleCookie } from '@/lib/admin-cookie'

export async function proxy(req: NextRequest) {
  const session = await verifyRoleCookie(req.cookies.get(ROLE_COOKIE)?.value)

  if (!session || session.role !== 'admin') {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
