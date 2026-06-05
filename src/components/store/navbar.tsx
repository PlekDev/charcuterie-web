'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingBasket, User, Menu, X, LogIn, LogOut, Package, UserCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { useAuthStore } from '@/store/auth-store'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0))

  const authStatus = useAuthStore((s) => s.status)
  const email = useAuthStore((s) => s.email)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = async () => {
    await logout()
    setMobileMenuOpen(false)
    toast.success('Sesión cerrada')
    router.push('/')
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Catálogo', href: '/market' },
    { name: 'Quesos', href: '/menu' },
    { name: 'Tablas Gourmet', href: '/deli' },
    { name: 'Nosotros', href: '/brands' },
    { name: 'Contacto', href: '/faq' },
  ]

  return (
    <header className={cn(
      "w-full top-0 sticky z-50 transition-all duration-300 border-b border-outline-variant/10",
      isScrolled ? "glass-nav py-3" : "bg-transparent py-4"
    )}>
      <nav className="flex justify-between items-center px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-headline font-bold text-primary tracking-tight">
            Charcutería Gourmet
          </Link>
          <div className="hidden md:flex items-center gap-8 font-label text-[10px] uppercase tracking-[0.2em]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "transition-colors hover:text-primary",
                    isActive ? "text-primary border-b-2 border-primary pb-1 font-semibold" : "text-on-surface-variant/60"
                  )}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/cart" className="p-2 hover:bg-stone-100/50 rounded-full transition-all active:scale-95 duration-150 relative text-primary">
            <ShoppingBasket className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-secondary text-on-secondary text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/*<Link href="/orders" title="Mis Pedidos" className="p-2 hover:bg-stone-100/50 rounded-full transition-all active:scale-95 duration-150 text-primary">
            <User className="w-5 h-5" />
          </Link>
          {authStatus === 'authenticated' ? (
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary hover:bg-primary-container transition-all active:scale-95 duration-150 font-label text-[10px] uppercase tracking-[0.2em] font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          ) : authStatus === 'unauthenticated' ? (
            <Link href="/login" title="Iniciar sesión" className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary hover:bg-primary-container transition-all active:scale-95 duration-150 font-label text-[10px] uppercase tracking-[0.2em] font-semibold">
              <LogIn className="w-4 h-4" />
              Entrar
            </Link>
          ) : null}*/}
          
          <DropdownMenu>
            <DropdownMenuTrigger
              title="Cuenta"
              className="p-2 hover:bg-stone-100/50 rounded-full transition-all active:scale-95 duration-150 text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <User className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {authStatus === 'authenticated' ? (
                <>
                  <DropdownMenuLabel className="truncate font-normal text-on-surface-variant/60">
                    {email ?? 'Mi cuenta'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      Mis pedidos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="cursor-pointer">
                      <LogIn className="mr-2 h-4 w-4" />
                      Iniciar sesión
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup" className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Crear cuenta
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            className="md:hidden p-2 text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-outline-variant/10 px-8 py-6 flex flex-col gap-4 font-label text-[10px] uppercase tracking-[0.2em]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "py-2",
                  isActive ? "text-primary font-bold" : "text-on-surface-variant/60"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            )
          })}
          <div className="border-t border-outline-variant/10 mt-2 pt-4 flex flex-col gap-4">
            {authStatus === 'authenticated' ? (
              <button
                onClick={handleLogout}
                className="text-left text-primary font-semibold"
              >
                Cerrar sesión
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-primary font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/signup"
                  className="text-on-surface-variant/60"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
