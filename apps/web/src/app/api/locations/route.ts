import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar ubicaciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || ''
    
    const locations = await db.location.findMany({
      where: {
        active: true,
        ...(type && { type }),
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: locations })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener ubicaciones' }, { status: 500 })
  }
}

// POST - Crear ubicación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, address } = body

    const location = await db.location.create({
      data: { name, type, address },
    })

    return NextResponse.json({ success: true, data: location })
  } catch (error) {
    console.error('Error creating location:', error)
    return NextResponse.json({ success: false, error: 'Error al crear ubicación' }, { status: 500 })
  }
}
