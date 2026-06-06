'use client'

import { Navbar } from '@/components/store/navbar'
import { Footer } from '@/components/store/footer'
import { ProductCard } from '@/components/store/product-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false) // corrección hydration mismatch?

  useEffect(() => {
    setIsMounted(true) // corrección hydration mismatch?
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/products?visibleWeb=true')
        const data = await res.json()
        if (data.success) {
          setFeaturedProducts(data.data.slice(0, 4))
        }
      } catch (err) {
        console.error('Error fetching featured products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed-dim selection:text-primary">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-24 md:pt-24 md:pb-32 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 z-10">
              <span className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary mb-6 block">Desde 1984 — Calidad Artesanal</span>
              <h1 className="font-headline italic text-5xl md:text-7xl lg:text-8xl text-primary leading-[0.9] tracking-tight mb-8">
                Quesos, Jamones y Embutidos <br/> Gourmet
              </h1>
              <p className="font-body text-on-surface-variant text-lg max-w-md mb-10 leading-relaxed">
                Descubre nuestra selección de quesos artesanales, jamones ibéricos y tablas gourmet preparadas para cualquier ocasión especial.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/market">
                  <Button className="px-10 py-7 bg-primary text-on-primary rounded-lg font-label text-xs uppercase tracking-widest hover:brightness-110 transition-all editorial-shadow h-auto">
                    Ver Catálogo
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" className="px-10 py-7 bg-transparent text-primary rounded-lg font-label text-xs uppercase tracking-widest border border-outline-variant/30 hover:bg-surface-container-low transition-all h-auto">
                    Nuestra Historia
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden editorial-shadow group">
                <Image
                  alt="Artisanal food board"
                  fill
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://rrwoycsdxiaaesifzwut.supabase.co/storage/v1/object/public/productos_fotos/home_main.jpeg"
                />
                <div className="absolute inset-0 bg-primary/5"></div>
              </div>
              {/* Decorative Floating Card */}
              <div className="absolute -bottom-10 -left-10 hidden md:block bg-surface-container-lowest p-6 rounded-xl editorial-shadow max-w-[240px]">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-4 h-4 text-secondary fill-secondary" />
                  <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">PRODUCTO DESTACADO</span>
                </div>
                <p className="font-headline italic text-xl text-primary mb-2">Tabla Gourmet Especial</p>
                <p className="font-body text-xs text-on-surface-variant">Seleccionado por nuestros expertos en charcutería</p>
              </div>
            </div>
          </div>
        </section>

        {/* Category Bento Grid */}
        <section className="bg-surface-container-low py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div className="max-w-2xl">
                <h2 className="font-headline text-4xl md:text-5xl text-primary italic mb-6">Categorías Destacadas</h2>
                <div className="h-px w-24 bg-secondary-fixed-dim"></div>
              </div>
              <p className="font-body text-on-surface-variant max-w-sm">Trabajamos con productores seleccionados para ofrecer quesos, embutidos y especialidades gourmet de la más alta calidad.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
              {/* Large Card */}
              <Link href="/market?categoria=quesos" className="md:col-span-7 relative group overflow-hidden rounded-xl bg-surface-container-lowest">
                <Image
                  alt="Dairy products"
                  fill
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://rrwoycsdxiaaesifzwut.supabase.co/storage/v1/object/public/productos_fotos/home_quesos.jpeg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <span className="bg-secondary-fixed text-on-secondary-fixed px-4 py-1 rounded-full font-label text-[10px] uppercase tracking-widest mb-4 inline-block">Quesería & Lácteos</span>
                  <h3 className="font-headline italic text-3xl text-on-primary">Quesos Artesanales</h3>
                  <div className="inline-flex items-center gap-2 text-on-primary/80 group-hover:text-on-primary font-label text-[10px] uppercase tracking-[0.2em] mt-4 transition-all">
                    Ver Colección <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
              {/* Top Right */}
              <Link href="/market?categoria=embutidos" className="md:col-span-5 relative group overflow-hidden rounded-xl bg-surface-container-lowest">
                <Image
                  alt="Charcuterie"
                  fill
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://rrwoycsdxiaaesifzwut.supabase.co/storage/v1/object/public/productos_fotos/home_carnes.jpeg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="font-headline italic text-2xl text-on-primary">Embutidos Ibéricos</h3>
                  <div className="inline-flex items-center gap-2 text-on-primary/80 group-hover:text-on-primary font-label text-[10px] uppercase tracking-[0.2em] mt-2 transition-all">
                    Shop Charcuterie
                  </div>
                </div>
              </Link>
              {/* Bottom Right Small */}
              <Link href="/market?categoria=panaderia" className="md:col-span-5 relative group overflow-hidden rounded-xl bg-surface-container-lowest">
                <Image
                  alt="Bakery"
                  fill
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://rrwoycsdxiaaesifzwut.supabase.co/storage/v1/object/public/productos_fotos/home_tablasgourmet.jpeg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="font-headline italic text-2xl text-on-primary">Tablas Gourmet</h3>
                  <div className="inline-flex items-center gap-2 text-on-primary/80 group-hover:text-on-primary font-label text-[10px] uppercase tracking-[0.2em] mt-2 transition-all">
                    Ver Colección
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Product Highlight (Editorial Feature) */}
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="bg-surface-container-high rounded-full w-64 h-64 absolute -top-10 -right-10 -z-10"></div>
              <div className="aspect-square bg-surface-container rounded-xl overflow-hidden editorial-shadow p-8 flex items-center justify-center relative">
                <Image
                  alt="Featured Product"
                  fill
                  className="w-full h-full object-contain mix-blend-multiply p-12"
                  src="https://rrwoycsdxiaaesifzwut.supabase.co/storage/v1/object/public/productos_fotos/home_jamonreserva.jpeg"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="font-label text-[10px] uppercase tracking-widest text-secondary mb-4 block">Producto del Mes</span>
              <h2 className="font-headline text-5xl text-primary italic mb-8 leading-tight">Jamón Serrano Reserva <br/> Selección Premium </h2>
              <p className="font-body text-on-surface-variant text-lg mb-8 leading-relaxed">
                Curado durante más de 18 meses siguiendo métodos tradicionales. Su sabor intenso y textura delicada lo convierten en una de nuestras especialidades más apreciadas.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-4">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="font-label text-xs uppercase tracking-wide text-on-surface">Selección Premiumw</span>
                </li>
                <li className="flex items-center gap-4">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="font-label text-xs uppercase tracking-wide text-on-surface">Curación Tradicionald</span>
                </li>
              </ul>
              <Button className="px-10 py-7 bg-primary text-on-primary rounded-lg font-label text-xs uppercase tracking-widest hover:brightness-110 transition-all editorial-shadow flex items-center gap-4 h-auto">
                Ver Producto
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Products from API */}
        <section className="py-24 px-8 bg-surface-container-low/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-16">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-secondary mb-2 block">Nuestra Selección</span>
                <h2 className="font-headline text-4xl text-primary italic">Productos Destacados</h2>
              </div>
              <Link href="/market" className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2">
                Ver Todo<ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-surface-container animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.nombre}
                    price={product.precio_venta}
                    category={product.categorias?.nombre}
                    stock={product.stock_actual}
                    imageUrl={product.imagen_url}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
