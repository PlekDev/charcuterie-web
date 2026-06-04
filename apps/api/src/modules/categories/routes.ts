import { Router } from 'express'
import prisma from '../../db/index.js'

const router = Router()

// GET - Listar categorías
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    })

    res.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ success: false, error: 'Error al obtener categorías' })
  }
})

// POST - Crear categoría
router.post('/', async (req, res) => {
  try {
    const { name, description, color, icon } = req.body

    const category = await prisma.category.create({
      data: { name, description, color, icon },
    })

    res.json({ success: true, data: category })
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ success: false, error: 'Error al crear categoría' })
  }
})

export default router
