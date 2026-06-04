'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Barcode, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePOSStore, CartItem } from '@/store/pos-store'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  barcode: string | null
  salePrice: number
  costPrice: number
  unit: string
  category: { name: string; color: string } | null
  inventory: { quantity: number; locationId: string }[]
}

export function ProductSearch() {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const addToCart = usePOSStore(state => state.addToCart)
  const locationId = usePOSStore(state => state.locationId)

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setProducts([])
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&locationId=${locationId}`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setLoading(false)
    }
  }, [locationId])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, searchProducts])

  const handleAddToCart = (product: Product) => {
    // Buscar el stock en la ubicación actual
    const inventoryItem = product.inventory.find(inv => inv.locationId === locationId)
    const stock = inventoryItem?.quantity || 0
    
    addToCart({
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      salePrice: product.salePrice,
      costPrice: product.costPrice,
      unit: product.unit,
      stock,
    })
    
    // Limpiar búsqueda después de agregar
    setSearch('')
    setProducts([])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar producto o escanear código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 h-12 text-lg"
            autoFocus
          />
          <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((product) => {
                const inventoryItem = product.inventory.find(inv => inv.locationId === locationId)
                const stock = inventoryItem?.quantity || 0
                const isLowStock = stock <= 5
                
                return (
                  <Card 
                    key={product.id} 
                    className={cn(
                      "cursor-pointer hover:shadow-md transition-all hover:border-primary/50 active:scale-[0.98]",
                      isLowStock && stock > 0 && "border-amber-300",
                      stock === 0 && "opacity-50"
                    )}
                    onClick={() => stock > 0 && handleAddToCart(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-medium truncate">{product.name}</span>
                          </div>
                          {product.category && (
                            <Badge 
                              variant="outline" 
                              className="text-xs mb-2"
                              style={{ borderColor: product.category.color, color: product.category.color }}
                            >
                              {product.category.name}
                            </Badge>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600">
                              ${product.salePrice.toFixed(2)}
                            </span>
                            <span className={cn(
                              "text-sm font-medium",
                              isLowStock ? "text-amber-600" : "text-muted-foreground"
                            )}>
                              Stock: {stock}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : search ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron productos para "{search}"
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Buscar productos</p>
              <p className="text-sm">Escribe el nombre o escanea el código de barras</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
