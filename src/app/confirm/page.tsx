'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import {
  AuthShell,
  authLabelClass,
  authInputClass,
  authButtonClass,
} from '@/components/auth/auth-shell'
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated'

function ConfirmForm() {
  useRedirectIfAuthenticated()
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length < 6) {
      toast.error('El código tiene 6 dígitos')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo confirmar')

      toast.success('Email confirmado', { description: 'Ya puedes iniciar sesión.' })
      router.push(`/login?email=${encodeURIComponent(email)}`)
    } catch (err) {
      toast.error('Error al confirmar', {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error('Escribe tu email para reenviar el código')
      return
    }
    setResending(true)
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo reenviar')
      toast.success('Código reenviado', { description: 'Revisa tu correo.' })
    } catch (err) {
      toast.error('Error al reenviar', {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className={authLabelClass}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          required
          className={authInputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label className={authLabelClass}>Código de verificación</Label>
        <div className="flex justify-center py-2">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <Button type="submit" disabled={loading} className={authButtonClass}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirmando...
          </>
        ) : (
          'Confirmar'
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground space-y-1">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-semibold text-secondary hover:underline disabled:opacity-50"
        >
          {resending ? 'Reenviando...' : 'Reenviar código'}
        </button>
        <p>
          <Link href="/login" className="hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </form>
  )
}

export default function ConfirmPage() {
  return (
    <AuthShell
      title="Verifica tu email"
      subtitle="Ingresa el código de 6 dígitos que te enviamos por correo."
    >
      <Suspense fallback={null}>
        <ConfirmForm />
      </Suspense>
    </AuthShell>
  )
}
