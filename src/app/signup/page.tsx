'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated'

// Lada de país (E.164). Cognito exige el formato +{lada}{numero}.
const COUNTRY_CODES = [
  { code: '+52', label: 'México (+52)' },
  { code: '+1', label: 'EE. UU. / Canadá (+1)' },
  { code: '+34', label: 'España (+34)' },
  { code: '+54', label: 'Argentina (+54)' },
  { code: '+56', label: 'Chile (+56)' },
  { code: '+57', label: 'Colombia (+57)' },
  { code: '+51', label: 'Perú (+51)' },
  { code: '+58', label: 'Venezuela (+58)' },
  { code: '+502', label: 'Guatemala (+502)' },
  { code: '+503', label: 'El Salvador (+503)' },
  { code: '+504', label: 'Honduras (+504)' },
  { code: '+506', label: 'Costa Rica (+506)' },
  { code: '+507', label: 'Panamá (+507)' },
  { code: '+593', label: 'Ecuador (+593)' },
  { code: '+591', label: 'Bolivia (+591)' },
  { code: '+595', label: 'Paraguay (+595)' },
  { code: '+598', label: 'Uruguay (+598)' },
]

export default function SignupPage() {
  useRedirectIfAuthenticated()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [dialCode, setDialCode] = useState(COUNTRY_CODES[0].code)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Solo dígitos del número local; se concatena con la lada para formar E.164.
      const digits = form.phone.replace(/\D/g, '')
      const phone = digits ? `${dialCode}${digits}` : undefined

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone,
        }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'No se pudo crear la cuenta')

      // userConfirmed===false (lo normal): Cognito mandó un código por email.
      if (data.userConfirmed) {
        toast.success('Cuenta creada', { description: 'Ya puedes iniciar sesión.' })
        router.push(`/login?email=${encodeURIComponent(form.email)}`)
      } else {
        toast.success('Cuenta creada', {
          description: 'Te enviamos un código de verificación por email.',
        })
        router.push(`/confirm?email=${encodeURIComponent(form.email)}`)
      }
    } catch (err) {
      toast.error('Error al registrarse', {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Crear cuenta" subtitle="Regístrate para comprar y dar seguimiento a tus pedidos.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className={authLabelClass}>
            Nombre
          </Label>
          <Input
            id="name"
            required
            autoComplete="name"
            className={authInputClass}
            value={form.name}
            onChange={set('name')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className={authLabelClass}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            className={authInputClass}
            value={form.email}
            onChange={set('email')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className={authLabelClass}>
            Teléfono
          </Label>
          <div className="flex gap-2">
            <select
              aria-label="Lada"
              className="h-10 rounded-lg border border-black/10 bg-white px-2 text-sm focus:border-secondary focus:outline-none"
              value={dialCode}
              onChange={(e) => setDialCode(e.target.value)}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="1234567890"
              className={`flex-1 ${authInputClass}`}
              value={form.phone}
              onChange={set('phone')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className={authLabelClass}>
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            className={authInputClass}
            value={form.password}
            onChange={set('password')}
          />
        </div>

        <Button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear cuenta'
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-secondary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
