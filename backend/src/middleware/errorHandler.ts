import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export interface CustomError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export class AppError extends Error implements CustomError {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  return new AppError(message, statusCode)
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let { statusCode = 500, message } = err

  // Log error details
  logger.error(`Error ${statusCode}: ${message}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query
  })

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401
    message = 'Unauthorized'
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  } else if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
  } else if (err.message?.includes('duplicate key')) {
    statusCode = 409
    message = 'Resource already exists'
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const errorResponse: any = {
    status: 'error',
    message: isDevelopment ? message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && {
      error: {
        name: err.name,
        stack: err.stack,
        statusCode
      }
    })
  }

  res.status(statusCode).json(errorResponse)
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = createError(`Route ${req.originalUrl} not found`, 404)
  next(error)
}