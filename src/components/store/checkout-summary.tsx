'use client'

import { useCartStore } from '@/store/cart-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, ChevronRight, Truck, Info } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { CheckoutModal } from './checkout-modal'

interface CheckoutSummaryProps {
  notes?: string
}

export function CheckoutSummary({ notes = '' }: CheckoutSummaryProps) {
  const { items, getTotal } = useCartStore()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const subtotal = getTotal()
  const shipping = subtotal > 500 ? 0 : 85
  const total = subtotal + shipping

  if (items.length === 0) return null

  return (
    <Card className="rounded-2xl border-black/5 shadow-xl bg-white overflow-hidden sticky top-32">
      <CardHeader className="p-8 border-b bg-casita-cream/20">
         <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-casita-terracotta">Resumen del pedido</span>
         </div>
         <CardTitle className="text-2xl font-serif font-bold text-casita-charcoal">Tu Compra</CardTitle>
      </CardHeader>

      <CardContent className="p-8 flex flex-col gap-6">
         <div className="flex flex-col gap-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {items.map(item => (
               <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                     <span className="w-5 h-5 rounded-full bg-casita-cream flex items-center justify-center text-[10px] font-bold text-casita-charcoal border border-black/5">
                        {item.quantity}
                     </span>
                     <span className="text-casita-charcoal font-medium line-clamp-1">{item.name}</span>
                  </div>
                  <span className="font-bold text-casita-charcoal">${(item.price * item.quantity).toFixed(2)}</span>
               </div>
            ))}
         </div>

         <div className="flex flex-col gap-3 pt-6 border-t border-black/5">
            <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Subtotal</span>
               <span className="text-casita-charcoal font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
               <span className="text-muted-foreground flex items-center gap-2">
                  Envío
                  {shipping === 0 && (
                     <span className="text-[9px] font-bold uppercase tracking-widest text-casita-olive bg-casita-olive/10 px-2 py-0.5 rounded-full">Gratis</span>
                  )}
               </span>
               <span className={shipping === 0 ? "text-casita-olive font-bold" : "text-casita-charcoal font-bold"}>
                  {shipping === 0 ? '$0.00' : `$${shipping.toFixed(2)}`}
               </span>
            </div>
         </div>

         <div className="pt-6 border-t border-black/5 flex items-center justify-between">
            <span className="text-lg font-serif font-bold text-casita-charcoal">Total</span>
            <span className="text-2xl font-bold text-casita-terracotta">${total.toFixed(2)}</span>
         </div>

         <Button
           onClick={() => setIsModalOpen(true)}
           className="w-full h-14 rounded-full bg-casita-charcoal hover:bg-casita-olive transition-all duration-300 font-bold uppercase tracking-[0.2em] text-[10px] gap-2 mt-4 shadow-lg group"
         >
            FINALIZAR PEDIDO <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
         </Button>

         <CheckoutModal
           isOpen={isModalOpen}
           onClose={() => setIsModalOpen(false)}
           notes={notes}
         />
      </CardContent>
    </Card>
  )
}
