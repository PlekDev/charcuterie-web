'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Package, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Card } from '@/components/ui/card'

type Stats = { total: number; available: number; unavailable: number }

export default function AdminHomePage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    // Lee solo el flag de disponibilidad de cada producto para contar. El RLS
    // de admin deja ver todo (incluidos los no disponibles).
    supabaseBrowser
      .from('products')
      .select('available')
      .then(({ data, error }) => {
        if (error) {
          toast.error('No se pudo cargar el resumen', { description: error.message })
          setStats({ total: 0, available: 0, unavailable: 0 })
          return
        }
        const rows = (data as { available: boolean }[]) ?? []
        const available = rows.filter((r) => r.available).length
        setStats({ total: rows.length, available, unavailable: rows.length - available })
      })
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-primary">Resumen</h1>
        <p className="text-sm text-on-surface-variant/60">Una mirada rápida a tu catálogo.</p>
      </div>

      {!stats ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Metric label="Productos" value={stats.total} icon={Package} tone="text-primary" />
          <Metric label="Disponibles" value={stats.available} icon={CheckCircle2} tone="text-green-600" />
          <Metric label="No disponibles" value={stats.unavailable} icon={XCircle} tone="text-on-surface-variant/60" />
        </div>
      )}

      <div className="mt-6">
        <Link href="/admin/productos" className="text-sm font-semibold text-secondary hover:underline">
          Administrar productos →
        </Link>
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  tone: string
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="rounded-lg bg-primary/5 p-3">
        <Icon className={`h-6 w-6 ${tone}`} />
      </div>
      <div>
        <p className="text-sm text-on-surface-variant/60">{label}</p>
        <p className={`text-3xl font-bold ${tone}`}>{value}</p>
      </div>
    </Card>
  )
}
