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
              <span className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary mb-6 block">Est. 1984 — Artisanal Quality</span>
              <h1 className="font-headline italic text-5xl md:text-7xl lg:text-8xl text-primary leading-[0.9] tracking-tight mb-8">
                Quesos, Jamones y Embutidos <br/> Gourmet
              </h1>
              <p className="font-body text-on-surface-variant text-lg max-w-md mb-10 leading-relaxed">
                Descubre nuestra selección de quesos artesanales, jamones ibéricos y tablas gourmet preparadas para cualquier ocasión especial.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/market">
                  <Button className="px-10 py-7 bg-primary text-on-primary rounded-lg font-label text-xs uppercase tracking-widest hover:brightness-110 transition-all editorial-shadow h-auto">
                    Explorar Market
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
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQtc1rI07tQiomRPEPzjcWkaSJ2OVh-IvtgkMqgITiTT2d9JhdJg4rRhG8ID7a4y-U6pRqCBiWzugprqfqXVp7QArwqz6yAOuGrODYt3amyiNBDFRUByOniqPmlMUYTKQhluEmMysDTH3NYIlAmyj-u1lH_KbAg3uWhfhTjt_Yf5Ak-P4AuLeog7iO7iNuTxKjmWYic5n6Ec6ceUO09j2jEe89ktXK2zKEMBCIybFox6GB9G6rnQKgKSnKdcrKi4BmgTX7fmQdZsGW"
                />
                <div className="absolute inset-0 bg-primary/5"></div>
              </div>
              {/* Decorative Floating Card */}
              <div className="absolute -bottom-10 -left-10 hidden md:block bg-surface-container-lowest p-6 rounded-xl editorial-shadow max-w-[240px]">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-4 h-4 text-secondary fill-secondary" />
                  <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">Best of 2024</span>
                </div>
                <p className="font-headline italic text-xl text-primary mb-2">Trufa Negra Selection</p>
                <p className="font-body text-xs text-on-surface-variant">Hand-picked by our Master Sommelier.</p>
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
              <p className="font-body text-on-surface-variant max-w-sm">From the rolling hills of Europe to local craft kitchens, explore our world-class pantry.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
              {/* Large Card */}
              <Link href="/market?categoria=quesos" className="md:col-span-7 relative group overflow-hidden rounded-xl bg-surface-container-lowest">
                <Image
                  alt="Dairy products"
                  fill
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2JGmdzslc-r7YcjgCgnbqrHtND0DzBcB4V_MqecvXi6J1nQrJbTJKmtMSnfizD6f0TJv31PJRTx78EYbL1hCpjR_NI1RtSRGEs2HZNwufSHVc_PHfxdoxAcREzd97-I5EaulmHzWBW4vfzRzZvNlzri3_jkIMcRLvZA3jVpAC-fHc8H1OAbKPd8KRWqi0iUBOd5rmYEte7EhFE_jwsXIQb_JWgded2_aScQCKuFWRo-VinlCci-J4QQ5hs4ScyZyNmWI2nudZljfw"
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
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp2BIWiCeGiTFpptkutV6yYVe_jXdlaWER2RBkwiocLFGFNw3F3Jvm0NWbl0TzbwhQoJV5BEtH8LB-SNoC5VPXE9rA8oVFXNWCf3xX3CYi3BmrxWUCS5K_31vQTGUInCsaXIpIWaY15IhJWpiV56Zwjc5b14TZfJn_VyXnAYUEjV7Acjo9yq9qgNZiL5sjU8FcXLprPEWQtehsyV_yIVTpk9OgkIcF8j5eXLB92TuVcZaVOIYsH5jpLP0ldrkcktVM15G9ENFAW9Wf"
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
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxbYrPEs4o0-k3MfpaVvEcc8UhpqnXlBH5k2Hm59OfiYOhZ4WkR9C_Bfl2pdM-sUSgthDnoORZdSaXm7BSinp2Di5NA4KBV0DreOTn4vQXOcGkv4YPYJNMFNFWDUq0ez8VtqeCB8DNieCQ5FqTRQa9aJ55XFmT9AkYbhAnPrEmozux9FSGBYW9MscW-XexdCQXoDwJsTGJyNtqQiNaak--5JvXUSSAj0OAa64dCS1WS5A_wkE1SsCKSLKBE24sTvxvqs69jXGAHa__"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="font-headline italic text-2xl text-on-primary">Tablas Gourmet</h3>
                  <div className="inline-flex items-center gap-2 text-on-primary/80 group-hover:text-on-primary font-label text-[10px] uppercase tracking-[0.2em] mt-2 transition-all">
                    Daily Bake
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
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv88QPySw2yctc2yoRPwwztU6euplBk2nuY7M2xpiQoED_9rLZT0qhuTB1RKyGNK1oQuH7odXdVxQaJn6UAqktWrtw2f956ivlu2fKOMu8pNiLCgY2NNNQLuelaiUxlMhJDA-IIXUqXkKikYxx9xo1pFS0-SBoN0DuPKC6eSZpNNO__d3rBq3wv-qizFyzA3ytf8IcwTBsEbLWrTzYOKiiKcFbiAelfqdExduwcUcV8HTByvNne1V2neuY7N2NO9F95aEK5-CZRGYf"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="font-label text-[10px] uppercase tracking-widest text-secondary mb-4 block">Product of the Month</span>
              <h2 className="font-headline text-5xl text-primary italic mb-8 leading-tight">Jamón Serrano Reserva <br/> Selección Premium </h2>
              <p className="font-body text-on-surface-variant text-lg mb-8 leading-relaxed">
                Curado durante más de 18 meses siguiendo métodos tradicionales. Su sabor intenso y textura delicada lo convierten en una de nuestras especialidades más apreciadas.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-4">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="font-label text-xs uppercase tracking-wide text-on-surface">100% Organic & Raw</span>
                </li>
                <li className="flex items-center gap-4">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="font-label text-xs uppercase tracking-wide text-on-surface">Sustainable Harvested</span>
                </li>
              </ul>
              <Button className="px-10 py-7 bg-primary text-on-primary rounded-lg font-label text-xs uppercase tracking-widest hover:brightness-110 transition-all editorial-shadow flex items-center gap-4 h-auto">
                Añadir al Carrito — $24.00
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Products from API */}
        <section className="py-24 px-8 bg-surface-container-low/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-16">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-secondary mb-2 block">Our Selection</span>
                <h2 className="font-headline text-4xl text-primary italic">Featured Products</h2>
              </div>
              <Link href="/market" className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2">
                View All <ArrowRight className="w-3 h-3" />
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

        {/* Newsletter Section */}
        <section className="bg-primary py-24 px-8 text-center text-on-primary">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-headline italic text-4xl md:text-5xl mb-6">Únete a la Familia</h2>
            <p className="font-body text-on-primary-container mb-12 opacity-90 leading-relaxed">
              Subscribe for exclusive early access to our seasonal batches and stories from our partner farms.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                className="flex-1 bg-primary-container/50 border border-on-primary-container/20 rounded-lg px-6 py-4 font-body text-on-primary placeholder:text-on-primary-container focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all"
                placeholder="Tu correo electrónico"
                type="email"
              />
              <Button className="bg-primary-fixed text-on-primary-fixed px-8 py-7 rounded-lg font-label text-xs uppercase tracking-widest font-bold hover:bg-primary-fixed-dim transition-all h-auto">
                Suscribirse
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
