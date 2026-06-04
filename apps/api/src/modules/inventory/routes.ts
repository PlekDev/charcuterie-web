import { Router } from 'express'
import prisma from '../../db/index.js'

const router = Router()

// GET - Consultar inventario
router.get('/', async (req, res) => {
  try {
    const { locationId, productId, lowStock } = req.query
    
    const inventory = await prisma.inventory.findMany({
      where: {
        ...(locationId && { locationId: locationId as string }),
        ...(productId && { productId: productId as string }),
        ...(lowStock === 'true' && { quantity: { lte: prisma.inventory.fields.minStock } }),
      },
      include: {
        product: { include: { category: true } },
        location: true,
      },
      orderBy: { product: { name: 'asc' } },
    })

    res.json({ success: true, data: inventory })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    res.status(500).json({ success: false, error: 'Error al obtener inventario' })
  }
})

// POST - Ajustar inventario
router.post('/', async (req, res) => {
  try {
    const { productId, locationId, quantity, type, reason, userId } = req.body

    // Obtener inventario actual
    let inventory = await prisma.inventory.findUnique({
      where: { productId_locationId: { productId, locationId } },
    })

    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: { productId, locationId, quantity: 0 },
      })
    }

    // Actualizar cantidad según tipo
    const newQuantity = type === 'entrada' 
      ? inventory.quantity + parseInt(quantity)
      : inventory.quantity - parseInt(quantity)

    if (newQuantity < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Stock insuficiente para esta operación' 
      })
    }

    const updated = await prisma.inventory.update({
      where: { id: inventory.id },
      data: { quantity: newQuantity },
    })

    // Registrar movimiento
    await prisma.movement.create({
      data: {
        type,
        toLocationId: type === 'entrada' ? locationId : null,
        fromLocationId: type === 'salida' ? locationId : null,
        reason,
        userId,
        items: {
          create: { productId, quantity: parseInt(quantity) },
        },
      },
    })

    res.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error adjusting inventory:', error)
    res.status(500).json({ success: false, error: 'Error al ajustar inventario' })
  }
})

export default router
