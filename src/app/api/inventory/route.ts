import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Consultar inventario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId') || ''
    const productId = searchParams.get('productId') || ''
    const lowStock = searchParams.get('lowStock') === 'true'
    
    const inventory = await db.inventory.findMany({
      where: {
        ...(locationId && { locationId }),
        ...(productId && { productId }),
        ...(lowStock && { quantity: { lte: db.inventory.fields.minStock } }),
      },
      include: {
        product: {
          include: { category: true },
        },
        location: true,
      },
      orderBy: { product: { name: 'asc' } },
    })

    return NextResponse.json({ success: true, data: inventory })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener inventario' }, { status: 500 })
  }
}

// POST - Ajustar inventario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, locationId, quantity, type, reason, userId } = body

    // Obtener inventario actual
    let inventory = await db.inventory.findUnique({
      where: {
        productId_locationId: { productId, locationId },
      },
    })

    if (!inventory) {
      // Crear registro de inventario si no existe
      inventory = await db.inventory.create({
        data: {
          productId,
          locationId,
          quantity: 0,
        },
      })
    }

    // Actualizar cantidad según tipo
    const newQuantity = type === 'entrada' 
      ? inventory.quantity + parseInt(quantity)
      : inventory.quantity - parseInt(quantity)

    if (newQuantity < 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Stock insuficiente para esta operación' 
      }, { status: 400 })
    }

    // Actualizar inventario
    const updated = await db.inventory.update({
      where: { id: inventory.id },
      data: { quantity: newQuantity },
    })

    // Registrar movimiento
    await db.movement.create({
      data: {
        type,
        toLocationId: type === 'entrada' ? locationId : null,
        fromLocationId: type === 'salida' ? locationId : null,
        reason,
        userId,
        items: {
          create: {
            productId,
            quantity: parseInt(quantity),
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error adjusting inventory:', error)
    return NextResponse.json({ success: false, error: 'Error al ajustar inventario' }, { status: 500 })
  }
}
