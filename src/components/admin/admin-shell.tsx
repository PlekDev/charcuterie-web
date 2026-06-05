'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Package, LayoutDashboard, LogOut, Store, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'

// Layout del área /admin: sidebar fijo + contenido. Solo se renderiza para
// admins (el gate vive en admin/layout.tsx). Espeja la estructura del panel
// Taluna pero usando los design tokens de este repo.

const NAV = [
  { name: 'Resumen', href: '/admin', icon: LayoutDashboard },
  { name: 'Productos', href: '/admin/productos', icon: Package },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const email = useAuthStore((s) => s.email)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background text-foreground md:grid md:grid-cols-[240px_1fr]">
      {/* Sidebar — borde de color como diferenciador visual del modo admin */}
      <aside className="border-r-2 border-primary/40 bg-surface md:min-h-screen">
        <div className="flex h-16 items-center gap-2 px-6">
          <Link href="/admin" className="font-headline text-lg font-bold text-primary">
            Panel · Charcutería
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-primary">
            <ShieldCheck className="h-3 w-3" />
            Admin
          </span>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant/70 hover:bg-primary/5 hover:text-primary',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Contenido */}
      <div className="flex min-h-screen flex-col">
        {/* Franja superior: deja claro que estás DENTRO de la consola admin. */}
        <div className="h-1 w-full bg-primary" />
        <header className="flex h-16 items-center justify-between gap-4 border-b border-outline-variant/10 bg-surface px-6">
          <div className="flex items-center gap-2 truncate text-sm">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            <span className="font-semibold text-primary">Sesión admin</span>
            <span className="truncate text-on-surface-variant/60">· {email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-on-surface-variant/70 hover:text-primary"
            >
              <Store className="h-4 w-4" />
              Ver tienda
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary hover:bg-primary-container"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
