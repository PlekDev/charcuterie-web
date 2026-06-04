import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !anonKey) {
  throw new Error(
    'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local'
  )
}

// Todas las tablas viven en el schema `chaputeria` (no en `public`).
// Recuerda exponerlo en Supabase: Settings > Data API > Exposed schemas.
const SCHEMA = 'chaputeria'

// Cliente público (anon). Respeta RLS. Sirve para lecturas públicas
// como el catálogo de productos. Seguro de usar en el navegador.
export const supabase = createClient(supabaseUrl, anonKey, {
  db: { schema: SCHEMA },
})

// Cliente admin (service_role). Ignora RLS — SOLO usar en el servidor
// (rutas API / server actions), nunca en componentes del navegador.
export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: SCHEMA },
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null

// Forma de una fila de chaputeria.products
export type SupabaseProduct = {
  id: string
  name: string
  description: string | null
  price: number | string
  category: string | null
  available: boolean
  image_url: string | null
  created_at?: string
  updated_at?: string
}

// Traduce un producto del schema nuevo a la forma (en español) que ya
// consume el front-end. Así no hay que reescribir la interfaz en Fase 1.
// NOTA: el stock real vive en chaputeria.inventory_items; mientras no
// conectemos el inventario, derivamos el stock de `available`.
export function mapProduct(p: SupabaseProduct) {
  return {
    id: p.id,
    nombre: p.name,
    descripcion: p.description,
    precio_venta: Number(p.price),
    precio_compra: 0,
    imagen_url: p.image_url,
    codigo_barras: null,
    stock_actual: p.available ? 99 : 0,
    stock_minimo: 0,
    activo: true,
    visible_web: p.available,
    categoria_id: p.category,
    categorias: p.category ? { id: p.category, nombre: p.category } : null,
    created_at: p.created_at,
  }
}
