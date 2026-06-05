// Página /docs - Referencia interactiva de la API con Scalar.
// Devolvemos HTML que carga el bundle de Scalar desde su CDN y le pasamos
// nuestra especificación (servida por /api/openapi). Desde aquí se pueden
// ver y PROBAR todos los endpoints en vivo durante la evaluación.
//
// Nota: el script de Scalar se carga por CDN, así que necesita internet.
export async function GET() {
  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API Charcutería Gourmet — Docs</title>
  </head>
  <body>
    <!-- Scalar lee la URL del spec desde este script -->
    <script id="api-reference" data-url="/api/openapi"></script>
    <script>
      var configuration = { theme: 'purple' }
      document.getElementById('api-reference').dataset.configuration =
        JSON.stringify(configuration)
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
