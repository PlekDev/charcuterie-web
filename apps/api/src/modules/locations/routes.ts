import { Router } from 'express'
import prisma from '../../db/index.js'

const router = Router()

// GET - Listar ubicaciones
router.get('/', async (req, res) => {
  try {
    const { type } = req.query
    
    const locations = await prisma.location.findMany({
      where: {
        active: true,
        ...(type && { type: type as string }),
      },
      orderBy: { name: 'asc' },
    })

    res.json({ success: true, data: locations })
  } catch (error) {
    console.error('Error fetching locations:', error)
    res.status(500).json({ success: false, error: 'Error al obtener ubicaciones' })
  }
})

// POST - Crear ubicación
router.post('/', async (req, res) => {
  try {
    const { name, type, address } = req.body

    const location = await prisma.location.create({
      data: { name, type, address },
    })

    res.json({ success: true, data: location })
  } catch (error) {
    console.error('Error creating location:', error)
    res.status(500).json({ success: false, error: 'Error al crear ubicación' })
  }
})

export default router
