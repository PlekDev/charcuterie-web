import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { ensureDemoUser } from '@/lib/orders'

// GET - Historial de pedidos (del usuario demo por ahora)
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }

    const userId = await ensureDemoUser()

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id, status, total, allergy_notes, created_at, order_items(quantity)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching orders:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const orders = (data ?? []).map((o: any) => ({
      id: o.id,
      status: o.status,
      total: Number(o.total),
      allergy_notes: o.allergy_notes,
      created_at: o.created_at,
      item_count: (o.order_items ?? []).reduce((n: number, it: any) => n + it.quantity, 0),
    }))

    return NextResponse.json({ success: true, data: orders })
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ success: false, error: error.message ?? 'Error al obtener pedidos' }, { status: 500 })
  }
}

// POST - Crear un pedido a partir del carrito
// body: { items: [{ id: <product uuid>, quantity }], notes? }
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }

    const body = await request.json()
    const items: { id: string; quantity: number }[] = body.items ?? []
    const notes: string | null = body.notes?.trim() || null

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'El carrito está vacío' }, { status: 400 })
    }

    const userId = await ensureDemoUser()

    // 1. Crear el pedido (total arranca en 0 por trigger; estado 'pending')
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({ user_id: userId, allergy_notes: notes })
      .select('id')
      .single()

    if (orderErr) {
      console.error('Supabase error creating order:', orderErr)
      return NextResponse.json({ success: false, error: orderErr.message }, { status: 500 })
    }

    // 2. Insertar los items. El precio (unit_price) y el total los fija la DB
    //    automáticamente con triggers desde el catálogo.
    const rows = items.map((it) => ({
      order_id: order.id,
      product_id: it.id,
      quantity: Math.max(1, Number(it.quantity) || 1),
    }))

    const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(rows)

    if (itemsErr) {
      // Limpieza: si fallan los items, borrar el pedido vacío
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      console.error('Supabase error creating order_items:', itemsErr)
      return NextResponse.json({ success: false, error: itemsErr.message }, { status: 500 })
    }

    // 3. Releer el pedido ya con su total calculado
    const { data: finalOrder } = await supabaseAdmin
      .from('orders')
      .select('id, status, total, created_at')
      .eq('id', order.id)
      .single()

    return NextResponse.json({ success: true, data: finalOrder }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json({ success: false, error: error.message ?? 'Error al crear el pedido' }, { status: 500 })
  }
}
