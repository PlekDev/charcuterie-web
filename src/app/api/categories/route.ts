import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar categorías.
// El schema nuevo no tiene tabla de categorías: `category` es una columna
// de texto en products. Así que devolvemos las categorías distintas.
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('available', true)
      .not('category', 'is', null)

    if (error) {
      console.error('Supabase error fetching categories:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Contar productos por categoría
    const counts = new Map<string, number>()
    for (const row of data as { category: string }[]) {
      counts.set(row.category, (counts.get(row.category) ?? 0) + 1)
    }

    const categories = Array.from(counts.entries())
      .map(([nombre, count]) => ({
        id: nombre, // el id de categoría es el propio texto
        nombre,
        _count: { productos: count },
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener categorías' }, { status: 500 })
  }
}
