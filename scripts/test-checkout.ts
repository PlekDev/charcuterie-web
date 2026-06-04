import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCheckout() {
  console.log('🚀 Iniciando prueba de checkout...')

  try {
    // 1. Buscar un producto con stock
    const product = await prisma.productos.findFirst({
      where: {
        activo: true,
        stock_actual: { gt: 0 }
      }
    })

    if (!product) {
      console.error('❌ No se encontró ningún producto con stock para la prueba.')
      return
    }

    console.log(`📦 Producto seleccionado: ${product.nombre} (ID: ${product.id}, Stock actual: ${product.stock_actual})`)

    const quantityToBuy = 1
    const initialStock = product.stock_actual

    // 2. Simular llamada a la API (Llamamos directamente a la lógica de la BD para simplicidad en el script de test)
    // En un entorno real, esto sería un fetch a /api/sales

    console.log('🛒 Procesando venta...')

    const sale = await prisma.$transaction(async (tx) => {
      // Generar Folio
      const lastSale = await tx.ventas.findFirst({
        where: { folio: { startsWith: 'W' } },
        orderBy: { folio: 'desc' },
      })

      let nextFolio = 'W0001'
      if (lastSale) {
        const lastNum = parseInt(lastSale.folio.substring(1))
        nextFolio = `W${String(lastNum + 1).padStart(4, '0')}`
      }

      const price = Number(product.precio_venta)
      const total = price * quantityToBuy

      // Crear Venta
      const newSale = await tx.ventas.create({
        data: {
          folio: nextFolio,
          canal: 'web',
          subtotal: total,
          total: total,
          metodo_pago: 'tarjeta',
          estado: 'completada',
          notas: 'Test de integración',
          detalle_venta: {
            create: {
              producto_id: product.id,
              nombre_producto: product.nombre,
              cantidad: quantityToBuy,
              precio_unitario: price,
              subtotal: total,
            }
          }
        }
      })

      // Actualizar Stock
      await tx.productos.update({
        where: { id: product.id },
        data: { stock_actual: { decrement: quantityToBuy } }
      })

      // Movimiento
      await tx.movimientos_inventario.create({
        data: {
          producto_id: product.id,
          tipo: 'venta',
          cantidad: -quantityToBuy,
          stock_antes: initialStock,
          stock_despues: initialStock - quantityToBuy,
          motivo: `Test Venta Web ${nextFolio}`,
          referencia_id: newSale.id
        }
      })

      return newSale
    })

    console.log(`✅ Venta creada exitosamente. Folio: ${sale.folio}`)

    // 3. Verificar cambios
    const updatedProduct = await prisma.productos.findUnique({
      where: { id: product.id }
    })

    if (updatedProduct?.stock_actual === initialStock - quantityToBuy) {
      console.log(`✅ Stock actualizado correctamente: ${initialStock} -> ${updatedProduct.stock_actual}`)
    } else {
      console.error(`❌ Error en actualización de stock. Esperado: ${initialStock - quantityToBuy}, Obtenido: ${updatedProduct?.stock_actual}`)
    }

    const movement = await prisma.movimientos_inventario.findFirst({
      where: { referencia_id: sale.id }
    })

    if (movement) {
      console.log('✅ Movimiento de inventario registrado.')
    } else {
      console.error('❌ No se encontró el movimiento de inventario.')
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCheckout()
