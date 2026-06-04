import { Router } from 'express'
import prisma from '../../db/index.js'

const router = Router()

// GET - Listar productos con búsqueda y filtro
router.get('/', async (req, res) => {
  try {
    const { search, categoryId, barcode, locationId } = req.query
    
    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(search && {
          OR: [
            { name: { contains: search as string } },
            { barcode: { contains: search as string } },
            { sku: { contains: search as string } },
          ]
        }),
        ...(categoryId && { categoryId: categoryId as string }),
        ...(barcode && { barcode: barcode as string }),
      },
      include: {
        category: true,
        inventory: locationId ? {
          where: { locationId: locationId as string },
        } : true,
      },
      orderBy: { name: 'asc' },
      take: 100,
    })

    res.json({ success: true, data: products })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ success: false, error: 'Error al obtener productos' })
  }
})

// GET - Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: {
          include: { location: true },
        },
      },
    })

    if (!product) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' })
    }

    res.json({ success: true, data: product })
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ success: false, error: 'Error al obtener producto' })
  }
})

// POST - Crear nuevo producto
router.post('/', async (req, res) => {
  try {
    const { name, barcode, sku, description, categoryId, costPrice, salePrice, unit, imageUrl, initialStock, locationId } = req.body

    const product = await prisma.product.create({
      data: {
        name,
        barcode: barcode || null,
        sku: sku || null,
        description,
        categoryId: categoryId || null,
        costPrice: parseFloat(costPrice) || 0,
        salePrice: parseFloat(salePrice) || 0,
        unit: unit || 'pieza',
        imageUrl,
      },
    })

    // Si se especifica stock inicial, crear registro de inventario
    if (initialStock && locationId) {
      await prisma.inventory.create({
        data: {
          productId: product.id,
          locationId,
          quantity: parseInt(initialStock),
        },
      })
    }

    res.json({ success: true, data: product })
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({ success: false, error: 'Error al crear producto' })
  }
})

// PUT - Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, barcode, sku, description, categoryId, costPrice, salePrice, unit, imageUrl, active } = req.body

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        barcode: barcode || null,
        sku: sku || null,
        description,
        categoryId: categoryId || null,
        costPrice: parseFloat(costPrice) || 0,
        salePrice: parseFloat(salePrice) || 0,
        unit: unit || 'pieza',
        imageUrl,
        active: active ?? true,
      },
    })

    res.json({ success: true, data: product })
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({ success: false, error: 'Error al actualizar producto' })
  }
})

// DELETE - Desactivar producto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const product = await prisma.product.update({
      where: { id },
      data: { active: false },
    })

    res.json({ success: true, data: product })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ success: false, error: 'Error al eliminar producto' })
  }
})

export default router
