import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { ORDER_STATUSES, type OrderStatus } from '@/lib/orders'

const ORDER_SELECT =
  'id, status, total, allergy_notes, next_day_prep, scheduled_at, created_at, updated_at, ' +
  'order_items(id, quantity, unit_price, products(id, name, image_url))'

// GET - Consultar la información de un pedido (con sus productos)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }

    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(ORDER_SELECT)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Supabase error fetching order:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ success: false, error: 'Pedido no encontrado' }, { status: 404 })
    }

    const order = {
      id: data.id,
      status: data.status,
      total: Number(data.total),
      allergy_notes: data.allergy_notes,
      next_day_prep: data.next_day_prep,
      scheduled_at: data.scheduled_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
      items: (data.order_items ?? []).map((it: any) => ({
        id: it.id,
        quantity: it.quantity,
        unit_price: Number(it.unit_price),
        subtotal: Number(it.unit_price) * it.quantity,
        product_id: it.products?.id ?? null,
        name: it.products?.name ?? 'Producto',
        image_url: it.products?.image_url ?? null,
      })),
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ success: false, error: error.message ?? 'Error al obtener el pedido' }, { status: 500 })
  }
}

// PATCH - Actualizar el estado del pedido. body: { status }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }

    const { id } = await params
    const body = await request.json()
    const status = body.status as OrderStatus

    if (!ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Estado inválido. Debe ser uno de: ${ORDER_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('id, status, total, updated_at')
      .single()

    if (error) {
      // p.ej. al confirmar, el trigger de inventario puede fallar por falta de stock
      console.error('Supabase error updating order status:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json({ success: false, error: error.message ?? 'Error al actualizar el pedido' }, { status: 500 })
  }
}
