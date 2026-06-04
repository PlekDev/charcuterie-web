import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar ventas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId') || ''
    const sessionId = searchParams.get('sessionId') || ''
    const date = searchParams.get('date') || ''
    const cashierId = searchParams.get('cashierId') || ''
    
    // Construir filtros de fecha
    let dateFilter = {}
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      dateFilter = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }
    }

    const sales = await db.sale.findMany({
      where: {
        status: 'completada',
        ...(locationId && { locationId }),
        ...(sessionId && { sessionId }),
        ...(cashierId && { cashierId }),
        ...dateFilter,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        cashier: true,
        location: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ success: true, data: sales })
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener ventas' }, { status: 500 })
  }
}

// POST - Crear nueva venta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locationId, cashierId, sessionId, items, paymentMethod, cashReceived, discount, notes } = body

    // Obtener el último número de factura
    const lastSale = await db.sale.findFirst({
      orderBy: { invoiceNumber: 'desc' },
    })
    
    let invoiceNumber = 'F0001'
    if (lastSale) {
      const lastNum = parseInt(lastSale.invoiceNumber.replace('F', ''))
      invoiceNumber = `F${String(lastNum + 1).padStart(4, '0')}`
    }

    // Calcular totales
    let subtotal = 0
    const saleItems = []
    
    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      })
      
      if (!product) continue
      
      const itemSubtotal = product.salePrice * item.quantity
      subtotal += itemSubtotal
      
      saleItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.salePrice,
        costPrice: product.costPrice,
        discount: 0,
        subtotal: itemSubtotal,
      })

      // Descontar del inventario
      const inventory = await db.inventory.findFirst({
        where: { productId: item.productId, locationId },
      })
      
      if (inventory) {
        await db.inventory.update({
          where: { id: inventory.id },
          data: { quantity: { decrement: item.quantity } },
        })
      }
    }

    const discountAmount = parseFloat(discount) || 0
    const total = subtotal - discountAmount
    const change = cashReceived ? parseFloat(cashReceived) - total : null

    // Crear la venta
    const sale = await db.sale.create({
      data: {
        invoiceNumber,
        locationId,
        cashierId,
        sessionId: sessionId || null,
        subtotal,
        discount: discountAmount,
        total,
        paymentMethod,
        cashReceived: cashReceived ? parseFloat(cashReceived) : null,
        change,
        notes,
        items: { create: saleItems },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: sale })
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json({ success: false, error: 'Error al crear venta' }, { status: 500 })
  }
}
