'use client'

import { useState, useEffect } from 'react'
import { Search, Package, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { usePOSStore } from '@/store/pos-store'

interface InventoryItem {
  id: string
  productId: string
  quantity: number
  minStock: number
  maxStock: number
  product: {
    id: string
    name: string
    barcode: string | null
    salePrice: number
    category: { name: string; color: string } | null
  }
  location: {
    id: string
    name: string
    type: string
  }
}

export function InventoryPanel() {
  const [search, setSearch] = useState('')
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const locationId = usePOSStore(state => state.locationId)
  const addToCart = usePOSStore(state => state.addToCart)

  const fetchInventory = async (query: string = '') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/inventory?locationId=${locationId}${query ? `&search=${query}` : ''}`)
      const data = await res.json()
      if (data.success) {
        setInventory(data.data)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [locationId])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock)
  const totalProducts = inventory.length
  const totalStock = inventory.reduce((acc, item) => acc + item.quantity, 0)

  const handleQuickSell = (item: InventoryItem) => {
    addToCart({
      id: item.product.id,
      name: item.product.name,
      barcode: item.product.barcode,
      salePrice: item.product.salePrice,
      costPrice: 0,
      unit: 'pieza',
      stock: item.quantity,
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background/95">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en inventario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 text-center">
              <Package className="h-5 w-5 mx-auto mb-1 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
              <p className="text-xs text-blue-600/70">Productos</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{totalStock}</p>
              <p className="text-xs text-green-600/70">Stock Total</p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-3 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-amber-600" />
              <p className="text-2xl font-bold text-amber-600">{lowStockItems.length}</p>
              <p className="text-xs text-amber-600/70">Stock Bajo</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="low" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Stock Bajo
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {inventory.map((item) => (
                <Card key={item.id} className={cn(
                  "hover:shadow-md transition-shadow",
                  item.quantity <= item.minStock && "border-amber-300 bg-amber-50/30"
                )}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{item.product.name}</span>
                          {item.quantity <= item.minStock && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              Stock bajo
                            </Badge>
                          )}
                        </div>
                        {item.product.category && (
                          <Badge 
                            variant="outline" 
                            className="text-xs mt-1"
                            style={{ borderColor: item.product.category.color, color: item.product.category.color }}
                          >
                            {item.product.category.name}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className={cn(
                            "text-xl font-bold",
                            item.quantity <= item.minStock ? "text-amber-600" : "text-green-600"
                          )}>
                            {item.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">Min: {item.minStock}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleQuickSell(item)}
                          disabled={item.quantity === 0}
                        >
                          Vender
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="low" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="font-medium">¡Todo bien!</p>
                  <p className="text-sm">No hay productos con stock bajo</p>
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <Card key={item.id} className="border-amber-300 bg-amber-50/30">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="font-medium truncate">{item.product.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Mínimo requerido: {item.minStock}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-amber-600">{item.quantity}</p>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleQuickSell(item)}
                            disabled={item.quantity === 0}
                          >
                            Vender
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
