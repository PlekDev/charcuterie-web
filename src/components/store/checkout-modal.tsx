'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CreditCard, Lock, Loader2 } from 'lucide-react'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  notes: string
}

export function CheckoutModal({ isOpen, onClose, notes }: CheckoutModalProps) {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: ''
  })

  const subtotal = getTotal()
  const shipping = subtotal > 500 ? 0 : 85
  const total = subtotal + shipping

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulamos un delay de procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            quantity: item.quantity
          })),
          notes: notes
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('¡Pedido realizado con éxito!', {
          description: 'Te llevamos a la confirmación de tu pedido.'
        })
        clearCart()
        onClose()
        router.push(`/order/${data.data.id}`)
      } else {
        throw new Error(data.error || 'Error al procesar el pedido')
      }
    } catch (error: any) {
      toast.error('Error en el pago', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-surface border-none shadow-2xl">
        <DialogHeader className="gap-2">
          <div className="w-12 h-12 bg-on-surface rounded-full flex items-center justify-center mb-2">
            <CreditCard className="text-white h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-serif font-bold text-on-surface">Pago con Tarjeta</DialogTitle>
          <DialogDescription className="text-muted-foreground italic">
            Introduce los detalles de tu tarjeta para finalizar la compra de <span className="font-bold text-secondary">${total.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-on-surface">Nombre en la tarjeta</Label>
            <Input
              id="name"
              placeholder="JUAN PEREZ"
              required
              className="bg-white border-black/10 focus:border-secondary rounded-lg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-[10px] font-bold uppercase tracking-widest text-on-surface">Número de tarjeta</Label>
            <Input
              id="cardNumber"
              placeholder="0000 0000 0000 0000"
              required
              maxLength={19}
              className="bg-white border-black/10 focus:border-secondary rounded-lg"
              value={formData.cardNumber}
              onChange={(e) => {
                 const value = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()
                 setFormData({ ...formData, cardNumber: value })
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-[10px] font-bold uppercase tracking-widest text-on-surface">Expira (MM/AA)</Label>
              <Input
                id="expiry"
                placeholder="MM/AA"
                required
                maxLength={5}
                className="bg-white border-black/10 focus:border-secondary rounded-lg"
                value={formData.expiry}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '')
                  if (value.length > 2) value = value.substring(0, 2) + '/' + value.substring(2)
                  setFormData({ ...formData, expiry: value })
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv" className="text-[10px] font-bold uppercase tracking-widest text-on-surface">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                type="password"
                required
                maxLength={4}
                className="bg-white border-black/10 focus:border-secondary rounded-lg"
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
              />
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg flex gap-3 border border-primary/10">
            <Lock className="h-5 w-5 text-primary shrink-0" />
            <p className="text-[10px] text-primary font-medium leading-relaxed">
              Tu pago está encriptado y es 100% seguro. Nosotros no almacenamos los datos de tu tarjeta.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-full bg-primary text-on-primary hover:bg-primary-container transition-all font-bold uppercase tracking-[0.2em] text-[10px] shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                `Pagar $${total.toFixed(2)}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
