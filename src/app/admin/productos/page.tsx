'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Producto tal como vive en chaputeria.products. La escritura la autoriza el
// RLS (products_write_admin -> is_admin()); aquí solo mandamos la query.
type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  available: boolean
  image_url: string | null
}

type FormState = {
  name: string
  price: string
  category: string
  description: string
  image_url: string
  available: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  price: '',
  category: '',
  description: '',
  image_url: '',
  available: true,
}

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabaseBrowser
      .from('products')
      .select('id, name, description, price, category, available, image_url')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('No se pudieron cargar los productos', { description: error.message })
    } else {
      setProducts((data as Product[]) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      price: String(p.price),
      category: p.category ?? '',
      description: p.description ?? '',
      image_url: p.image_url ?? '',
      available: p.available,
    })
    setDialogOpen(true)
  }

  const set =
    (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const price = Number(form.price)
    if (!form.name.trim()) return toast.error('El nombre es obligatorio')
    if (!Number.isFinite(price) || price <= 0) return toast.error('El precio debe ser mayor a 0')

    setSaving(true)
    // Solo mandamos columnas escribibles; id/timestamps los pone la DB.
    const payload = {
      name: form.name.trim(),
      price,
      category: form.category.trim() || null,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      available: form.available,
    }

    const { error } = editing
      ? await supabaseBrowser.from('products').update(payload).eq('id', editing.id)
      : await supabaseBrowser.from('products').insert(payload)

    setSaving(false)
    if (error) {
      toast.error(editing ? 'No se pudo actualizar' : 'No se pudo crear', {
        description: error.message,
      })
      return
    }
    toast.success(editing ? 'Producto actualizado' : 'Producto creado')
    setDialogOpen(false)
    load()
  }

  // Toggle de disponibilidad optimista; revierte si la DB rechaza.
  const toggleAvailable = async (p: Product) => {
    setProducts((list) =>
      list.map((x) => (x.id === p.id ? { ...x, available: !x.available } : x)),
    )
    const { error } = await supabaseBrowser
      .from('products')
      .update({ available: !p.available })
      .eq('id', p.id)
    if (error) {
      toast.error('No se pudo cambiar la disponibilidad', { description: error.message })
      setProducts((list) =>
        list.map((x) => (x.id === p.id ? { ...x, available: p.available } : x)),
      )
    }
  }

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return
    const { error } = await supabaseBrowser.from('products').delete().eq('id', p.id)
    if (error) {
      toast.error('No se pudo eliminar', { description: error.message })
      return
    }
    toast.success('Producto eliminado')
    setProducts((list) => list.filter((x) => x.id !== p.id))
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-primary">Productos</h1>
          <p className="text-sm text-on-surface-variant/60">
            Crea, edita y administra tu catálogo.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-on-primary hover:bg-primary-container">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      <div className="rounded-xl border border-outline-variant/10 bg-surface">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-sm text-on-surface-variant/60">
            Aún no hay productos. Crea el primero.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Disponible</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-on-surface">{p.name}</TableCell>
                  <TableCell>
                    {p.category ? (
                      <Badge variant="secondary">{p.category}</Badge>
                    ) : (
                      <span className="text-on-surface-variant/40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{money.format(p.price)}</TableCell>
                  <TableCell className="text-center">
                    <Switch checked={p.available} onCheckedChange={() => toggleAvailable(p)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(p)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={form.name} onChange={set('name')} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio (MXN)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.price}
                  onChange={set('price')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input id="category" value={form.category} onChange={set('category')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" rows={3} value={form.description} onChange={set('description')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">URL de imagen</Label>
              <Input id="image_url" value={form.image_url} onChange={set('image_url')} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-outline-variant/10 px-3 py-2">
              <Label htmlFor="available">Disponible para la venta</Label>
              <Switch
                id="available"
                checked={form.available}
                onCheckedChange={(v) => setForm((f) => ({ ...f, available: v }))}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary text-on-primary hover:bg-primary-container"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : editing ? (
                  'Guardar cambios'
                ) : (
                  'Crear producto'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
