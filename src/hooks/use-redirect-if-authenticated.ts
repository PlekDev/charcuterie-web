'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

// Si el usuario ya tiene sesión, no tiene caso que vea login/signup/confirm:
// lo mandamos al inicio. App customer-only -> no hay ruteo a panel admin aquí;
// un admin que entre se trata como customer.
export function useRedirectIfAuthenticated(to: string = '/') {
  const router = useRouter()
  const status = useAuthStore((s) => s.status)

  useEffect(() => {
    if (status === 'authenticated') router.replace(to)
  }, [status, to, router])

  return status
}
