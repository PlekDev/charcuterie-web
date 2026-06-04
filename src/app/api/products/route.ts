import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar productos con búsqueda y filtro
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoriaId = searchParams.get('categoryId') || ''
    const barcode = searchParams.get('barcode') || ''
    const visibleWeb = searchParams.get('visibleWeb')
    
    const products = await db.productos.findMany({
      where: {
        activo: true,
        ...(visibleWeb !== null && { visible_web: visibleWeb === 'true' }),
        ...(search && {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { codigo_barras: { contains: search } },
          ]
        }),
        ...(categoriaId && { categoria_id: parseInt(categoriaId) }),
        ...(barcode && { codigo_barras: barcode }),
      },
      include: {
        categorias: true,
      },
      orderBy: { nombre: 'asc' },
      take: 100,
    })

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener productos' }, { status: 500 })
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nombre,
      codigo_barras,
      descripcion,
      categoria_id,
      precio_compra,
      precio_venta,
      stock_actual,
      stock_minimo,
      imagen_url,
      visible_web
    } = body

    const product = await db.productos.create({
      data: {
        nombre,
        codigo_barras: codigo_barras || null,
        descripcion,
        categoria_id: categoria_id ? parseInt(categoria_id) : null,
        precio_compra: parseFloat(precio_compra) || 0,
        precio_venta: parseFloat(precio_venta) || 0,
        stock_actual: parseInt(stock_actual) || 0,
        stock_minimo: parseInt(stock_minimo) || 5,
        imagen_url,
        visible_web: visible_web !== undefined ? visible_web : true,
      },
    })

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ success: false, error: 'Error al crear producto' }, { status: 500 })
  }
}
