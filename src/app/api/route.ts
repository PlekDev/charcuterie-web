import { NextResponse } from "next/server";

// GET /api - Endpoint de prueba (health check). Sirve para verificar
// rápidamente que la API responde, p. ej. desde Postman/Swagger.
export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}