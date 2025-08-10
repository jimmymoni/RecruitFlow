import { DataSource } from 'typeorm'
import { logger } from '../utils/logger'

// Import entities
import { User } from '../models/User'
import { Candidate } from '../models/Candidate'
import { Job } from '../models/Job'
import { Client } from '../models/Client'
import { Document } from '../models/Document'
import { Communication } from '../models/Communication'
import { Workflow } from '../models/Workflow'
import { WorkflowExecution } from '../models/WorkflowExecution'
import { AIProcessingLog } from '../models/AIProcessingLog'
import { Analytics } from '../models/Analytics'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'recruitflow',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'recruitflow',
  synchronize: process.env.NODE_ENV === 'development', // Only in development
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Candidate,
    Job,
    Client,
    Document,
    Communication,
    Workflow,
    WorkflowExecution,
    AIProcessingLog,
    Analytics
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
})

// Database connection health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }
    
    const result = await AppDataSource.query('SELECT 1 as healthy')
    const isHealthy = result && result[0] && result[0].healthy === 1
    
    if (isHealthy) {
      logger.info('Database connection is healthy')
    } else {
      logger.error('Database connection check failed')
    }
    
    return isHealthy
  } catch (error) {
    logger.error('Database connection error:', error)
    return false
  }
}

// Initialize database with retry mechanism
export const initializeDatabase = async (retries = 5): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await AppDataSource.initialize()
      logger.info('Database initialized successfully')
      return
    } catch (error) {
      logger.error(`Database initialization attempt ${i + 1} failed:`, error)
      
      if (i === retries - 1) {
        throw new Error('Failed to initialize database after multiple attempts')
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}