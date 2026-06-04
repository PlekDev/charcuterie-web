// Siembra un proveedor y stock de inventario para todos los productos.
// Necesario para que al confirmar un pedido el trigger de inventario
// (deduct_inventory_on_confirm) tenga stock que descontar.
//
// Uso:  node scripts/seed-inventory.mjs
//
// Lee las credenciales de .env.local (NEXT_PUBLIC_SUPABASE_URL y
// SUPABASE_SERVICE_ROLE_KEY).

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// --- cargar .env.local manualmente ---
const env = {}
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(url, key, { db: { schema: 'chaputeria' } })

const QTY = 100

async function main() {
  // 1. Proveedor (idempotente por email)
  const { data: supplier, error: supErr } = await supabase
    .from('suppliers')
    .upsert({ name: 'Proveedor General', email: 'proveedor@charcuteria.com' }, { onConflict: 'email' })
    .select('id')
    .single()
  if (supErr) throw supErr
  console.log('Proveedor:', supplier.id)

  // 2. Productos
  const { data: products, error: prodErr } = await supabase.from('products').select('id, name')
  if (prodErr) throw prodErr

  // 3. Inventario por producto (idempotente por product_id+supplier_id)
  const rows = products.map((p) => ({
    product_id: p.id,
    supplier_id: supplier.id,
    quantity: QTY,
    min_stock: 5,
  }))

  const { error: invErr } = await supabase
    .from('inventory_items')
    .upsert(rows, { onConflict: 'product_id,supplier_id' })
  if (invErr) throw invErr

  console.log(`Inventario sembrado: ${rows.length} productos con ${QTY} unidades cada uno ✅`)
}

main().catch((e) => {
  console.error('Error sembrando inventario:', e.message)
  process.exit(1)
})
