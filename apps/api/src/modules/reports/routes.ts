import { Router } from 'express'
import prisma from '../../db/index.js'

const router = Router()

// GET - Reporte de ventas del día
router.get('/', async (req, res) => {
  try {
    const { locationId, date } = req.query
    const reportDate = (date as string) || new Date().toISOString().split('T')[0]
    
    const startDate = new Date(reportDate)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(reportDate)
    endDate.setHours(23, 59, 59, 999)

    const sales = await prisma.sale.findMany({
      where: {
        status: 'completada',
        ...(locationId && { locationId: locationId as string }),
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        items: { include: { product: true } },
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

    const totalProductosVendidos = sales.reduce((acc, sale) => {
      return acc + sale.items.reduce((a, item) => a + item.quantity, 0)
    }, 0)

    const ticketPromedio = totalVentas > 0 ? totalIngresos / totalVentas : 0

    res.json({
      success: true,
      data: {
        fecha: reportDate,
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
    res.status(500).json({ success: false, error: 'Error al generar reporte' })
  }
})

export default router
