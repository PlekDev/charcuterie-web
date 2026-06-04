import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idInt = parseInt(id)

    if (isNaN(idInt)) {
      return NextResponse.json({ success: false, error: 'ID de producto inválido' }, { status: 400 })
    }

    const product = await db.productos.findUnique({
      where: { id: idInt },
      include: {
        categorias: true,
      },
    })

    if (!product) {
      return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('Error fetching product detail:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener el producto' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idInt = parseInt(id)
    const body = await request.json()

    if (isNaN(idInt)) {
      return NextResponse.json({ success: false, error: 'ID de producto inválido' }, { status: 400 })
    }

    // Explicitly pick fields to avoid mass assignment security risks
    const {
      nombre,
      descripcion,
      categoria_id,
      precio_compra,
      precio_venta,
      stock_actual,
      stock_minimo,
      imagen_url,
      activo,
      visible_web
    } = body

    const updateData: any = {}
    if (nombre !== undefined) updateData.nombre = nombre
    if (descripcion !== undefined) updateData.descripcion = descripcion
    if (categoria_id !== undefined) updateData.categoria_id = typeof categoria_id === 'string' ? parseInt(categoria_id) : categoria_id
    if (precio_compra !== undefined) updateData.precio_compra = typeof precio_compra === 'string' ? parseFloat(precio_compra) : precio_compra
    if (precio_venta !== undefined) updateData.precio_venta = typeof precio_venta === 'string' ? parseFloat(precio_venta) : precio_venta
    if (stock_actual !== undefined) updateData.stock_actual = typeof stock_actual === 'string' ? parseInt(stock_actual) : stock_actual
    if (stock_minimo !== undefined) updateData.stock_minimo = typeof stock_minimo === 'string' ? parseInt(stock_minimo) : stock_minimo
    if (imagen_url !== undefined) updateData.imagen_url = imagen_url
    if (activo !== undefined) updateData.activo = activo
    if (visible_web !== undefined) updateData.visible_web = visible_web

    const updatedProduct = await db.productos.update({
      where: { id: idInt },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: updatedProduct })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ success: false, error: 'Error al actualizar producto' }, { status: 500 })
  }
}
