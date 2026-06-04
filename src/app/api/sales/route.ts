import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar ventas (Solo ventas completadas por defecto)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folio = searchParams.get('folio') || ''
    const canal = searchParams.get('canal') || ''
    
    const sales = await db.ventas.findMany({
      where: {
        ...(folio && { folio: { contains: folio } }),
        ...(canal && { canal }),
      },
      include: {
        detalle_venta: {
          include: {
            productos: true,
          },
        },
        usuarios: true,
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    })

    return NextResponse.json({ success: true, data: sales })
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener ventas' }, { status: 500 })
  }
}

// POST - Crear nueva venta (Checkout en línea)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, paymentMethod, notes } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'No hay productos en la venta' }, { status: 400 })
    }

    // Usar una transacción para asegurar la integridad de los datos
    const sale = await db.$transaction(async (tx) => {
      // 1. Generar Folio para venta Web
      const lastSale = await tx.ventas.findFirst({
        where: { folio: { startsWith: 'W' } },
        orderBy: { folio: 'desc' },
      })
      
      let nextFolio = 'W0001'
      if (lastSale) {
        const lastNum = parseInt(lastSale.folio.substring(1))
        nextFolio = `W${String(lastNum + 1).padStart(4, '0')}`
      }

      // 2. Validar stock y calcular totales (usando precios de la BD)
      let subtotal = 0
      const saleDetails = []
      const stockUpdates = []
      const movements = []

      for (const item of items) {
        const product = await tx.productos.findUnique({
          where: { id: parseInt(item.id) },
        })

        if (!product) {
          throw new Error(`Producto con ID ${item.id} no encontrado`)
        }

        if (product.stock_actual < item.quantity) {
          throw new Error(`Stock insuficiente para el producto: ${product.nombre}`)
        }

        const price = Number(product.precio_venta)
        const itemSubtotal = price * item.quantity
        subtotal += itemSubtotal

        saleDetails.push({
          producto_id: product.id,
          nombre_producto: product.nombre,
          cantidad: item.quantity,
          precio_unitario: price,
          subtotal: itemSubtotal,
        })

        // Preparar actualizaciones de stock y movimientos
        stockUpdates.push(
          tx.productos.update({
            where: { id: product.id },
            data: { stock_actual: { decrement: item.quantity } }
          })
        )

        movements.push({
          producto_id: product.id,
          tipo: 'venta',
          cantidad: -item.quantity,
          stock_antes: product.stock_actual,
          stock_despues: product.stock_actual - item.quantity,
          motivo: `Venta Web ${nextFolio}`,
        })
      }

      const total = subtotal // Por ahora no manejamos descuentos en web

      // 3. Crear la Venta
      const newSale = await tx.ventas.create({
        data: {
          folio: nextFolio,
          canal: 'web',
          subtotal,
          total,
          metodo_pago: paymentMethod || 'tarjeta',
          estado: 'completada',
          notas: notes || '',
          detalle_venta: {
            create: saleDetails
          }
        },
        include: {
          detalle_venta: true
        }
      })

      // 4. Ejecutar actualizaciones de stock y crear movimientos
      await Promise.all(stockUpdates)

      await tx.movimientos_inventario.createMany({
        data: movements.map(m => ({
          ...m,
          referencia_id: newSale.id
        }))
      })

      return newSale
    })

    return NextResponse.json({ success: true, data: sale })
  } catch (error: any) {
    console.error('Error creating web sale:', error)
    return NextResponse.json({ success: false, error: error.message || 'Error al procesar la venta' }, { status: 500 })
  }
}
