// Especificación OpenAPI 3.1 de la API de Charcutería Gourmet.
// La consume la página /docs (Scalar) para documentar y probar los endpoints.
// Si agregas o cambias una ruta en src/app/api, actualiza también este archivo.

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'API Charcutería Gourmet',
    version: '1.0.0',
    description:
      'API de la tienda: catálogo de productos, categorías y pedidos. ' +
      'Construida con Next.js (Route Handlers) sobre Supabase (schema `chaputeria`).',
  },
  // Servidor relativo: usa el mismo origen desde el que se abre /docs
  // (sirve igual en local y en producción).
  servers: [{ url: '/', description: 'Servidor actual' }],
  tags: [
    { name: 'General', description: 'Salud de la API' },
    { name: 'Productos', description: 'Catálogo de productos' },
    { name: 'Categorías', description: 'Categorías derivadas del catálogo' },
    { name: 'Pedidos', description: 'Creación, consulta y estado de pedidos' },
  ],
  paths: {
    '/api': {
      get: {
        tags: ['General'],
        summary: 'Health check',
        description: 'Verifica rápidamente que la API responde.',
        responses: {
          '200': {
            description: 'La API está activa',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { message: { type: 'string' } } },
                example: { message: 'Hello, world!' },
              },
            },
          },
        },
      },
    },

    '/api/products': {
      get: {
        tags: ['Productos'],
        summary: 'Listar productos',
        description: 'Devuelve los productos disponibles del catálogo, con filtros opcionales.',
        parameters: [
          { name: 'search', in: 'query', description: 'Filtra por nombre (coincidencia parcial)', schema: { type: 'string' } },
          { name: 'categoryId', in: 'query', description: 'Filtra por categoría', schema: { type: 'string' } },
          { name: 'excludeId', in: 'query', description: 'Excluye un producto (para recomendaciones)', schema: { type: 'string' } },
          { name: 'limit', in: 'query', description: 'Máximo de resultados (default 100)', schema: { type: 'integer', default: 100 } },
        ],
        responses: {
          '200': {
            description: 'Lista de productos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Producto' } },
                  },
                },
              },
            },
          },
          '500': { $ref: '#/components/responses/Error' },
        },
      },
      post: {
        tags: ['Productos'],
        summary: 'Crear producto (admin)',
        description: 'Crea un producto nuevo. Requiere `SUPABASE_SERVICE_ROLE_KEY` en el servidor.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductoInput' },
              example: {
                name: 'Queso Manchego Curado',
                description: 'Madurado durante varios meses.',
                price: 220,
                category: 'Quesos',
                image_url: null,
                available: true,
              },
            },
          },
        },
        responses: {
          '200': { description: 'Producto creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductoEnvelope' } } } },
          '400': { $ref: '#/components/responses/Error' },
          '500': { $ref: '#/components/responses/Error' },
        },
      },
    },

    '/api/products/{id}': {
      get: {
        tags: ['Productos'],
        summary: 'Detalle de un producto',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Producto encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductoEnvelope' } } } },
          '404': { $ref: '#/components/responses/Error' },
          '500': { $ref: '#/components/responses/Error' },
        },
      },
      patch: {
        tags: ['Productos'],
        summary: 'Actualizar producto (admin)',
        description: 'Actualiza solo los campos enviados. Requiere `SUPABASE_SERVICE_ROLE_KEY`.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductoInput' },
              example: { price: 199.5, available: false },
            },
          },
        },
        responses: {
          '200': { description: 'Producto actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductoEnvelope' } } } },
          '500': { $ref: '#/components/responses/Error' },
        },
      },
    },

    '/api/categories': {
      get: {
        tags: ['Categorías'],
        summary: 'Listar categorías',
        description: 'Categorías distintas presentes en el catálogo, con su número de productos.',
        responses: {
          '200': {
            description: 'Lista de categorías',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          nombre: { type: 'string' },
                          _count: { type: 'object', properties: { productos: { type: 'integer' } } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '500': { $ref: '#/components/responses/Error' },
        },
      },
    },

    '/api/orders': {
      get: {
        tags: ['Pedidos'],
        summary: 'Historial de pedidos',
        description: 'Lista los pedidos del usuario demo. Requiere `SUPABASE_SERVICE_ROLE_KEY`.',
        responses: {
          '200': {
            description: 'Lista de pedidos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/PedidoResumen' } },
                  },
                },
              },
            },
          },
          '500': { $ref: '#/components/responses/Error' },
        },
      },
      post: {
        tags: ['Pedidos'],
        summary: 'Crear pedido',
        description: 'Crea un pedido a partir de los items del carrito. El total lo calcula la BD por triggers.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items'],
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: { id: { type: 'string', description: 'UUID del producto' }, quantity: { type: 'integer' } },
                    },
                  },
                  notes: { type: 'string', nullable: true, description: 'Notas/instrucciones del pedido' },
                },
              },
              example: {
                items: [{ id: 'reemplaza-con-uuid-de-producto', quantity: 2 }],
                notes: 'Sin frutos secos, por favor.',
              },
            },
          },
        },
        responses: {
          '201': { description: 'Pedido creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/PedidoEnvelope' } } } },
          '400': { $ref: '#/components/responses/Error' },
          '500': { $ref: '#/components/responses/Error' },
        },
      },
    },

    '/api/orders/{id}': {
      get: {
        tags: ['Pedidos'],
        summary: 'Detalle de un pedido',
        description: 'Devuelve el pedido con sus productos.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Pedido encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/PedidoEnvelope' } } } },
          '404': { $ref: '#/components/responses/Error' },
          '500': { $ref: '#/components/responses/Error' },
        },
      },
      patch: {
        tags: ['Pedidos'],
        summary: 'Actualizar estado del pedido',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
                  },
                },
              },
              example: { status: 'confirmed' },
            },
          },
        },
        responses: {
          '200': { description: 'Estado actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/PedidoEnvelope' } } } },
          '400': { $ref: '#/components/responses/Error' },
          '500': { $ref: '#/components/responses/Error' },
        },
      },
    },
  },

  components: {
    responses: {
      Error: {
        description: 'Error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { success: { type: 'boolean', example: false }, error: { type: 'string' } },
            },
          },
        },
      },
    },
    schemas: {
      // Producto tal como lo devuelve la API (mapeado al español por mapProduct).
      Producto: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nombre: { type: 'string' },
          descripcion: { type: 'string', nullable: true },
          precio_venta: { type: 'number' },
          imagen_url: { type: 'string', nullable: true },
          stock_actual: { type: 'integer' },
          visible_web: { type: 'boolean' },
          categoria_id: { type: 'string', nullable: true },
        },
      },
      ProductoEnvelope: {
        type: 'object',
        properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Producto' } },
      },
      // Cuerpo aceptado al crear/actualizar un producto (admite nombres nuevos y viejos).
      ProductoInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          price: { type: 'number' },
          category: { type: 'string', nullable: true },
          image_url: { type: 'string', nullable: true },
          available: { type: 'boolean' },
        },
      },
      PedidoResumen: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string' },
          total: { type: 'number' },
          allergy_notes: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          item_count: { type: 'integer' },
        },
      },
      Pedido: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string' },
          total: { type: 'number' },
          allergy_notes: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                quantity: { type: 'integer' },
                unit_price: { type: 'number' },
                subtotal: { type: 'number' },
                name: { type: 'string' },
              },
            },
          },
        },
      },
      PedidoEnvelope: {
        type: 'object',
        properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Pedido' } },
      },
    },
  },
} as const
