import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Reporte de ventas del día
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId') || ''
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    
    // Construir filtro de fecha
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    // Obtener ventas del día
    const sales = await db.sale.findMany({
      where: {
        status: 'completada',
        ...(locationId && { locationId }),
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        items: {
          include: { product: true },
        },
        cashier: true,
        location: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Calcular estadísticas
    const totalVentas = sales.length
    const totalIngresos = sales.reduce((acc, sale) => acc + sale.total, 0)
    const totalGanancia = sales.reduce((acc, sale) => {
      const ganancia = sale.items.reduce((a, item) => {
        return a + ((item.unitPrice - item.costPrice) * item.quantity)
      }, 0)
      return acc + ganancia
    }, 0)
    
    // Ventas por método de pago
    const ventasPorMetodo = {
      efectivo: sales.filter(s => s.paymentMethod === 'efectivo').reduce((acc, s) => acc + s.total, 0),
      tarjeta: sales.filter(s => s.paymentMethod === 'tarjeta').reduce((acc, s) => acc + s.total, 0),
      transferencia: sales.filter(s => s.paymentMethod === 'transferencia').reduce((acc, s) => acc + s.total, 0),
    }

    // Productos más vendidos
    const productosVendidos: Record<string, { name: string; quantity: number; total: number }> = {}
    
    for (const sale of sales) {
      for (const item of sale.items) {
        const key = item.product.name
        if (!productosVendidos[key]) {
          productosVendidos[key] = { name: item.product.name, quantity: 0, total: 0 }
        }
        productosVendidos[key].quantity += item.quantity
        productosVendidos[key].total += item.subtotal
      }
    }

    const productosMasVendidos = Object.values(productosVendidos)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    // Total de productos vendidos
    const totalProductosVendidos = sales.reduce((acc, sale) => {
      return acc + sale.items.reduce((a, item) => a + item.quantity, 0)
    }, 0)

    // Ticket promedio
    const ticketPromedio = totalVentas > 0 ? totalIngresos / totalVentas : 0

    return NextResponse.json({
      success: true,
      data: {
        fecha: date,
        ventas: sales,
        estadisticas: {
          totalVentas,
          totalIngresos,
          totalGanancia,
          totalProductosVendidos,
          ticketPromedio,
          ventasPorMetodo,
          productosMasVendidos,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ success: false, error: 'Error al generar reporte' }, { status: 500 })
  }
}
