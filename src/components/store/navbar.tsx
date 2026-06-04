'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ShoppingBasket, User, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'

export function Navbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0))

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
          <button className="p-2 hover:bg-stone-100/50 rounded-full transition-all active:scale-95 duration-150 text-primary">
            <User className="w-5 h-5" />
          </button>
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
        </div>
      )}
    </header>
  )
}
