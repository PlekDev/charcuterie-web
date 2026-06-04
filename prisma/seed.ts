import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de La Casita POS...')

  // Limpiar datos existentes
  await prisma.movementItem.deleteMany()
  await prisma.movement.deleteMany()
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.cashSession.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.location.deleteMany()
  await prisma.user.deleteMany()

  // Crear ubicaciones
  const almacen = await prisma.location.create({
    data: { name: 'Almacén Central', type: 'almacen', address: 'Bodega principal' }
  })
  const casitaMarket = await prisma.location.create({
    data: { name: 'Casita Market', type: 'tienda', address: 'Sucursal 1' }
  })
  const casita2 = await prisma.location.create({
    data: { name: 'Casita 2', type: 'tienda', address: 'Sucursal 2' }
  })
  const restaurante = await prisma.location.create({
    data: { name: 'Restaurante', type: 'restaurante', address: 'Área de restaurante' }
  })

  console.log('✅ Ubicaciones creadas')

  // Crear usuarios
  const admin = await prisma.user.create({
    data: { email: 'admin@lacasita.com', name: 'Administrador', password: 'admin123', role: 'admin' }
  })
  const cajero1 = await prisma.user.create({
    data: { email: 'cajero1@lacasita.com', name: 'María García', password: 'cajero123', role: 'cajero' }
  })
  const cajero2 = await prisma.user.create({
    data: { email: 'cajero2@lacasita.com', name: 'Juan Pérez', password: 'cajero123', role: 'cajero' }
  })

  console.log('✅ Usuarios creados')

  // Crear categorías
  const categorias = await Promise.all([
    prisma.category.create({ data: { name: 'Bebidas', color: '#3B82F6', icon: 'glass-water' } }),
    prisma.category.create({ data: { name: 'Abarrotes', color: '#10B981', icon: 'shopping-basket' } }),
    prisma.category.create({ data: { name: 'Dulcería', color: '#F59E0B', icon: 'candy' } }),
    prisma.category.create({ data: { name: 'Lácteos', color: '#8B5CF6', icon: 'milk' } }),
    prisma.category.create({ data: { name: 'Snacks', color: '#EF4444', icon: 'cookie' } }),
    prisma.category.create({ data: { name: 'Panadería', color: '#D97706', icon: 'croissant' } }),
    prisma.category.create({ data: { name: 'Limpieza', color: '#06B6D4', icon: 'spray-can' } }),
    prisma.category.create({ data: { name: 'Higiene Personal', color: '#EC4899', icon: 'heart' } }),
  ])

  console.log('✅ Categorías creadas')

  // Crear productos con códigos de barras realistas
  const productos = [
    // Bebidas
    { name: 'Coca-Cola 600ml', barcode: '7501055312345', costPrice: 12, salePrice: 18, unit: 'pieza', category: 0 },
    { name: 'Coca-Cola 2L', barcode: '7501055312346', costPrice: 25, salePrice: 35, unit: 'pieza', category: 0 },
    { name: 'Pepsi 600ml', barcode: '7501055312347', costPrice: 11, salePrice: 17, unit: 'pieza', category: 0 },
    { name: 'Agua Natural 1L', barcode: '7501055312348', costPrice: 8, salePrice: 12, unit: 'pieza', category: 0 },
    { name: 'Agua Mineral 600ml', barcode: '7501055312349', costPrice: 10, salePrice: 15, unit: 'pieza', category: 0 },
    { name: 'Jugo de Naranja 1L', barcode: '7501055312350', costPrice: 28, salePrice: 40, unit: 'pieza', category: 0 },
    { name: 'Cerveza Corona 355ml', barcode: '7501055312351', costPrice: 15, salePrice: 25, unit: 'pieza', category: 0 },
    { name: 'Cerveza Modelo 355ml', barcode: '7501055312352', costPrice: 16, salePrice: 26, unit: 'pieza', category: 0 },
    
    // Abarrotes
    { name: 'Arroz 1kg', barcode: '7501055312353', costPrice: 22, salePrice: 32, unit: 'pieza', category: 1 },
    { name: 'Frijol 1kg', barcode: '7501055312354', costPrice: 28, salePrice: 38, unit: 'pieza', category: 1 },
    { name: 'Aceite Vegetal 1L', barcode: '7501055312355', costPrice: 45, salePrice: 65, unit: 'pieza', category: 1 },
    { name: 'Azúcar 1kg', barcode: '7501055312356', costPrice: 24, salePrice: 32, unit: 'pieza', category: 1 },
    { name: 'Harina 1kg', barcode: '7501055312357', costPrice: 20, salePrice: 28, unit: 'pieza', category: 1 },
    { name: 'Pasta Spaghetti 500g', barcode: '7501055312358', costPrice: 15, salePrice: 22, unit: 'pieza', category: 1 },
    { name: 'Salsa de Tomate 200g', barcode: '7501055312359', costPrice: 12, salePrice: 18, unit: 'pieza', category: 1 },
    { name: 'Atún en Agua 140g', barcode: '7501055312360', costPrice: 18, salePrice: 28, unit: 'pieza', category: 1 },
    
    // Dulcería
    { name: 'Chicles Trident', barcode: '7501055312361', costPrice: 5, salePrice: 10, unit: 'pieza', category: 2 },
    { name: 'Chocolate Hershey\'s', barcode: '7501055312362', costPrice: 18, salePrice: 28, unit: 'pieza', category: 2 },
    { name: 'Paletas Payaso', barcode: '7501055312363', costPrice: 8, salePrice: 15, unit: 'pieza', category: 2 },
    { name: 'Dulces Skittles', barcode: '7501055312364', costPrice: 12, salePrice: 20, unit: 'pieza', category: 2 },
    { name: 'Caramelo Mazapán', barcode: '7501055312365', costPrice: 3, salePrice: 7, unit: 'pieza', category: 2 },
    
    // Lácteos
    { name: 'Leche Entera 1L', barcode: '7501055312366', costPrice: 22, salePrice: 32, unit: 'pieza', category: 3 },
    { name: 'Leche Deslactosada 1L', barcode: '7501055312367', costPrice: 25, salePrice: 35, unit: 'pieza', category: 3 },
    { name: 'Yogurt Natural 1kg', barcode: '7501055312368', costPrice: 35, salePrice: 48, unit: 'pieza', category: 3 },
    { name: 'Queso Oaxaca 500g', barcode: '7501055312369', costPrice: 65, salePrice: 95, unit: 'pieza', category: 3 },
    { name: 'Crema 250ml', barcode: '7501055312370', costPrice: 28, salePrice: 40, unit: 'pieza', category: 3 },
    
    // Snacks
    { name: 'Papas Sabritas Original', barcode: '7501055312371', costPrice: 15, salePrice: 25, unit: 'pieza', category: 4 },
    { name: 'Papas Doritos', barcode: '7501055312372', costPrice: 15, salePrice: 25, unit: 'pieza', category: 4 },
    { name: 'Cheetos Flamin Hot', barcode: '7501055312373', costPrice: 12, salePrice: 20, unit: 'pieza', category: 4 },
    { name: 'Tostitos', barcode: '7501055312374', costPrice: 18, salePrice: 28, unit: 'pieza', category: 4 },
    { name: 'Chicharrones', barcode: '7501055312375', costPrice: 10, salePrice: 18, unit: 'pieza', category: 4 },
    
    // Panadería
    { name: 'Pan Blanco', barcode: '7501055312376', costPrice: 35, salePrice: 50, unit: 'pieza', category: 5 },
    { name: 'Pan Dulce surtido', barcode: '7501055312377', costPrice: 8, salePrice: 15, unit: 'pieza', category: 5 },
    { name: 'Donas Glaseadas', barcode: '7501055312378', costPrice: 10, salePrice: 18, unit: 'pieza', category: 5 },
    { name: 'Croissant', barcode: '7501055312379', costPrice: 12, salePrice: 22, unit: 'pieza', category: 5 },
    
    // Limpieza
    { name: 'Jabón en Polvo 1kg', barcode: '7501055312380', costPrice: 45, salePrice: 65, unit: 'pieza', category: 6 },
    { name: 'Cloro 1L', barcode: '7501055312381', costPrice: 18, salePrice: 28, unit: 'pieza', category: 6 },
    { name: 'Limpiador Pisos 1L', barcode: '7501055312382', costPrice: 25, salePrice: 38, unit: 'pieza', category: 6 },
    { name: 'Jabón para Trastes', barcode: '7501055312383', costPrice: 20, salePrice: 32, unit: 'pieza', category: 6 },
    
    // Higiene Personal
    { name: 'Shampoo 400ml', barcode: '7501055312384', costPrice: 55, salePrice: 85, unit: 'pieza', category: 7 },
    { name: 'Pasta Dental', barcode: '7501055312385', costPrice: 25, salePrice: 40, unit: 'pieza', category: 7 },
    { name: 'Jabón de Tocador', barcode: '7501055312386', costPrice: 12, salePrice: 22, unit: 'pieza', category: 7 },
    { name: 'Papel Higiénico 4 rollos', barcode: '7501055312387', costPrice: 35, salePrice: 55, unit: 'pieza', category: 7 },
  ]

  const productosCreados = []
  for (const prod of productos) {
    const producto = await prisma.product.create({
      data: {
        barcode: prod.barcode,
        name: prod.name,
        costPrice: prod.costPrice,
        salePrice: prod.salePrice,
        unit: prod.unit,
        categoryId: categorias[prod.category].id,
      }
    })
    productosCreados.push(producto)
  }

  console.log(`✅ ${productosCreados.length} productos creados`)

  // Crear inventario en todas las ubicaciones
  for (const producto of productosCreados) {
    // Inventario en almacén (stock alto)
    await prisma.inventory.create({
      data: {
        productId: producto.id,
        locationId: almacen.id,
        quantity: Math.floor(Math.random() * 100) + 50,
        minStock: 20,
        maxStock: 200,
      }
    })
    
    // Inventario en tiendas (stock medio)
    await prisma.inventory.create({
      data: {
        productId: producto.id,
        locationId: casitaMarket.id,
        quantity: Math.floor(Math.random() * 30) + 10,
        minStock: 5,
        maxStock: 50,
      }
    })
    
    await prisma.inventory.create({
      data: {
        productId: producto.id,
        locationId: casita2.id,
        quantity: Math.floor(Math.random() * 30) + 10,
        minStock: 5,
        maxStock: 50,
      }
    })
    
    // Restaurante solo algunos productos
    if (producto.categoryId === categorias[0].id || producto.categoryId === categorias[3].id) {
      await prisma.inventory.create({
        data: {
          productId: producto.id,
          locationId: restaurante.id,
          quantity: Math.floor(Math.random() * 20) + 5,
          minStock: 3,
          maxStock: 30,
        }
      })
    }
  }

  console.log('✅ Inventario creado en todas las ubicaciones')

  // Crear algunas ventas de ejemplo del día de hoy
  const hoy = new Date()
  const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  
  // Abrir sesión de caja
  const session = await prisma.cashSession.create({
    data: {
      locationId: casitaMarket.id,
      cashierId: cajero1.id,
      openingCash: 500,
      openedAt: inicioDia,
      status: 'abierta',
    }
  })

  // Crear ventas de ejemplo
  let invoiceNum = 1
  const ventasHoy = [
    { items: [{ name: 'Coca-Cola 600ml', qty: 2 }, { name: 'Papas Sabritas Original', qty: 1 }], method: 'efectivo' },
    { items: [{ name: 'Leche Entera 1L', qty: 1 }, { name: 'Pan Blanco', qty: 1 }], method: 'tarjeta' },
    { items: [{ name: 'Chocolate Hershey\'s', qty: 3 }, { name: 'Chicles Trident', qty: 2 }], method: 'efectivo' },
    { items: [{ name: 'Arroz 1kg', qty: 2 }, { name: 'Frijol 1kg', qty: 1 }, { name: 'Aceite Vegetal 1L', qty: 1 }], method: 'efectivo' },
    { items: [{ name: 'Agua Natural 1L', qty: 5 }], method: 'transferencia' },
  ]

  for (const venta of ventasHoy) {
    const items = venta.items.map(item => {
      const prod = productosCreados.find(p => p.name === item.name)!
      return {
        productId: prod.id,
        quantity: item.qty,
        unitPrice: prod.salePrice,
        costPrice: prod.costPrice,
        subtotal: prod.salePrice * item.qty,
      }
    })
    
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0)
    
    await prisma.sale.create({
      data: {
        invoiceNumber: `F${String(invoiceNum).padStart(4, '0')}`,
        locationId: casitaMarket.id,
        cashierId: cajero1.id,
        sessionId: session.id,
        subtotal,
        total: subtotal,
        paymentMethod: venta.method,
        cashReceived: venta.method === 'efectivo' ? subtotal + 50 : null,
        change: venta.method === 'efectivo' ? 50 : null,
        items: { create: items },
      }
    })
    invoiceNum++
  }

  console.log(`✅ ${ventasHoy.length} ventas de ejemplo creadas`)

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
