'use client'

import { Navbar } from '@/components/store/navbar'
import { Footer } from '@/components/store/footer'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, ChevronRight, Loader2 } from 'lucide-react'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/order-status'

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        const data = await res.json()
        if (data.success) setOrders(data.data)
      } catch (err) {
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 max-w-4xl mx-auto w-full">
        <div className="flex flex-col gap-2 mb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Historial</span>
          <h1 className="text-5xl font-serif font-bold text-on-surface">Mis Pedidos</h1>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-secondary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white border border-black/5 shadow-sm flex items-center justify-center">
              <Package className="h-9 w-9 text-muted-foreground/30" />
            </div>
            <p className="text-2xl font-serif italic text-on-surface">Todavía no tienes pedidos.</p>
            <Link href="/market">
              <Button className="h-12 px-10 rounded-full bg-primary text-on-primary hover:bg-primary-container">Ir al Market</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/order/${o.id}`}
                className="group bg-white rounded-2xl border border-black/5 shadow-sm p-6 flex items-center gap-6 hover:border-secondary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-sm font-bold text-on-surface font-mono">#{String(o.id).slice(0, 8)}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {' · '}{o.item_count} {o.item_count === 1 ? 'producto' : 'productos'}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest">
                  {ORDER_STATUS_LABELS[o.status as OrderStatus]}
                </span>
                <span className="text-lg font-bold text-on-surface">${o.total.toFixed(2)}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
