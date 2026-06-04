import { Router } from 'express'
import prisma from '../../db/index.js'

const router = Router()

// GET - Listar ventas
router.get('/', async (req, res) => {
  try {
    const { locationId, sessionId, date, cashierId } = req.query
    
    // Construir filtros de fecha
    let dateFilter = {}
    if (date) {
      const startDate = new Date(date as string)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date as string)
      endDate.setHours(23, 59, 59, 999)
      dateFilter = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }
    }

    const sales = await prisma.sale.findMany({
      where: {
        status: 'completada',
        ...(locationId && { locationId: locationId as string }),
        ...(sessionId && { sessionId: sessionId as string }),
        ...(cashierId && { cashierId: cashierId as string }),
        ...dateFilter,
      },
      include: {
        items: {
          include: { product: true },
        },
        cashier: true,
        location: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    res.json({ success: true, data: sales })
  } catch (error) {
    console.error('Error fetching sales:', error)
    res.status(500).json({ success: false, error: 'Error al obtener ventas' })
  }
})

// GET - Obtener venta por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { include: { category: true } },
          },
        },
        cashier: true,
        location: true,
        session: true,
      },
    })

    if (!sale) {
      return res.status(404).json({ success: false, error: 'Venta no encontrada' })
    }

    res.json({ success: true, data: sale })
  } catch (error) {
    console.error('Error fetching sale:', error)
    res.status(500).json({ success: false, error: 'Error al obtener venta' })
  }
})

// POST - Crear nueva venta
router.post('/', async (req, res) => {
  try {
    const { locationId, cashierId, sessionId, items, paymentMethod, cashReceived, discount, notes } = req.body

    // Obtener el último número de factura
    const lastSale = await prisma.sale.findFirst({
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
      const product = await prisma.product.findUnique({
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
      const inventory = await prisma.inventory.findFirst({
        where: { productId: item.productId, locationId },
      })
      
      if (inventory) {
        await prisma.inventory.update({
          where: { id: inventory.id },
          data: { quantity: { decrement: item.quantity } },
        })
      }
    }

    const discountAmount = parseFloat(discount) || 0
    const total = subtotal - discountAmount
    const change = cashReceived ? parseFloat(cashReceived) - total : null

    // Crear la venta
    const sale = await prisma.sale.create({
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
        items: { include: { product: true } },
      },
    })

    res.json({ success: true, data: sale })
  } catch (error) {
    console.error('Error creating sale:', error)
    res.status(500).json({ success: false, error: 'Error al crear venta' })
  }
})

export default router
