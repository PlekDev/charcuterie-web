import { Router } from 'express'
import prisma from '../../db/index.js'

const router = Router()

// GET - Obtener sesiones de caja
router.get('/', async (req, res) => {
  try {
    const { locationId, status, date } = req.query
    
    let dateFilter = {}
    if (date) {
      const startDate = new Date(date as string)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date as string)
      endDate.setHours(23, 59, 59, 999)
      dateFilter = {
        openedAt: { gte: startDate, lte: endDate },
      }
    }

    const sessions = await prisma.cashSession.findMany({
      where: {
        ...(locationId && { locationId: locationId as string }),
        ...(status && { status: status as string }),
        ...dateFilter,
      },
      include: {
        cashier: true,
        location: true,
        sales: { include: { items: { include: { product: true } } } },
      },
      orderBy: { openedAt: 'desc' },
      take: 50,
    })

    res.json({ success: true, data: sessions })
  } catch (error) {
    console.error('Error fetching cash sessions:', error)
    res.status(500).json({ success: false, error: 'Error al obtener sesiones' })
  }
})

// POST - Abrir nueva sesión de caja
router.post('/', async (req, res) => {
  try {
    const { locationId, cashierId, openingCash, notes } = req.body

    const existingSession = await prisma.cashSession.findFirst({
      where: { locationId, status: 'abierta' },
    })

    if (existingSession) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ya existe una sesión abierta en esta ubicación' 
      })
    }

    const session = await prisma.cashSession.create({
      data: {
        locationId,
        cashierId,
        openingCash: parseFloat(openingCash) || 0,
        notes,
      },
      include: { cashier: true, location: true },
    })

    res.json({ success: true, data: session })
  } catch (error) {
    console.error('Error creating cash session:', error)
    res.status(500).json({ success: false, error: 'Error al abrir sesión' })
  }
})

// PUT - Cerrar sesión de caja
router.put('/', async (req, res) => {
  try {
    const { sessionId, closingCash, notes } = req.body

    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
      include: { sales: true },
    })

    if (!session) {
      return res.status(404).json({ success: false, error: 'Sesión no encontrada' })
    }

    if (session.status === 'cerrada') {
      return res.status(400).json({ success: false, error: 'Esta sesión ya está cerrada' })
    }

    const totalSales = session.sales.reduce((acc, sale) => acc + sale.total, 0)
    const totalCash = session.sales
      .filter(s => s.paymentMethod === 'efectivo')
      .reduce((acc, sale) => acc + sale.total, 0)
    const totalCard = session.sales
      .filter(s => s.paymentMethod === 'tarjeta')
      .reduce((acc, sale) => acc + sale.total, 0)
    const totalTransfer = session.sales
      .filter(s => s.paymentMethod === 'transferencia')
      .reduce((acc, sale) => acc + sale.total, 0)
    const totalItems = session.sales.reduce((acc, sale) => {
      const items = sale.items?.length || 0
      return acc + items
    }, 0)

    const expectedCash = session.openingCash + totalCash
    const difference = (parseFloat(closingCash) || 0) - expectedCash

    const closed = await prisma.cashSession.update({
      where: { id: sessionId },
      data: {
        status: 'cerrada',
        closingCash: parseFloat(closingCash) || 0,
        expectedCash,
        difference,
        totalSales,
        totalCash,
        totalCard,
        totalTransfer,
        totalItems,
        closedAt: new Date(),
        notes,
      },
      include: {
        cashier: true,
        location: true,
        sales: { include: { items: { include: { product: true } } } },
      },
    })

    res.json({ success: true, data: closed })
  } catch (error) {
    console.error('Error closing cash session:', error)
    res.status(500).json({ success: false, error: 'Error al cerrar sesión' })
  }
})

export default router
