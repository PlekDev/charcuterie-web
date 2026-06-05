'use client'

import { Navbar } from '@/components/store/navbar'
import { Footer } from '@/components/store/footer'
import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCircle2, Package, ChevronRight, Loader2 } from 'lucide-react'
import {
  ORDER_STATUS_LABELS,
  nextStatus,
  type OrderStatus,
} from '@/lib/order-status'

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`)
      const data = await res.json()
      if (data.success) setOrder(data.data)
    } catch (err) {
      console.error('Error fetching order:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const changeStatus = async (status: OrderStatus) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Estado actualizado: ${ORDER_STATUS_LABELS[status]}`)
        await fetchOrder()
      } else {
        throw new Error(data.error || 'No se pudo actualizar')
      }
    } catch (err: any) {
      toast.error('Error al actualizar el estado', { description: err.message })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-secondary" />
    </div>
  )

  if (!order) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center gap-4">
      <h1 className="text-4xl font-serif font-bold">Pedido no encontrado</h1>
      <Link href="/orders"><Button variant="outline" className="rounded-full">Ver mis pedidos</Button></Link>
    </div>
  )

  const status = order.status as OrderStatus
  const upcoming = nextStatus(status)
  const isCancelled = status === 'cancelled'

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 max-w-3xl mx-auto w-full">
        {/* Encabezado */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Pedido confirmado</span>
          <h1 className="text-4xl font-serif font-bold text-on-surface">¡Gracias por tu pedido!</h1>
          <p className="text-muted-foreground text-sm">
            Pedido <span className="font-mono font-bold">#{String(order.id).slice(0, 8)}</span> ·{' '}
            {new Date(order.created_at).toLocaleString('es-MX')}
          </p>
          <span className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest">
            <Package className="h-3.5 w-3.5" /> {ORDER_STATUS_LABELS[status]}
          </span>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-8 flex flex-col gap-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Productos</h2>
          <div className="flex flex-col divide-y divide-black/5">
            {order.items.map((it: any) => (
              <div key={it.id} className="py-4 flex items-center gap-4">
                <div className="relative h-14 w-14 bg-surface rounded-lg overflow-hidden border border-black/5 shrink-0">
                  {it.image_url ? (
                    <Image src={it.image_url} alt={it.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground/40 font-serif italic">
                      Charcutería
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">{it.name}</p>
                  <p className="text-xs text-muted-foreground">{it.quantity} × ${it.unit_price.toFixed(2)}</p>
                </div>
                <span className="text-sm font-bold text-on-surface">${it.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {order.allergy_notes && (
            <div className="text-sm bg-surface rounded-lg p-4">
              <span className="font-bold">Notas: </span>{order.allergy_notes}
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-black/5">
            <span className="text-lg font-serif font-bold text-on-surface">Total</span>
            <span className="text-2xl font-bold text-secondary">${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Gestión de estado (demo, sin admin todavía) */}
        <div className="mt-8 bg-white rounded-2xl border border-black/5 shadow-sm p-8 flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Gestión del pedido (demo)
          </h2>
          <div className="flex flex-wrap gap-3">
            {upcoming && !isCancelled && (
              <Button
                onClick={() => changeStatus(upcoming)}
                disabled={updating}
                className="rounded-full bg-primary text-on-primary hover:bg-primary-container gap-2"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                Avanzar a: {ORDER_STATUS_LABELS[upcoming]}
              </Button>
            )}
            {!isCancelled && status !== 'delivered' && (
              <Button
                onClick={() => changeStatus('cancelled')}
                disabled={updating}
                variant="outline"
                className="rounded-full border-error/30 text-error hover:bg-error/5"
              >
                Cancelar pedido
              </Button>
            )}
            {(isCancelled || status === 'delivered') && (
              <p className="text-sm text-muted-foreground italic">Este pedido ya está {ORDER_STATUS_LABELS[status].toLowerCase()}.</p>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href="/orders"><Button variant="outline" className="rounded-full px-8">Ver mis pedidos</Button></Link>
          <Link href="/market"><Button className="rounded-full px-8 bg-primary text-on-primary hover:bg-primary-container">Seguir comprando</Button></Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
