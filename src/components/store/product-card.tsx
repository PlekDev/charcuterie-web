'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  id: number
  name: string
  price: number
  category?: string
  stock: number
  imageUrl?: string | null
}

// Tarjeta de producto reutilizable (catálogo, landing, recomendaciones).
// Enlaza al detalle y tiene un botón rápido para agregar al carrito.
export function ProductCard({ id, name, price, category, stock, imageUrl }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  // Agrega 1 unidad al carrito sin navegar al detalle (evita el Link padre).
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: id.toString(),
      name,
      price,
      quantity: 1,
      imageUrl: imageUrl || undefined
    })
    toast.success(`${name} añadido al carrito`)
  }

  return (
    <Link
      href={`/product/${id}`}
      className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden editorial-shadow transition-transform duration-500 hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-container">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20">
            <span className="font-headline italic text-4xl">Charcutería</span>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 right-4 bg-primary text-on-primary p-3 rounded-full shadow-lg opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 active:scale-95"
          disabled={stock <= 0}
        >
          <Plus className="w-5 h-5" />
        </button>

        {stock <= 0 && (
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="font-label text-[10px] uppercase tracking-widest bg-error text-on-error px-3 py-1 rounded-full">Agotado</span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col gap-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col">
            <span className="font-label text-[10px] uppercase tracking-widest text-secondary mb-1">
              {category || 'Charcutería'}
            </span>
            <h3 className="font-headline italic text-xl text-primary leading-tight line-clamp-1">
              {name}
            </h3>
          </div>
          <span className="font-body font-bold text-primary">
            ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </Link>
  )
}
