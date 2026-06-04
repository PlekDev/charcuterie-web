import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de La Casita POS...')

  // Crear ubicaciones
  const almacen = await prisma.location.upsert({
    where: { id: 'loc_almacen' },
    update: {},
    create: { id: 'loc_almacen', name: 'Almacén Central', type: 'almacen', address: 'Bodega principal' }
  })
  
  const casitaMarket = await prisma.location.upsert({
    where: { id: 'loc_market' },
    update: {},
    create: { id: 'loc_market', name: 'Casita Market', type: 'tienda', address: 'Sucursal 1' }
  })
  
  const casita2 = await prisma.location.upsert({
    where: { id: 'loc_casita2' },
    update: {},
    create: { id: 'loc_casita2', name: 'Casita 2', type: 'tienda', address: 'Sucursal 2' }
  })
  
  const restaurante = await prisma.location.upsert({
    where: { id: 'loc_restaurante' },
    update: {},
    create: { id: 'loc_restaurante', name: 'Restaurante', type: 'restaurante', address: 'Área de restaurante' }
  })

  console.log('✅ Ubicaciones creadas')

  // Crear usuarios
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lacasita.com' },
    update: {},
    create: { id: 'user_admin', email: 'admin@lacasita.com', name: 'Administrador', password: 'admin123', role: 'admin' }
  })
  
  const cajero1 = await prisma.user.upsert({
    where: { email: 'cajero1@lacasita.com' },
    update: {},
    create: { id: 'user_cajero1', email: 'cajero1@lacasita.com', name: 'María García', password: 'cajero123', role: 'cajero' }
  })

  console.log('✅ Usuarios creados')

  // Crear categorías
  const bebidas = await prisma.category.upsert({
    where: { id: 'cat_bebidas' },
    update: {},
    create: { id: 'cat_bebidas', name: 'Bebidas', color: '#3B82F6', icon: 'glass-water' }
  })
  
  const abarrotes = await prisma.category.upsert({
    where: { id: 'cat_abarrotes' },
    update: {},
    create: { id: 'cat_abarrotes', name: 'Abarrotes', color: '#10B981', icon: 'shopping-basket' }
  })
  
  const dulceria = await prisma.category.upsert({
    where: { id: 'cat_dulceria' },
    update: {},
    create: { id: 'cat_dulceria', name: 'Dulcería', color: '#F59E0B', icon: 'candy' }
  })
  
  const snacks = await prisma.category.upsert({
    where: { id: 'cat_snacks' },
    update: {},
    create: { id: 'cat_snacks', name: 'Snacks', color: '#EF4444', icon: 'cookie' }
  })

  console.log('✅ Categorías creadas')

  // Crear productos de ejemplo
  const productos = [
    // Bebidas
    { id: 'prod_coca600', name: 'Coca-Cola 600ml', barcode: '7501055312345', costPrice: 12, salePrice: 18, categoryId: bebidas.id },
    { id: 'prod_coca2l', name: 'Coca-Cola 2L', barcode: '7501055312346', costPrice: 25, salePrice: 35, categoryId: bebidas.id },
    { id: 'prod_pepsi600', name: 'Pepsi 600ml', barcode: '7501055312347', costPrice: 11, salePrice: 17, categoryId: bebidas.id },
    { id: 'prod_agua1l', name: 'Agua Natural 1L', barcode: '7501055312348', costPrice: 8, salePrice: 12, categoryId: bebidas.id },
    
    // Abarrotes
    { id: 'prod_arroz', name: 'Arroz 1kg', barcode: '7501055312353', costPrice: 22, salePrice: 32, categoryId: abarrotes.id },
    { id: 'prod_frijol', name: 'Frijol 1kg', barcode: '7501055312354', costPrice: 28, salePrice: 38, categoryId: abarrotes.id },
    { id: 'prod_azucar', name: 'Azúcar 1kg', barcode: '7501055312356', costPrice: 24, salePrice: 32, categoryId: abarrotes.id },
    
    // Dulcería
    { id: 'prod_chicle', name: 'Chicles Trident', barcode: '7501055312361', costPrice: 5, salePrice: 10, categoryId: dulceria.id },
    { id: 'prod_hersheys', name: 'Chocolate Hershey\'s', barcode: '7501055312362', costPrice: 18, salePrice: 28, categoryId: dulceria.id },
    
    // Snacks
    { id: 'prod_sabritas', name: 'Papas Sabritas Original', barcode: '7501055312371', costPrice: 15, salePrice: 25, categoryId: snacks.id },
    { id: 'prod_doritos', name: 'Papas Doritos', barcode: '7501055312372', costPrice: 15, salePrice: 25, categoryId: snacks.id },
  ]

  for (const prod of productos) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {},
      create: {
        id: prod.id,
        name: prod.name,
        barcode: prod.barcode,
        costPrice: prod.costPrice,
        salePrice: prod.salePrice,
        categoryId: prod.categoryId,
      }
    })
  }

  console.log(`✅ ${productos.length} productos creados`)

  // Crear inventario inicial
  for (const prod of productos) {
    // En almacén
    await prisma.inventory.upsert({
      where: { productId_locationId: { productId: prod.id, locationId: almacen.id } },
      update: {},
      create: {
        productId: prod.id,
        locationId: almacen.id,
        quantity: Math.floor(Math.random() * 50) + 30,
      }
    })
    
    // En tienda
    await prisma.inventory.upsert({
      where: { productId_locationId: { productId: prod.id, locationId: casitaMarket.id } },
      update: {},
      create: {
        productId: prod.id,
        locationId: casitaMarket.id,
        quantity: Math.floor(Math.random() * 20) + 5,
      }
    })
  }

  console.log('✅ Inventario creado')

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
