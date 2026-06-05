'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'

// Resuelve el estado de sesión una sola vez al cargar la app (rehidrata el
// accessToken con la cookie de refresh). Montado en el layout para que CUALQUIER
// página conozca la sesión, no solo las que renderizan el navbar.
export function SessionInit() {
  const init = useAuthStore((s) => s.init)
  useEffect(() => {
    init()
  }, [init])
  return null
}
