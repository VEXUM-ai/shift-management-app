import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import fs from 'fs'
import https from 'https'
import http from 'http'

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from './routes/auth'
import { apiLimiter } from './middleware/rateLimiter'

const app = express()
const PORT = process.env.PORT || 3001
const ENABLE_HTTPS = process.env.ENABLE_HTTPS === 'true'

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}))

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

// Compression middleware
app.use(compression())

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Apply rate limiting
app.use(apiLimiter)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API Routes
app.use('/api/auth', authRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  })
})

// Start server
const startServer = () => {
  if (ENABLE_HTTPS) {
    const sslKeyPath = process.env.SSL_KEY_PATH
    const sslCertPath = process.env.SSL_CERT_PATH

    if (!sslKeyPath || !sslCertPath || !fs.existsSync(sslKeyPath) || !fs.existsSync(sslCertPath)) {
      console.error('SSL files not found')
      process.exit(1)
    }

    const httpsOptions = {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath),
    }

    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`🔒 HTTPS Server running on https://localhost:${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV}`)
    })
  } else {
    http.createServer(app).listen(PORT, () => {
      console.log(`🚀 HTTP Server running on http://localhost:${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV}`)
      console.log(`⚠️  WARNING: Running in HTTP mode. Enable HTTPS for production!`)
    })
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received')
  process.exit(0)
})

startServer()

export default app
