import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin, mapProduct, type SupabaseProduct } from '@/lib/supabase'

const PRODUCT_COLUMNS = 'id, name, description, price, category, available, image_url, created_at'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_COLUMNS)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Supabase error fetching product detail:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: mapProduct(data as SupabaseProduct) })
  } catch (error) {
    console.error('Error fetching product detail:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener el producto' }, { status: 500 })
  }
}

// PATCH - Actualizar producto (admin). Usa service_role para saltar RLS.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Falta SUPABASE_SERVICE_ROLE_KEY en el servidor' },
        { status: 500 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Mapea nombres del schema viejo al nuevo y solo toca campos enviados.
    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined || body.nombre !== undefined) updateData.name = body.name ?? body.nombre
    if (body.description !== undefined || body.descripcion !== undefined) updateData.description = body.description ?? body.descripcion
    if (body.price !== undefined || body.precio_venta !== undefined) updateData.price = Number(body.price ?? body.precio_venta)
    if (body.category !== undefined || body.categoria_id !== undefined) updateData.category = body.category ?? body.categoria_id
    if (body.image_url !== undefined || body.imagen_url !== undefined) updateData.image_url = body.image_url ?? body.imagen_url
    if (body.available !== undefined || body.visible_web !== undefined) updateData.available = body.available ?? body.visible_web

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select(PRODUCT_COLUMNS)
      .single()

    if (error) {
      console.error('Supabase error updating product:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: mapProduct(data as SupabaseProduct) })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ success: false, error: 'Error al actualizar producto' }, { status: 500 })
  }
}
