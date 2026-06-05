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

// Lee el role real del usuario por su cognito_id (server-only: usa service_role,
// salta RLS). Lo usan los route handlers de auth para firmar la cookie de role.
// Falla cerrado: ante error, sin fila, o sin service_role -> 'customer'.
export async function roleForCognitoSub(sub: string): Promise<'customer' | 'admin'> {
  if (!supabaseAdmin) {
    console.warn('roleForCognitoSub: falta SUPABASE_SERVICE_ROLE_KEY; asumiendo customer')
    return 'customer'
  }
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('cognito_id', sub)
    .maybeSingle()
  if (error || !data) return 'customer'
  return (data as { role?: string }).role === 'admin' ? 'admin' : 'customer'
}

// Devuelve el id de chaputeria.users para un sub de Cognito, o null si no existe.
// Server-only (service_role). Lo usa /api/orders para atribuir pedidos al usuario
// logueado en vez del demo.
export async function userIdForCognitoSub(sub: string): Promise<string | null> {
  if (!supabaseAdmin) return null
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('cognito_id', sub)
    .maybeSingle()
  if (error || !data) return null
  return (data as { id: string }).id
}

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
