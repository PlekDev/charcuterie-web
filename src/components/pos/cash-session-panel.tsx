'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  CreditCard, 
  Banknote,
  Send,
  Clock,
  Check,
  XCircle,
  Loader2
} from 'lucide-react'
import { usePOSStore } from '@/store/pos-store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SessionData {
  id: string
  openingCash: number
  openedAt: string
  closingCash: number | null
  expectedCash: number | null
  difference: number | null
  totalSales: number
  totalCash: number
  totalCard: number
  totalTransfer: number
  totalItems: number
  status: string
  cashier: { name: string }
  location: { name: string }
  sales: Array<{
    id: string
    invoiceNumber: string
    total: number
    paymentMethod: string
    createdAt: string
    items: Array<{ quantity: number; product: { name: string } }>
  }>
}

export function CashSessionPanel() {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [showOpenDialog, setShowOpenDialog] = useState(false)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [openingCash, setOpeningCash] = useState('500')
  const [closingCash, setClosingCash] = useState('')
  
  const { locationId, cashierId, setSessionId } = usePOSStore()

  const fetchCurrentSession = async () => {
    try {
      const res = await fetch(`/api/cash-session?locationId=${locationId}&status=abierta`)
      const data = await res.json()
      if (data.success && data.data.length > 0) {
        setCurrentSession(data.data[0])
        setSessionId(data.data[0].id)
      } else {
        setCurrentSession(null)
        setSessionId(null)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    }
  }

  useEffect(() => {
    if (locationId) {
      fetchCurrentSession()
    }
  }, [locationId])

  const openSession = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cash-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          cashierId,
          openingCash: parseFloat(openingCash) || 0,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCurrentSession(data.data)
        setSessionId(data.data.id)
        setShowOpenDialog(false)
        toast.success('Sesión de caja abierta')
      } else {
        toast.error(data.error || 'Error al abrir sesión')
      }
    } catch (error) {
      toast.error('Error al abrir sesión')
    } finally {
      setLoading(false)
    }
  }

  const closeSession = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cash-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession?.id,
          closingCash: parseFloat(closingCash) || 0,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCurrentSession(null)
        setSessionId(null)
        setShowCloseDialog(false)
        toast.success('Sesión de caja cerrada')
      } else {
        toast.error(data.error || 'Error al cerrar sesión')
      }
    } catch (error) {
      toast.error('Error al cerrar sesión')
    } finally {
      setLoading(false)
    }
  }

  if (!currentSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Sin sesión activa</h3>
        <p className="text-muted-foreground text-center mb-4">
          Abre una sesión de caja para comenzar a registrar ventas
        </p>
        <Button onClick={() => setShowOpenDialog(true)}>
          Abrir Caja
        </Button>
        
        <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Abrir Caja</DialogTitle>
              <DialogDescription>
                Ingresa el efectivo inicial en caja
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Efectivo inicial</label>
                <Input
                  type="number"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  className="mt-2"
                  placeholder="0.00"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={openSession}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirmar Apertura
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-green-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium">Caja Abierta</span>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            {currentSession.location.name}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Fondo inicial</p>
              <p className="text-xl font-bold">${currentSession.openingCash.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Ventas del día</p>
              <p className="text-xl font-bold text-green-600">${currentSession.totalSales.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="p-4 border-b">
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Banknote className="h-5 w-5 mx-auto mb-1 text-green-600" />
              <p className="text-lg font-bold">${currentSession.totalCash.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Efectivo</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <CreditCard className="h-5 w-5 mx-auto mb-1 text-blue-600" />
              <p className="text-lg font-bold">${currentSession.totalCard.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Tarjeta</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Send className="h-5 w-5 mx-auto mb-1 text-purple-600" />
              <p className="text-lg font-bold">${currentSession.totalTransfer.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Transferencia</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium">Ventas Realizadas</h3>
          <Badge variant="secondary">{currentSession.sales.length}</Badge>
        </div>
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {currentSession.sales.map((sale) => (
              <Card key={sale.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{sale.invoiceNumber}</span>
                        <Badge variant="outline" className={cn(
                          sale.paymentMethod === 'efectivo' && "bg-green-50 text-green-700",
                          sale.paymentMethod === 'tarjeta' && "bg-blue-50 text-blue-700",
                          sale.paymentMethod === 'transferencia' && "bg-purple-50 text-purple-700"
                        )}>
                          {sale.paymentMethod}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sale.items.length} productos
                      </p>
                    </div>
                    <span className="font-bold text-green-600">${sale.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-4 border-t">
        <Button 
          className="w-full bg-red-500 hover:bg-red-600 text-white"
          onClick={() => setShowCloseDialog(true)}
        >
          Cerrar Caja
        </Button>
      </div>
      
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Corte de Caja</DialogTitle>
            <DialogDescription>
              Revisa el resumen y confirma el cierre
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Fondo inicial</p>
                <p className="text-xl font-bold">${currentSession.openingCash.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Ventas en efectivo</p>
                <p className="text-xl font-bold text-green-600">${currentSession.totalCash.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Ventas tarjeta</p>
                <p className="text-xl font-bold text-blue-600">${currentSession.totalCard.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Transferencias</p>
                <p className="text-xl font-bold text-purple-600">${currentSession.totalTransfer.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="p-4 bg-green-100 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Total de ventas</p>
              <p className="text-3xl font-bold text-green-600">${currentSession.totalSales.toFixed(2)}</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Efectivo esperado en caja</p>
              <p className="text-2xl font-bold text-blue-600">
                ${(currentSession.openingCash + currentSession.totalCash).toFixed(2)}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Efectivo real en caja</label>
              <Input
                type="number"
                value={closingCash}
                onChange={(e) => setClosingCash(e.target.value)}
                className="mt-2"
                placeholder="0.00"
              />
            </div>
            
            {closingCash && (
              <div className={cn(
                "p-4 rounded-lg text-center",
                parseFloat(closingCash) >= (currentSession.openingCash + currentSession.totalCash)
                  ? "bg-green-50"
                  : "bg-red-50"
              )}>
                <p className="text-sm text-muted-foreground">Diferencia</p>
                <p className={cn(
                  "text-2xl font-bold",
                  parseFloat(closingCash) >= (currentSession.openingCash + currentSession.totalCash)
                    ? "text-green-600"
                    : "text-red-600"
                )}>
                  ${(parseFloat(closingCash) - (currentSession.openingCash + currentSession.totalCash)).toFixed(2)}
                </p>
              </div>
            )}
            
            <Button 
              className="w-full" 
              onClick={closeSession}
              disabled={loading || !closingCash}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar Cierre de Caja
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
