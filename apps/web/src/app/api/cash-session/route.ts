import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener sesiones de caja
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId') || ''
    const status = searchParams.get('status') || ''
    const date = searchParams.get('date') || ''
    
    // Construir filtros
    let dateFilter = {}
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      dateFilter = {
        openedAt: {
          gte: startDate,
          lte: endDate,
        },
      }
    }

    const sessions = await db.cashSession.findMany({
      where: {
        ...(locationId && { locationId }),
        ...(status && { status }),
        ...dateFilter,
      },
      include: {
        cashier: true,
        location: true,
        sales: {
          include: {
            items: { include: { product: true } },
          },
        },
      },
      orderBy: { openedAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ success: true, data: sessions })
  } catch (error) {
    console.error('Error fetching cash sessions:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener sesiones' }, { status: 500 })
  }
}

// POST - Abrir nueva sesión de caja
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locationId, cashierId, openingCash, notes } = body

    // Verificar si hay una sesión abierta en esta ubicación
    const existingSession = await db.cashSession.findFirst({
      where: { locationId, status: 'abierta' },
    })

    if (existingSession) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ya existe una sesión abierta en esta ubicación' 
      }, { status: 400 })
    }

    const session = await db.cashSession.create({
      data: {
        locationId,
        cashierId,
        openingCash: parseFloat(openingCash) || 0,
        notes,
      },
      include: {
        cashier: true,
        location: true,
      },
    })

    return NextResponse.json({ success: true, data: session })
  } catch (error) {
    console.error('Error creating cash session:', error)
    return NextResponse.json({ success: false, error: 'Error al abrir sesión' }, { status: 500 })
  }
}

// PUT - Cerrar sesión de caja
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, closingCash, notes } = body

    const session = await db.cashSession.findUnique({
      where: { id: sessionId },
      include: {
        sales: true,
      },
    })

    if (!session) {
      return NextResponse.json({ success: false, error: 'Sesión no encontrada' }, { status: 404 })
    }

    if (session.status === 'cerrada') {
      return NextResponse.json({ success: false, error: 'Esta sesión ya está cerrada' }, { status: 400 })
    }

    // Calcular totales
    const totalSales = session.sales.reduce((acc, sale) => acc + sale.total, 0)
    const totalCash = session.sales
      .filter(s => s.paymentMethod === 'efectivo')
      .reduce((acc, sale) => acc + sale.total, 0)
    const totalCard = session.sales
      .filter(s => s.paymentMethod === 'tarjeta')
      .reduce((acc, sale) => acc + sale.total, 0)
    const totalTransfer = session.sales
      .filter(s => s.paymentMethod === 'transferencia')
      .reduce((acc, sale) => acc + sale.total, 0)
    const totalItems = session.sales.reduce((acc, sale) => {
      const items = sale.items?.length || 0
      return acc + items
    }, 0)

    const expectedCash = session.openingCash + totalCash
    const difference = (parseFloat(closingCash) || 0) - expectedCash

    const closed = await db.cashSession.update({
      where: { id: sessionId },
      data: {
        status: 'cerrada',
        closingCash: parseFloat(closingCash) || 0,
        expectedCash,
        difference,
        totalSales,
        totalCash,
        totalCard,
        totalTransfer,
        totalItems,
        closedAt: new Date(),
        notes,
      },
      include: {
        cashier: true,
        location: true,
        sales: {
          include: {
            items: { include: { product: true } },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: closed })
  } catch (error) {
    console.error('Error closing cash session:', error)
    return NextResponse.json({ success: false, error: 'Error al cerrar sesión' }, { status: 500 })
  }
}
