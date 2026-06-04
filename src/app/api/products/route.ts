import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin, mapProduct, type SupabaseProduct } from '@/lib/supabase'

// GET - Listar productos (catálogo) desde Supabase (schema chaputeria)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const excludeId = searchParams.get('excludeId') || ''
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('products')
      .select('id, name, description, price, category, available, image_url, created_at')
      .eq('available', true)
      .order('name', { ascending: true })
      .limit(limit)

    if (search) query = query.ilike('name', `%${search}%`)
    if (categoryId) query = query.eq('category', categoryId)
    if (excludeId) query = query.neq('id', excludeId)

    const { data, error } = await query

    if (error) {
      console.error('Supabase error fetching products:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const products = (data as SupabaseProduct[]).map(mapProduct)
    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener productos' }, { status: 500 })
  }
}

// POST - Crear nuevo producto (admin). Usa service_role para saltar RLS.
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Falta SUPABASE_SERVICE_ROLE_KEY en el servidor' },
        { status: 500 }
      )
    }

    const body = await request.json()
    // Acepta nombres del schema nuevo o del viejo (compatibilidad).
    const name = body.name ?? body.nombre
    const price = body.price ?? body.precio_venta
    const description = body.description ?? body.descripcion ?? null
    const category = body.category ?? body.categoria_id ?? null
    const image_url = body.image_url ?? body.imagen_url ?? null
    const available = body.available ?? body.visible_web ?? true

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'name y price son obligatorios' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({ name, description, price: Number(price), category, image_url, available })
      .select('id, name, description, price, category, available, image_url, created_at')
      .single()

    if (error) {
      console.error('Supabase error creating product:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: mapProduct(data as SupabaseProduct) })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ success: false, error: 'Error al crear producto' }, { status: 500 })
  }
}
