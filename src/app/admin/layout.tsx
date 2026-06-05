'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { AdminShell } from '@/components/admin/admin-shell'

// El gate REAL de admin es server-side (src/middleware.ts): nadie llega aquí sin
// la cookie de role 'admin' firmada y vigente. Este componente ya no decide
// permisos; solo maneja el estado de UI: spinner mientras el store rehidrata la
// sesión en memoria (necesaria para el email del shell) y manda a /login si la
// sesión en memoria no existe.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const status = useAuthStore((s) => s.status)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (status !== 'authenticated') return null

  return <AdminShell>{children}</AdminShell>
}
