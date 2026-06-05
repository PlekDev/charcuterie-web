'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AuthShell,
  authLabelClass,
  authInputClass,
  authButtonClass,
} from '@/components/auth/auth-shell'
import { saveAccessToken } from '@/lib/auth-tokens'
import { ensureUserRow } from '@/lib/auth-session'
import { useAuthStore } from '@/store/auth-store'
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated'

function LoginForm() {
  useRedirectIfAuthenticated()
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        // Cuenta sin confirmar -> mándalo a meter el código.
        if (res.status === 403) {
          toast.info('Falta confirmar tu email', {
            description: 'Te enviamos a verificar el código.',
          })
          router.push(`/confirm?email=${encodeURIComponent(email)}`)
          return
        }
        throw new Error(data.error || 'No se pudo iniciar sesión')
      }

      // El refreshToken quedó en cookie httpOnly; aquí solo guardamos el
      // accessToken (en memoria) y el email (para refresh).
      saveAccessToken({
        accessToken: data.accessToken,
        idToken: data.idToken,
        expiresIn: data.expiresIn,
        email,
      })
      // Refleja la sesión en la UI (navbar) de inmediato.
      useAuthStore.getState().setAuthenticated(email)

      // Siembra la fila del customer en el primer login (idempotente). No es
      // fatal: si falla, el usuario igual entró; avisamos pero no bloqueamos.
      // La siembra de la fila es parte de tener una cuenta completa. Solo
      // mostramos éxito si de verdad quedó; si falla, error claro (no lo tapamos
      // con un "Bienvenido" como si todo hubiera salido bien).
      try {
        await ensureUserRow()
        toast.success('Bienvenido de vuelta')
      } catch (seedErr) {
        toast.error('Inició tu sesión, pero no se pudo crear tu perfil', {
          description:
            seedErr instanceof Error ? seedErr.message : 'Reintenta en un momento.',
        })
      }
      // Respeta ?next= (p.ej. cuando el middleware de /admin mandó aquí). Solo
      // rutas internas para evitar open-redirect.
      const next = params.get('next')
      const dest = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
      router.push(dest)
    } catch (err) {
      toast.error('Error al iniciar sesión', {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className={authLabelClass}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          className={authInputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className={authLabelClass}>
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          className={authInputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading} className={authButtonClass}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          'Iniciar sesión'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <Link href="/signup" className="font-semibold text-secondary hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  )
}

export default function LoginPage() {
  return (
    <AuthShell title="Iniciar sesión" subtitle="Accede a tu cuenta para comprar y ver tus pedidos.">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
