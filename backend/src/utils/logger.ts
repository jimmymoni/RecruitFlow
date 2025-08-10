import winston from 'winston'
import path from 'path'

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

// Custom format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
)

// Transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}`
      )
    )
  }),
  
  // Error log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
]

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'rejections.log')
    })
  ]
})

// AI-specific logging methods
export const aiLogger = {
  request: (provider: string, prompt: string, tokens?: number) => {
    logger.info(`AI Request [${provider}]: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''} | Tokens: ${tokens || 'unknown'}`)
  },
  
  response: (provider: string, success: boolean, tokens?: number, cost?: number, duration?: number) => {
    const status = success ? 'SUCCESS' : 'FAILED'
    logger.info(`AI Response [${provider}]: ${status} | Tokens: ${tokens || 0} | Cost: $${(cost || 0).toFixed(6)} | Duration: ${duration || 0}ms`)
  },
  
  error: (provider: string, error: Error, context?: any) => {
    logger.error(`AI Error [${provider}]: ${error.message}`, { error: error.stack, context })
  },
  
  usage: (provider: string, totalTokens: number, totalCost: number, requestCount: number) => {
    logger.info(`AI Usage [${provider}]: ${requestCount} requests | ${totalTokens} tokens | $${totalCost.toFixed(6)} total cost`)
  },
  
  fallback: (fromProvider: string, toProvider: string, reason: string) => {
    logger.warn(`AI Fallback: ${fromProvider} → ${toProvider} | Reason: ${reason}`)
  }
}

export { logger }