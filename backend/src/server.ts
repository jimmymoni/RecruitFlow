import 'reflect-metadata'
import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import { checkSupabaseConnection } from './config/supabase'
import { logger } from './utils/logger'
import { errorHandler } from './middleware/errorHandler'
import { authMiddleware } from './middleware/auth'

// Import routes
import authRoutes from './routes/auth'
import candidateRoutes from './routes/candidates'
import jobRoutes from './routes/jobs'
// import clientRoutes from './routes/clients'
// import documentRoutes from './routes/documents'
// import aiRoutes from './routes/ai'
// import workflowRoutes from './routes/workflows'
// import analyticsRoutes from './routes/analytics'

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
    version: '1.0.0'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/candidates', candidateRoutes)
app.use('/api/jobs', jobRoutes)
// app.use('/api/clients', clientRoutes)
// app.use('/api/documents', documentRoutes)
// app.use('/api/ai', aiRoutes)
// app.use('/api/workflows', workflowRoutes)
// app.use('/api/analytics', analyticsRoutes)

// Socket.IO for real-time features
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`)
  
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
    message: 'API endpoint not found'
  })
})

// Database connection and server startup
const startServer = async () => {
  try {
    // Check Supabase connection
    const isConnected = await checkSupabaseConnection()
    if (!isConnected) {
      logger.warn('⚠️  Supabase connection failed - check your environment variables')
      logger.info('📖 See SUPABASE_SETUP.md for setup instructions')
    } else {
      logger.info('✅ Supabase connection established successfully')
    }
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 RecruitFlow Backend running on port ${PORT}`)
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
      logger.info(`🗄️  Database: Supabase`)
      
      if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-project')) {
        logger.warn('⚠️  Please configure Supabase in your .env file')
        logger.info('📖 See SUPABASE_SETUP.md for instructions')
      }
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