'use client'

import { Navbar } from '@/components/store/navbar'
import { Footer } from '@/components/store/footer'
import { CheckoutSummary } from '@/components/store/checkout-summary'
import { useCartStore } from '@/store/cart-store'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBasket,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const [notes, setNotes] = useState('')

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 max-w-7xl mx-auto w-full">
         <div className="flex items-center gap-4 mb-16">
            <Link href="/market" className="p-3 bg-white rounded-full border border-black/5 hover:text-secondary transition-colors shadow-sm group">
               <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="flex flex-col gap-2">
               <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Tu Selección</span>
               <h1 className="text-5xl font-serif font-bold text-on-surface">Mi Carrito</h1>
            </div>
         </div>

         {items.length === 0 ? (
            <div className="py-32 flex flex-col items-center text-center gap-8">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-black/5 shadow-xl">
                  <ShoppingBasket className="h-10 w-10 text-muted-foreground/30" />
               </div>
               <div className="flex flex-col gap-2">
                  <p className="text-2xl font-serif italic text-on-surface">Tu carrito se siente un poco vacío.</p>
                  <p className="text-muted-foreground text-sm">¿Qué tal si exploras nuestro market y descubres algo delicioso?</p>
               </div>
               <Link href="/market">
                  <Button className="h-14 px-12 rounded-full bg-on-surface hover:bg-primary transition-all font-bold uppercase tracking-[0.2em] text-[10px]">
                     Ir al Market
                  </Button>
               </Link>
            </div>
         ) : (
            <div className="flex flex-col gap-12">
               <div className="w-full overflow-hidden">
                  <div className="grid grid-cols-6 gap-4 pb-6 border-b border-black/5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                     <div className="col-span-3">Producto</div>
                     <div className="text-right">Precio</div>
                     <div className="text-center">Cantidad</div>
                     <div className="text-right">Total</div>
                  </div>

                  <div className="flex flex-col divide-y divide-black/5">
                     {items.map((item) => (
                        <div key={item.id} className="py-8 grid grid-cols-6 gap-4 items-center">
                           {/* Product Info */}
                           <div className="col-span-3 flex items-center gap-6">
                              <div className="relative h-20 w-20 bg-white rounded-lg overflow-hidden border border-black/5 shrink-0">
                                 {item.imageUrl ? (
                                   <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                 ) : (
                                   <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-serif italic text-xs">
                                      Charcutería Gourmet
                                   </div>
                                 )}
                              </div>
                              <h3 className="text-sm font-bold text-on-surface line-clamp-2">{item.name}</h3>
                           </div>

                           {/* Price */}
                           <div className="text-right text-sm font-medium text-on-surface">
                              ${Number(item.price).toFixed(2)}
                           </div>

                           {/* Quantity */}
                           <div className="flex flex-col items-center gap-2">
                              <div className="flex items-center bg-white border border-black/10 rounded-md h-10 w-24">
                                 <button
                                   className="flex-1 flex justify-center hover:text-secondary disabled:opacity-30"
                                   onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                   disabled={item.quantity <= 1}
                                 >
                                    <Minus className="h-3 w-3" />
                                 </button>
                                 <span className="flex-1 text-center text-sm font-bold">{item.quantity}</span>
                                 <button
                                   className="flex-1 flex justify-center hover:text-secondary disabled:opacity-30"
                                   onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                   disabled={item.stock !== undefined && item.quantity >= item.stock}
                                 >
                                    <Plus className="h-3 w-3" />
                                 </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-secondary flex items-center gap-1 transition-colors"
                              >
                                 Quitar <X className="h-3 w-3" />
                              </button>
                           </div>

                           {/* Total */}
                           <div className="text-right text-sm font-bold text-on-surface">
                              ${(Number(item.price) * item.quantity).toFixed(2)}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-12 border-t border-black/5">
                  <div className="flex flex-col gap-4">
                     <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Instrucciones de Recolección / Comentarios
                     </label>
                     <Textarea
                       placeholder="Agrega aquí cualquier instrucción especial..."
                       className="min-h-[120px] bg-white border-black/10 focus:border-secondary focus:ring-secondary/10 rounded-xl p-4"
                       value={notes}
                       onChange={(e) => setNotes(e.target.value)}
                     />
                  </div>

                  <div className="flex justify-end">
                     <CheckoutSummary notes={notes} />
                  </div>
               </div>
            </div>
         )}
      </main>

      <Footer />
    </div>
  )
}
