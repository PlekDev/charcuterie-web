import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener venta por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sale = await db.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
        cashier: true,
        location: true,
        session: true,
      },
    })

    if (!sale) {
      return NextResponse.json({ success: false, error: 'Venta no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: sale })
  } catch (error) {
    console.error('Error fetching sale:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener venta' }, { status: 500 })
  }
}
