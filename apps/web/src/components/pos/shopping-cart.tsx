'use client'

import { usePOSStore } from '@/store/pos-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function ShoppingCart() {
  const { cart, updateQuantity, removeFromCart, getSubtotal, discount, setDiscount, clearCart } = usePOSStore()
  const subtotal = getSubtotal()
  const total = Math.max(0, subtotal - discount)

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <ShoppingBag className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">Carrito vacío</p>
        <p className="text-sm">Agrega productos para comenzar</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {cart.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm truncate flex-1">{item.name}</span>
                  <span className="font-bold text-green-600 ml-2">
                    ${(item.salePrice * item.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      ${item.salePrice.toFixed(2)} c/u
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      <div className="border-t bg-background p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Descuento:</span>
          <Input
            type="number"
            value={discount || ''}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            className="h-8 w-24"
            placeholder="0.00"
            min="0"
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">Total</span>
          <span className="text-2xl font-bold text-green-600">${total.toFixed(2)}</span>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={clearCart}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Vaciar carrito
        </Button>
      </div>
    </div>
  )
}
