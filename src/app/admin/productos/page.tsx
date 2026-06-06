'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, Plus, Pencil, Trash2, Layers, UserPlus } from 'lucide-react'
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

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  available: boolean
  image_url: string | null
}

type Supplier = {
  id: string
  name: string
  email: string | null
}

type InventoryAllocation = {
  supplier_id: string
  quantity: number
  min_stock: number
}

type FormState = {
  name: string
  price: string
  category: string
  description: string
  image_url: string
  available: boolean
  allocations: InventoryAllocation[]
}

const EMPTY_FORM: FormState = {
  name: '',
  price: '',
  category: '',
  description: '',
  image_url: '',
  available: true,
  allocations: [],
}

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modals
  const [dialogOpen, setDialogOpen] = useState(false)
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false)
  
  // Form States
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [newSupplierName, setNewSupplierName] = useState('')
  const [newSupplierEmail, setNewSupplierEmail] = useState('')
  
  const [saving, setSaving] = useState(false)

  // Combined Data Fetching
  const loadData = useCallback(async () => {
    setLoading(true)
    
    // Fetch Products
    const { data: pData, error: pError } = await supabaseBrowser
      .from('products')
      .select('id, name, description, price, category, available, image_url')
      .order('created_at', { ascending: false })

    // Fetch Suppliers for selectors
    const { data: sData, error: sError } = await supabaseBrowser
      .from('suppliers')
      .select('id, name, email')
      .eq('active', true)
      .order('name', { ascending: true })

    if (pError) toast.error('Error cargando productos: ' + pError.message)
    if (sError) toast.error('Error cargando proveedores: ' + sError.message)

    if (pData) setProducts(pData as Product[])
    if (sData) setSuppliers(sData as Supplier[])
    
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // --- Product Open Actions ---
  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = async (p: Product) => {
    setEditing(p)
    
    // Fetch associated inventory records for this specific product
    const { data: invData } = await supabaseBrowser
      .from('inventory_items')
      .select('supplier_id, quantity, min_stock')
      .eq('product_id', p.id)

    setForm({
      name: p.name,
      price: String(p.price),
      category: p.category ?? '',
      description: p.description ?? '',
      image_url: p.image_url ?? '',
      available: p.available,
      allocations: (invData as InventoryAllocation[]) ?? [],
    })
    setDialogOpen(true)
  }

  const setField = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  // --- Inventory Item Allocations Logic (Many-to-Many UI) ---
  const addAllocationRow = () => {
    if (suppliers.length === 0) return toast.error('Registra un proveedor primero.')
    
    // Default pick first supplier not already explicitly listed
    const usedIds = form.allocations.map(a => a.supplier_id)
    const availableSupplier = suppliers.find(s => !usedIds.includes(s.id)) ?? suppliers[0]

    setForm(f => ({
      ...f,
      allocations: [...f.allocations, { supplier_id: availableSupplier.id, quantity: 0, min_stock: 5 }]
    }))
  }

  const updateAllocation = (index: number, key: keyof InventoryAllocation, val: string | number) => {
    setForm(f => {
      const updated = [...f.allocations]
      updated[index] = { ...updated[index], [key]: val }
      return { ...f, allocations: updated }
    })
  }

  const removeAllocationRow = (index: number) => {
    setForm(f => ({
      ...f,
      allocations: f.allocations.filter((_, i) => i !== index)
    }))
  }

  // --- Save Product & Inventory allocations Together ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    const price = Number(form.price)
    if (!form.name.trim()) return toast.error('El nombre es obligatorio')
    if (!Number.isFinite(price) || price <= 0) return toast.error('El precio debe ser mayor a 0')

    // Check for duplicate suppliers chosen in allocations
    const supplierIds = form.allocations.map(a => a.supplier_id)
    if (new Set(supplierIds).size !== supplierIds.length) {
      return toast.error('No puedes asignar un mismo proveedor duplicado a un producto.')
    }

    setSaving(true)

    const payload = {
      name: form.name.trim(),
      price,
      category: form.category.trim() || null,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      available: form.available,
    }

    let productId = editing?.id

    if (editing) {
      // 1. Update Product
      const { error } = await supabaseBrowser.from('products').update(payload).eq('id', editing.id)
      if (error) {
        toast.error('Error actualizando producto: ' + error.message)
        setSaving(false)
        return
      }
    } else {
      // 2. Insert Product and pull back generated UUID
      const { data, error } = await supabaseBrowser.from('products').insert(payload).select('id').single()
      if (error) {
        toast.error('Error creando producto: ' + error.message)
        setSaving(false)
        return
      }
      productId = data.id
    }

    if (productId) {
      // 3. Sync Inventory: Wipe old allocation states and overwrite completely
      // (This safely implements complete alignment with form allocations)
      await supabaseBrowser.from('inventory_items').delete().eq('product_id', productId)
      
      if (form.allocations.length > 0) {
        const inventoryPayload = form.allocations.map(alloc => ({
          product_id: productId,
          supplier_id: alloc.supplier_id,
          quantity: Number(alloc.quantity) || 0,
          min_stock: Number(alloc.min_stock) || 5,
          last_restocked: new Date().toISOString()
        }))

        const { error: invError } = await supabaseBrowser.from('inventory_items').insert(inventoryPayload)
        if (invError) toast.error('Producto guardado, pero falló el inventario: ' + invError.message)
      }
    }

    setSaving(false)
    toast.success(editing ? 'Producto e inventario actualizados' : 'Producto creado con inventario')
    setDialogOpen(false)
    loadData()
  }

  // --- Fast Supplier Registrations ---
  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSupplierName.trim()) return toast.error('Nombre de proveedor requerido')

    const { error } = await supabaseBrowser.from('suppliers').insert({
      name: newSupplierName.trim(),
      email: newSupplierEmail.trim() || null
    })

    if (error) {
      toast.error('Error guardando proveedor: ' + error.message)
    } else {
      toast.success('Proveedor añadido exitosamente')
      setNewSupplierName('')
      setNewSupplierEmail('')
      setSupplierDialogOpen(false)
      loadData()
    }
  }

  // --- Delete Executions ---
  const handleDeleteProduct = async (p: Product) => {
    if (!window.confirm(`¿Eliminar "${p.name}"? Se bloqueará si cuenta con dependencias en inventario activo.`)) return
    
    // Clean out inventory assignments first to avoid RESTRICT friction if you want a clean override cascade
    const { error: clearInvError } = await supabaseBrowser.from('inventory_items').delete().eq('product_id', p.id)
    if (clearInvError) {
      toast.error('No se pudo remover inventario viejo: ' + clearInvError.message)
      return
    }

    const { error } = await supabaseBrowser.from('products').delete().eq('id', p.id)
    if (error) {
      toast.error('No se pudo eliminar el producto: ' + error.message)
      return
    }
    toast.success('Producto eliminado permanentemente')
    setProducts((list) => list.filter((x) => x.id !== p.id))
  }

  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!window.confirm(`¿Remover proveedor "${name}"? Esto fallará de inmediato si tiene inventario registrado.`)) return
    
    const { error } = await supabaseBrowser.from('suppliers').delete().eq('id', id)
    if (error) {
      toast.error('Fallo al eliminar: El proveedor cuenta con registros de existencias activos (ON DELETE RESTRICT).')
      return
    }
    toast.success('Proveedor eliminado')
    loadData()
  }

  const toggleAvailable = async (p: Product) => {
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, available: !x.available } : x)))
    const { error } = await supabaseBrowser.from('products').update({ available: !p.available }).eq('id', p.id)
    if (error) {
      toast.error('Error de red', { description: error.message })
      setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, available: p.available } : x)))
    }
  }

  return (
    <div>
      {/* Header Management Options */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-primary">Panel de Control de Catálogo</h1>
          <p className="text-sm text-on-surface-variant/60">Gestiona productos, asigna existencias por proveedor y controla relaciones.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setSupplierDialogOpen(true)} variant="outline" className="border-primary text-primary">
            <UserPlus className="mr-2 h-4 w-4" /> Proveedores ({suppliers.length})
          </Button>
          <Button onClick={openCreate} className="bg-primary text-on-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Primary Products Matrix Display */}
      <div className="rounded-xl border border-outline-variant/10 bg-surface">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-sm text-on-surface-variant/60">No hay productos disponibles. Agrega uno nuevo.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Item</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio de Venta</TableHead>
                <TableHead className="text-center">Disponible</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-on-surface">{p.name}</TableCell>
                  <TableCell>{p.category ? <Badge variant="secondary">{p.category}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="text-right tabular-nums">{money.format(p.price)}</TableCell>
                  <TableCell className="text-center">
                    <Switch checked={p.available} onCheckedChange={() => toggleAvailable(p)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Editar Producto e Inventario">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProduct(p)}>
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

      {/* --- MODAL 1: CREATE / UPDATE PRODUCT & INVENTORY ITEMS RELATIONSHIPS --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Editar: ${editing.name}` : 'Registrar Nuevo Item de Catálogo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
            
            {/* Core Columns fields */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Comercial del Producto</Label>
              <Input id="name" value={form.name} onChange={setField('name')} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio Público (MXN)</Label>
                <Input id="price" type="number" step="0.01" min="0.01" value={form.price} onChange={setField('price')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría Base</Label>
                <Input id="category" placeholder="Ej. Lácteos, Vinos" value={form.category} onChange={setField('category')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Detalles / Notas de Producto</Label>
              <Textarea id="description" rows={2} value={form.description} onChange={setField('description')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">URL de la Imagen</Label>
              <Input id="image_url" value={form.image_url} onChange={setField('image_url')} />
            </div>

            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <Label htmlFor="available">Habilitar visibilidad inmediata para la venta</Label>
              <Switch id="available" checked={form.available} onCheckedChange={(v) => setForm((f) => ({ ...f, available: v }))} />
            </div>

            {/* MANY-TO-MANY INVENTORY SECTION */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Layers className="h-4 w-4" /> Asignación de Stock y Proveedores
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addAllocationRow}>
                  + Asignar Proveedor
                </Button>
              </div>

              {form.allocations.length === 0 ? (
                <p className="text-xs text-muted-foreground bg-slate-50 p-3 rounded text-center">
                  Este producto no cuenta con existencias vinculadas a ningún proveedor. Quedará en ceros.
                </p>
              ) : (
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                  {form.allocations.map((alloc, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded border border-slate-100">
                      <div className="col-span-5">
                        <Label className="text-[10px] text-slate-500">Proveedor</Label>
                        <select
                          className="w-full text-xs rounded border p-1 bg-white"
                          value={alloc.supplier_id}
                          onChange={(e) => updateAllocation(idx, 'supplier_id', e.target.value)}
                        >
                          {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <Label className="text-[10px] text-slate-500">Cantidad Actual</Label>
                        <Input
                          type="number"
                          className="h-7 text-xs"
                          min="0"
                          value={alloc.quantity}
                          onChange={(e) => updateAllocation(idx, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-[10px] text-slate-500">Stock Min.</Label>
                        <Input
                          type="number"
                          className="h-7 text-xs"
                          min="1"
                          value={alloc.min_stock}
                          onChange={(e) => updateAllocation(idx, 'min_stock', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1 pt-4 text-center">
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeAllocationRow(idx)}>
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 border-t">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Todo'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 2: CRUDE DIRECT SUPPLIER MANAGEMENT DIALOG --- */}
      <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Administrar Proveedores Base</DialogTitle>
          </DialogHeader>

          {/* Create Supplier Sub-form */}
          <form onSubmit={handleCreateSupplier} className="space-y-3 bg-slate-50 p-3 rounded-lg border mb-4">
            <p className="text-xs font-semibold text-slate-700">Agregar nuevo proveedor al catálogo</p>
            <div className="space-y-1">
              <Label htmlFor="sup_name" className="text-xs">Nombre Corporativo</Label>
              <Input id="sup_name" size={30} className="h-8 text-xs" placeholder="Ej. Lácteos San Juan" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sup_email" className="text-xs">Email Comercial (Opcional - Único)</Label>
              <Input id="sup_email" type="email" className="h-8 text-xs" placeholder="correo@proveedor.com" value={newSupplierEmail} onChange={e => setNewSupplierEmail(e.target.value)} />
            </div>
            <Button type="submit" size="sm" className="w-full text-xs h-8">Registrar Proveedor</Button>
          </form>

          {/* Inline List of Available Suppliers with Delete Trigger */}
          <Label className="text-xs text-slate-500 font-bold">Proveedores Activos Actuales ({suppliers.length})</Label>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {suppliers.map(s => (
              <div key={s.id} className="flex items-center justify-between text-xs p-2 rounded border bg-white shadow-sm">
                <div>
                  <p className="font-semibold text-slate-800">{s.name}</p>
                  {s.email && <p className="text-[10px] text-muted-foreground">{s.email}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSupplier(s.id, s.name)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}