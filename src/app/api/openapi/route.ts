import { NextResponse } from 'next/server'
import { openApiSpec } from '@/lib/openapi'

// GET /api/openapi - Devuelve la especificación OpenAPI en JSON.
// La consume la página /docs (Scalar) para dibujar la documentación.
export async function GET() {
  return NextResponse.json(openApiSpec)
}
