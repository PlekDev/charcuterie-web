import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar categorías
export async function GET(request: NextRequest) {
  try {
    const categories = await db.categorias.findMany({
      where: { activo: true },
      include: {
        _count: {
          select: { productos: true },
        },
      },
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener categorías' }, { status: 500 })
  }
}

// POST - Crear categoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion } = body

    const category = await db.categorias.create({
      data: { nombre, descripcion },
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ success: false, error: 'Error al crear categoría' }, { status: 500 })
  }
}
