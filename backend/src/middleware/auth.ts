import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../services/database'
import { AppError } from './errorHandler'
import { logger } from '../utils/logger'

export interface AuthenticatedRequest extends Request {
  user?: any
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401)
    }

    const token = authHeader.substring(7)
    
    if (!token) {
      throw new AppError('No token provided', 401)
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string }
    
    // Get user from database
    const user = await db.findById('users', decoded.userId)

    if (!user) {
      throw new AppError('User not found', 401)
    }

    if (!user.is_active) {
      throw new AppError('Account deactivated', 401)
    }

    // Add user to request object
    req.user = user

    logger.info(`Authenticated user: ${user.email}`)
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401))
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401))
    } else {
      next(error)
    }
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401))
      return
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError('Insufficient permissions', 403))
      return
    }

    next()
  }
}

export const requireAdmin = requireRole(['admin'])
export const requireRecruiter = requireRole(['admin', 'recruiter'])
export const requireManager = requireRole(['admin', 'manager'])

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string }
        
        const user = await db.findById('users', decoded.userId)

        if (user && user.is_active) {
          req.user = user
        }
      }
    }
    
    next()
  } catch (error) {
    // In optional auth, we don't throw errors, just continue without user
    next()
  }
}