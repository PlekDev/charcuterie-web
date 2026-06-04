'use client'

import { Navbar } from '@/components/store/navbar'
import { Footer } from '@/components/store/footer'
import { ProductCard } from '@/components/store/product-card'
import { useState, useEffect, use } from 'react'
import {
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Star,
  ChevronRight,
  Minus,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { toast } from 'sonner'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/products/${id}`)
        const data = await res.json()
        if (data.success) {
           const prod = data.data
           setProduct(prod)

           // Fetch recommendations based on category
           if (prod.categoria_id) {
             const recRes = await fetch(`/api/products?categoryId=${prod.categoria_id}&limit=4&excludeId=${id}`)
             const recData = await recRes.json()
             if (recData.success) setRecommendations(recData.data.filter((p: any) => p.id.toString() !== id))
           }
        }
      } catch (err) {
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return (
     <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
     </div>
  )

  if (!product) return (
     <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-serif font-bold mb-4">Producto no encontrado</h1>
        <Link href="/market">
           <Button variant="outline" className="rounded-full">Volver al Market</Button>
        </Link>
     </div>
  )

  const stock = product.stock_actual || 0
  const isOutOfStock = stock <= 0

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id.toString(),
      name: product.nombre,
      price: Number(product.precio_venta),
      quantity: quantity,
      imageUrl: product.imagen_url,
      stock: product.stock_actual
    })
    toast.success(`${product.nombre} añadido al carrito`, {
      description: `${quantity} unidades añadidas correctamente.`,
    })
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 max-w-7xl mx-auto w-full">
         {/* Breadcrumbs */}
         <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-12">
            <Link href="/" className="hover:text-secondary transition-colors">Inicio</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/market" className="hover:text-secondary transition-colors">Market</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-on-surface">{product.nombre}</span>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
            {/* Gallery */}
            <div className="flex flex-col gap-6">
               <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm">
                  {product.imagen_url ? (
                    <Image src={product.imagen_url} alt={product.nombre} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-serif text-4xl italic">
                       Charcutería Gourmet
                    </div>
                  )}
                  {isOutOfStock && (
                     <span className="absolute top-6 left-6 bg-on-surface text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">Agotado</span>
                  )}
               </div>
               {/* Thumbnail placeholder */}
               <div className="grid grid-cols-4 gap-4">
                  {[0,1,2,3].map(i => (
                     <button
                       key={i}
                       className={cn(
                         "aspect-square bg-white rounded-lg border overflow-hidden transition-all",
                         selectedImage === i ? "border-secondary ring-2 ring-secondary/10" : "border-black/5 opacity-60 hover:opacity-100"
                       )}
                       onClick={() => setSelectedImage(i)}
                     >
                        <div className="w-full h-full flex items-center justify-center text-[10px] italic text-muted-foreground">Vista {i+1}</div>
                     </button>
                  ))}
               </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col gap-8">
               <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">{product.categorias?.nombre || 'Gourmet'}</span>
                  </div>
                  <h1 className="text-5xl font-serif font-bold text-on-surface leading-tight">{product.nombre}</h1>
                  <div className="flex items-center gap-4 mt-2">
                     <p className="text-3xl font-bold text-secondary">${Number(product.precio_venta).toFixed(2)}</p>
                     <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-secondary text-secondary" />)}
                        <span className="text-xs text-muted-foreground ml-1">(12 reseñas)</span>
                     </div>
                  </div>
               </div>

               <p className="text-muted-foreground leading-relaxed">
                  {product.descripcion || 'Nuestra selección exclusiva de productos gourmet garantiza la mayor calidad y sabor para tus preparaciones. Curado especialmente por nuestros expertos para brindarte una experiencia gastronómica única.'}
               </p>

               <div className="flex flex-col gap-4 pt-4 border-t border-black/5">
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold uppercase tracking-widest text-on-surface">Cantidad</span>
                     <span className={cn(
                       "text-xs font-bold",
                       isOutOfStock ? "text-muted-foreground" : "text-primary"
                     )}>
                        {isOutOfStock ? 'Sin stock disponible' : `${stock} disponibles en tienda`}
                     </span>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex items-center bg-white border border-black/10 rounded-full p-1 h-14 w-32 shadow-sm">
                        <button
                          className="flex-1 flex justify-center hover:text-secondary disabled:opacity-30"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={isOutOfStock}
                        >
                           <Minus className="h-4 w-4" />
                        </button>
                        <span className="flex-1 text-center font-bold">{quantity}</span>
                        <button
                          className="flex-1 flex justify-center hover:text-secondary disabled:opacity-30"
                          onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                          disabled={isOutOfStock || quantity >= stock}
                        >
                           <Plus className="h-4 w-4" />
                        </button>
                     </div>
                     <Button
                       disabled={isOutOfStock}
                       onClick={handleAddToCart}
                       className="flex-1 h-14 bg-on-surface hover:bg-primary transition-all duration-300 rounded-full font-bold uppercase tracking-widest"
                     >
                        Añadir al Carrito
                     </Button>
                  </div>
                  <Button variant="outline" className="h-14 rounded-full border-black/10 font-bold uppercase tracking-widest gap-2">
                     <Heart className="h-4 w-4" /> Guardar en Favoritos
                  </Button>
               </div>

               {/* Trust Details */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-black/5">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/5 shadow-sm">
                     <Truck className="h-5 w-5 text-secondary" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Envíos Gratis</span>
                        <span className="text-xs text-muted-foreground">En compras mayor a $500</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/5 shadow-sm">
                     <ShieldCheck className="h-5 w-5 text-secondary" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Pago Seguro</span>
                        <span className="text-xs text-muted-foreground">Tarjeta & Transferencia</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Extended Content */}
         <div className="flex flex-col gap-12 mb-32">
            <div className="flex gap-12 border-b border-black/5 overflow-x-auto pb-4">
               {['Descripción', 'Ingredientes', 'Instrucciones', 'Reseñas'].map((tab, i) => (
                  <button key={tab} className={cn(
                    "text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap pb-2 border-b-2 transition-all",
                    i === 0 ? "text-on-surface border-secondary" : "text-muted-foreground border-transparent hover:text-on-surface"
                  )}>
                     {tab}
                  </button>
               ))}
            </div>
            <div className="max-w-3xl flex flex-col gap-6">
               <p className="text-muted-foreground leading-relaxed">
                  Este producto ha sido seleccionado cuidadosamente bajo los más altos estándares de calidad.
                  En Charcutería Gourmet nos enorgullecemos de ofrecer productos que no solo alimentan, sino que cuentan historias.
               </p>
               <ul className="flex flex-col gap-3">
                  {[
                    'Producto 100% artesanal',
                    'Sin conservadores artificiales',
                    'Empaque sustentable y biodegradable',
                    'Apoyo directo a productores locales'
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-on-surface font-medium">
                       <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                       {item}
                    </li>
                  ))}
               </ul>
            </div>
         </div>

         {/* Recommendations */}
         <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-2">
               <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">También te puede gustar</p>
               <h2 className="text-4xl font-serif font-bold text-on-surface">Recomendaciones del Deli</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
               {recommendations.length > 0 ? (
                  recommendations.map(prod => (
                    <ProductCard
                      key={prod.id}
                      id={prod.id}
                      name={prod.nombre}
                      price={prod.precio_venta}
                      category={prod.categorias?.nombre}
                      stock={prod.stock_actual}
                      imageUrl={prod.imagen_url}
                    />
                  ))
               ) : (
                  [1,2,3,4].map(i => <div key={i} className="aspect-[3/4] bg-white rounded-xl animate-pulse" />)
               )}
            </div>
         </div>
      </main>

      <Footer />
    </div>
  )
}
