'use client'

import { useState } from 'react'
import { usePOSStore } from '@/store/pos-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Banknote, CreditCard, Send, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PaymentDialog({ open, onOpenChange, onSuccess }: PaymentDialogProps) {
  const { 
    cart, 
    paymentMethod, 
    setPaymentMethod, 
    cashReceived, 
    setCashReceived, 
    getTotal, 
    getChange,
    discount,
    locationId,
    cashierId,
    sessionId,
    clearCart
  } = usePOSStore()
  
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'method' | 'cash' | 'processing' | 'success'>('method')
  
  const total = getTotal()
  const change = getChange()

  const handlePayment = async () => {
    if (paymentMethod === 'efectivo' && cashReceived < total) {
      toast.error('El efectivo recibido es insuficiente')
      return
    }
    
    setLoading(true)
    setStep('processing')
    
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          cashierId,
          sessionId,
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          paymentMethod,
          cashReceived: paymentMethod === 'efectivo' ? cashReceived : null,
          discount,
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setStep('success')
        setTimeout(() => {
          onSuccess()
          clearCart()
          onOpenChange(false)
          setStep('method')
          setCashReceived(0)
        }, 2000)
      } else {
        toast.error(data.error || 'Error al procesar el pago')
        setStep('method')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('Error al procesar el pago')
      setStep('method')
    } finally {
      setLoading(false)
    }
  }

  const quickCashAmounts = [
    { label: '$50', value: 50 },
    { label: '$100', value: 100 },
    { label: '$200', value: 200 },
    { label: '$500', value: 500 },
    { label: 'Exacto', value: total },
  ]

  if (step === 'success') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">¡Venta completada!</h2>
            <p className="text-muted-foreground">El ticket se ha generado correctamente</p>
            {paymentMethod === 'efectivo' && change > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Cambio a entregar:</p>
                <p className="text-2xl font-bold text-blue-600">${change.toFixed(2)}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Procesar Pago</DialogTitle>
          <DialogDescription>
            Total a cobrar: <span className="text-2xl font-bold text-green-600">${total.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>
        
        {step === 'processing' ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Procesando pago...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Método de pago */}
            <div className="grid grid-cols-3 gap-3">
              <Card 
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  paymentMethod === 'efectivo' && "border-green-500 bg-green-50"
                )}
                onClick={() => setPaymentMethod('efectivo')}
              >
                <CardContent className="p-4 flex flex-col items-center">
                  <Banknote className={cn("h-6 w-6 mb-2", paymentMethod === 'efectivo' ? "text-green-600" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-medium", paymentMethod === 'efectivo' && "text-green-600")}>Efectivo</span>
                </CardContent>
              </Card>
              
              <Card 
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  paymentMethod === 'tarjeta' && "border-blue-500 bg-blue-50"
                )}
                onClick={() => setPaymentMethod('tarjeta')}
              >
                <CardContent className="p-4 flex flex-col items-center">
                  <CreditCard className={cn("h-6 w-6 mb-2", paymentMethod === 'tarjeta' ? "text-blue-600" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-medium", paymentMethod === 'tarjeta' && "text-blue-600")}>Tarjeta</span>
                </CardContent>
              </Card>
              
              <Card 
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  paymentMethod === 'transferencia' && "border-purple-500 bg-purple-50"
                )}
                onClick={() => setPaymentMethod('transferencia')}
              >
                <CardContent className="p-4 flex flex-col items-center">
                  <Send className={cn("h-6 w-6 mb-2", paymentMethod === 'transferencia' ? "text-purple-600" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-medium", paymentMethod === 'transferencia' && "text-purple-600")}>Transferencia</span>
                </CardContent>
              </Card>
            </div>
            
            {/* Efectivo recibido */}
            {paymentMethod === 'efectivo' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Efectivo recibido</label>
                  <Input
                    type="number"
                    value={cashReceived || ''}
                    onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                    className="text-xl h-12"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {quickCashAmounts.map((amount) => (
                    <Button
                      key={amount.label}
                      variant="outline"
                      size="sm"
                      onClick={() => setCashReceived(amount.value)}
                      className="flex-1 min-w-[60px]"
                    >
                      {amount.label}
                    </Button>
                  ))}
                </div>
                
                {cashReceived >= total && (
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Cambio</p>
                    <p className="text-3xl font-bold text-blue-600">${change.toFixed(2)}</p>
                  </div>
                )}
                
                {cashReceived > 0 && cashReceived < total && (
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <p className="text-sm text-red-600">Faltan ${(total - cashReceived).toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Botón de confirmar */}
            <Button 
              className="w-full h-12 text-lg"
              onClick={handlePayment}
              disabled={paymentMethod === 'efectivo' && cashReceived < total}
            >
              <Check className="h-5 w-5 mr-2" />
              Confirmar Pago
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
