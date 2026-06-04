import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: {
          include: {
            location: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener producto' }, { status: 500 })
  }
}

// PUT - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, barcode, sku, description, categoryId, costPrice, salePrice, unit, imageUrl, active } = body

    const product = await db.product.update({
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

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ success: false, error: 'Error al actualizar producto' }, { status: 500 })
  }
}

// DELETE - Desactivar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ success: false, error: 'Error al eliminar producto' }, { status: 500 })
  }
}
