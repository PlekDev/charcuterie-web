import express from 'express'
import cors from 'cors'
import productsRouter from './modules/products/routes.js'
import salesRouter from './modules/sales/routes.js'
import inventoryRouter from './modules/inventory/routes.js'
import cashSessionRouter from './modules/cash-session/routes.js'
import locationsRouter from './modules/locations/routes.js'
import categoriesRouter from './modules/categories/routes.js'
import reportsRouter from './modules/reports/routes.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/products', productsRouter)
app.use('/api/sales', salesRouter)
app.use('/api/inventory', inventoryRouter)
app.use('/api/cash-session', cashSessionRouter)
app.use('/api/locations', locationsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/reports', reportsRouter)

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message)
  res.status(500).json({ success: false, error: 'Error interno del servidor' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 La Casita API running on http://localhost:${PORT}`)
})
