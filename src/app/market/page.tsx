'use client'

import { Navbar } from '@/components/store/navbar'
import { Footer } from '@/components/store/footer'
import { ProductCard } from '@/components/store/product-card'
import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, ChevronDown, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function MarketPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products?visibleWeb=true'),
          fetch('/api/categories')
        ])

        const prodData = await prodRes.json()
        const catData = await catRes.json()

        if (prodData.success) setProducts(prodData.data)
        if (catData.success) setCategories(catData.data)
      } catch (err) {
        console.error('Error fetching market data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || p.categoria_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-12">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Catálogo de Productos</span>
           </div>
           <h1 className="text-5xl font-serif font-bold text-on-surface">Nuestra Selección Gourmet</h1>
           <p className="text-muted-foreground text-sm max-w-2xl">
               Descubre nuestra selección de quesos artesanales, jamones ibéricos,
               embutidos premium y tablas gourmet cuidadosamente seleccionadas.
           </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-black/5 pb-8">
           <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
              <input
                type="text"
                placeholder="Buscar quesos, jamones o embutidos..."
                className="w-full pl-12 pr-6 py-3 bg-white border border-black/5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>

           <div className="flex items-center gap-4 w-full md:w-auto">
              <Button
                variant="outline"
                className="flex-1 md:flex-none gap-2 rounded-full border-black/10 hover:border-secondary hover:text-secondary transition-all"
                onClick={() => setShowFilters(!showFilters)}
              >
                 <SlidersHorizontal className="h-4 w-4" />
                 Filtros
              </Button>
              <div className="flex items-center bg-white border border-black/10 rounded-full p-1 shadow-sm">
                 <button className="p-2 bg-on-surface text-white rounded-full">
                    <LayoutGrid className="h-4 w-4" />
                 </button>
                 <button className="p-2 hover:text-secondary rounded-full">
                    <List className="h-4 w-4" />
                 </button>
              </div>
              <div className="hidden lg:flex items-center gap-2 ml-4">
                 <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ordenar por:</span>
                 <button className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-secondary transition-colors">
                    Recomendados <ChevronDown className="h-3 w-3" />
                 </button>
              </div>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
           {/* Sidebar Filters */}
           {showFilters && (
              <aside className="lg:w-64 flex flex-col gap-10">
                 <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-on-surface">Categorías</h3>
                    <div className="flex flex-col gap-3">
                       <button
                         className={cn(
                           "text-sm font-medium text-left transition-colors",
                           selectedCategory === null ? "text-secondary" : "text-muted-foreground hover:text-on-surface"
                         )}
                         onClick={() => setSelectedCategory(null)}
                       >
                          Todas las categorías
                       </button>
                       {categories.map(cat => (
                          <button
                            key={cat.id}
                            className={cn(
                              "text-sm font-medium text-left transition-colors",
                              selectedCategory === cat.id ? "text-secondary" : "text-muted-foreground hover:text-on-surface"
                            )}
                            onClick={() => setSelectedCategory(cat.id)}
                          >
                             {cat.nombre}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-on-surface">Precio</h3>
                    <div className="flex flex-col gap-6">
                       <input type="range" className="w-full accent-secondary" />
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">$0</span>
                          <span className="text-xs font-bold">$500+</span>
                       </div>
                    </div>
                 </div>

                 <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-on-surface">Disponibilidad</h3>
                    <div className="flex flex-col gap-3">
                       <label className="flex items-center gap-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-on-surface transition-colors">
                          <input type="checkbox" className="rounded border-black/10 accent-secondary" />
                          En stock
                       </label>
                       <label className="flex items-center gap-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-on-surface transition-colors">
                          <input type="checkbox" className="rounded border-black/10 accent-secondary" />
                           Productos destacados
                       </label>
                    </div>
                 </div>
              </aside>
           )}

           {/* Product Grid */}
           <div className="flex-1">
              {loading ? (
                 <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1,2,3,4,5,6,7,8].map(i => (
                       <div key={i} className="flex flex-col gap-4 animate-pulse">
                          <div className="aspect-square bg-white rounded-lg border border-black/5" />
                          <div className="h-4 bg-white w-2/3 rounded" />
                          <div className="h-4 bg-white w-1/3 rounded" />
                       </div>
                    ))}
                 </div>
              ) : filteredProducts.length > 0 ? (
                 <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map(product => (
                       <ProductCard
                         key={product.id}
                         id={product.id}
                         name={product.nombre}
                         price={product.precio_venta}
                         category={product.categorias?.nombre}
                         stock={product.stock_actual}
                         imageUrl={product.imagen_url}
                       />
                    ))}
                 </div>
              ) : (
                 <div className="py-20 text-center flex flex-col items-center gap-4">
                    <p className="text-lg font-serif italic text-muted-foreground">No encontramos productos que coincidan con tu búsqueda.</p>
                    <Button
                      variant="link"
                      className="text-secondary font-bold uppercase tracking-widest"
                      onClick={() => {setSelectedCategory(null); setSearch('')}}
                    >
                       Limpiar filtros
                    </Button>
                 </div>
              )}
           </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
