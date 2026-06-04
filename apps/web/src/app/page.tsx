'use client'

import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  BarChart3, 
  Menu, 
  X,
  Store,
  User,
  LogOut,
  Settings
} from 'lucide-react'
import { ProductSearch } from '@/components/pos/product-search'
import { ShoppingCart as ShoppingCartComponent } from '@/components/pos/shopping-cart'
import { PaymentDialog } from '@/components/pos/payment-dialog'
import { InventoryPanel } from '@/components/pos/inventory-panel'
import { CashSessionPanel } from '@/components/pos/cash-session-panel'
import { usePOSStore } from '@/store/pos-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { API_URL } from '@/lib/api-config'

interface Location {
  id: string
  name: string
  type: string
}

export default function POSPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [activeTab, setActiveTab] = useState('pos')
  const [showPayment, setShowPayment] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const { locationId, setLocationId, cart, getTotal, sessionId, cashierId, setCashierId } = usePOSStore()
  
  // Cargar ubicaciones
  useEffect(() => {
    fetch(`${API_URL}/api/locations`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLocations(data.data)
          if (data.data.length > 0 && !locationId) {
            setLocationId(data.data[0].id)
          }
        }
      })
      .catch(console.error)
  }, [])

  // Simular login de cajero (en producción usar autenticación real)
  useEffect(() => {
    if (!cashierId) {
      // Usar el primer cajero del seed
      setCashierId('demo-cajero-id')
    }
  }, [cashierId, setCashierId])

  const handlePaymentSuccess = () => {
    toast.success('Venta completada exitosamente')
  }

  const total = getTotal()
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">La Casita</h1>
                <p className="text-xs text-gray-500">Sistema de Punto de Venta</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className="w-48">
                <Store className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Seleccionar sucursal" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(loc => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium hidden sm:block">Cajero</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation - Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex flex-col h-full">
            <nav className="flex-1 p-4 space-y-2">
              <Button
                variant={activeTab === 'pos' ? 'default' : 'ghost'}
                className="w-full justify-start gap-3"
                onClick={() => { setActiveTab('pos'); setSidebarOpen(false) }}
              >
                <ShoppingCart className="h-5 w-5" />
                Punto de Venta
              </Button>
              
              <Button
                variant={activeTab === 'inventory' ? 'default' : 'ghost'}
                className="w-full justify-start gap-3"
                onClick={() => { setActiveTab('inventory'); setSidebarOpen(false) }}
              >
                <Package className="h-5 w-5" />
                Inventario
              </Button>
              
              <Button
                variant={activeTab === 'cash' ? 'default' : 'ghost'}
                className="w-full justify-start gap-3"
                onClick={() => { setActiveTab('cash'); setSidebarOpen(false) }}
              >
                <DollarSign className="h-5 w-5" />
                Caja
              </Button>
              
              <Button
                variant={activeTab === 'reports' ? 'default' : 'ghost'}
                className="w-full justify-start gap-3"
                onClick={() => { setActiveTab('reports'); setSidebarOpen(false) }}
              >
                <BarChart3 className="h-5 w-5" />
                Reportes
              </Button>
            </nav>
            
            <div className="p-4 border-t">
              <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600">
                <Settings className="h-5 w-5" />
                Configuración
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex overflow-hidden">
          {/* POS Tab */}
          {activeTab === 'pos' && (
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Product Search Area */}
              <div className="flex-1 flex flex-col border-r bg-white">
                <ProductSearch />
              </div>
              
              {/* Cart Sidebar */}
              <div className="w-full lg:w-96 border-t lg:border-t-0 bg-white flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Carrito
                      {itemCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                          {itemCount}
                        </span>
                      )}
                    </h2>
                  </div>
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <ShoppingCartComponent />
                </div>
                
                {/* Payment Button */}
                <div className="p-4 border-t bg-gray-50">
                  <Button
                    className="w-full h-14 text-lg font-semibold"
                    disabled={cart.length === 0 || !sessionId}
                    onClick={() => setShowPayment(true)}
                  >
                    Cobrar ${total.toFixed(2)}
                  </Button>
                  {!sessionId && (
                    <p className="text-xs text-center text-amber-600 mt-2">
                      Abre una sesión de caja para poder cobrar
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="flex-1 bg-white">
              <InventoryPanel />
            </div>
          )}

          {/* Cash Session Tab */}
          {activeTab === 'cash' && (
            <div className="flex-1 bg-white">
              <CashSessionPanel />
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <ReportsPanel locationId={locationId} />
          )}
        </main>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

// Reports Panel Component
function ReportsPanel({ locationId }: { locationId: string }) {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (locationId) {
      fetchReport()
    }
  }, [locationId, date])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/reports?locationId=${locationId}&date=${date}`)
      const data = await res.json()
      if (data.success) {
        setReport(data.data)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Selecciona una ubicación para ver el reporte
      </div>
    )
  }

  const { estadisticas, ventas } = report

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reporte de Ventas</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Ventas</p>
            <p className="text-3xl font-bold">{estadisticas.totalVentas}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ingresos</p>
            <p className="text-3xl font-bold text-green-600">${estadisticas.totalIngresos.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ganancia Estimada</p>
            <p className="text-3xl font-bold text-blue-600">${estadisticas.totalGanancia.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ticket Promedio</p>
            <p className="text-3xl font-bold">${estadisticas.ticketPromedio.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Ventas por método de pago */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas por Método de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">${estadisticas.ventasPorMetodo.efectivo.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Efectivo</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">${estadisticas.ventasPorMetodo.tarjeta.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Tarjeta</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">${estadisticas.ventasPorMetodo.transferencia.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Transferencia</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Productos más vendidos */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {estadisticas.productosMasVendidos.map((prod: any, index: number) => (
              <div key={prod.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium">{prod.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{prod.quantity} unidades</p>
                  <p className="text-sm text-muted-foreground">${prod.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ventas.map((venta: any) => (
              <div key={venta.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-mono font-medium">{venta.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(venta.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${venta.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{venta.paymentMethod}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
