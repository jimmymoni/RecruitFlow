import 'reflect-metadata'
import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// import { checkSupabaseConnection } from './config/supabase'
import { logger } from './utils/logger'
import { errorHandler } from './middleware/errorHandler'

// Load environment variables
dotenv.config()

const app: Application = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
app.use(morgan('combined', { 
  stream: { write: (message) => logger.info(message.trim()) }
}))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'RecruitFlow Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'Supabase',
    features: ['Authentication', 'REST API', 'Real-time WebSockets']
  })
})

// Basic API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'RecruitFlow Backend API',
    version: '1.0.0',
    description: 'AI-powered recruitment management system',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      candidates: '/api/candidates/*',
      jobs: '/api/jobs/*',
      clients: '/api/clients/*'
    },
    documentation: 'See SUPABASE_SETUP.md for setup instructions'
  })
})

// Placeholder route for authentication
app.post('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication endpoints will be available once Supabase is configured',
    setup: 'Please follow SUPABASE_SETUP.md instructions'
  })
})

// Socket.IO for real-time features
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`)
  
  socket.emit('welcome', {
    message: 'Connected to RecruitFlow real-time service',
    timestamp: new Date().toISOString()
  })
  
  socket.on('join-room', (room) => {
    socket.join(room)
    logger.info(`Socket ${socket.id} joined room ${room}`)
  })
  
  socket.on('leave-room', (room) => {
    socket.leave(room)
    logger.info(`Socket ${socket.id} left room ${room}`)
  })
  
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`)
  })
})

// Global error handler
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    availableEndpoints: ['/api', '/api/health', '/api/auth/test']
  })
})

// Database connection and server startup
const startServer = async () => {
  try {
    // Check Supabase configuration without connecting
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY
    
    if (supabaseUrl?.includes('wbagxpxwhvrkgknurspr') && supabaseKey && supabaseKey.length > 100) {
      logger.info('✅ Supabase configuration detected')
    } else {
      logger.warn('⚠️  Supabase configuration incomplete')
    }
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 RecruitFlow Backend running on port ${PORT}`)
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
      logger.info(`🗄️  Database: Supabase`)
      logger.info(`🔌 WebSocket: Enabled`)
      logger.info(`📋 API Documentation: http://localhost:${PORT}/api`)
      
      if (!supabaseUrl || supabaseUrl.includes('your-project')) {
        logger.warn('⚠️  Please configure Supabase in your .env file')
        logger.info('📖 See SUPABASE_SETUP.md for instructions')
      }
      
      logger.info('🎉 Server is ready to accept connections!')
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

// Start the server
startServer()

export { io }