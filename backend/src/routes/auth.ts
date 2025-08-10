import { Router, Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from '../services/database'
import { AppError } from '../middleware/errorHandler'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth'
import { logger } from '../utils/logger'

const router = Router()

// Register new user
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, role = 'recruiter' } = req.body

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      throw new AppError('All fields are required', 400)
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400)
    }

    // Check if user already exists
    const existingUser = await db.findUserByEmail(email)
    if (existingUser) {
      throw new AppError('User with this email already exists', 409)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const user = await db.createUser({
      email: email.toLowerCase(),
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role,
      preferences: {
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        dashboard: {
          layout: 'default',
          widgets: ['candidates', 'jobs', 'pipeline', 'activity']
        }
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' }
    )

    logger.info(`User registered: ${user.email}`)

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          fullName: `${user.first_name} ${user.last_name}`,
          role: user.role,
          isActive: user.is_active,
          preferences: user.preferences,
          createdAt: user.created_at
        },
        token,
        refreshToken
      }
    })
  } catch (error) {
    next(error)
  }
})

// Login user
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      throw new AppError('Email and password are required', 400)
    }

    // Find user with password
    const user = await userRepository.findOne({
      where: { email: email.toLowerCase() },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'isActive', 'preferences', 'lastLoginAt']
    })

    if (!user) {
      throw new AppError('Invalid email or password', 401)
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401)
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401)
    }

    // Update last login
    user.lastLoginAt = new Date()
    await userRepository.save(user)

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' }
    )

    logger.info(`User logged in: ${user.email}`)

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
          preferences: user.preferences,
          lastLoginAt: user.lastLoginAt
        },
        token,
        refreshToken
      }
    })
  } catch (error) {
    next(error)
  }
})

// Refresh token
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400)
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      userId: string
      type: string
    }

    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid refresh token', 401)
    }

    // Get user
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']
    })

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401)
    }

    // Generate new tokens
    const newToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    const newRefreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' }
    )

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      next(new AppError('Invalid refresh token', 401))
    } else {
      next(error)
    }
  }
})

// Get current user profile
router.get('/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userRepository.findOne({
      where: { id: req.user!.id },
      relations: ['candidates', 'jobs', 'clients']
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
          phone: user.phone,
          avatar: user.avatar,
          preferences: user.preferences,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          stats: {
            candidatesCount: user.candidates?.length || 0,
            jobsCount: user.jobs?.length || 0,
            clientsCount: user.clients?.length || 0
          }
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

// Update user profile
router.put('/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, phone, preferences } = req.body
    const userId = req.user!.id

    const user = await userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Update user fields
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (phone !== undefined) user.phone = phone
    if (preferences) user.preferences = { ...user.preferences, ...preferences }

    await userRepository.save(user)

    logger.info(`User profile updated: ${user.email}`)

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          phone: user.phone,
          preferences: user.preferences,
          updatedAt: user.updatedAt
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

// Change password
router.put('/change-password', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user!.id

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400)
    }

    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters long', 400)
    }

    // Get user with password
    const user = await userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'password']
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400)
    }

    // Hash new password and save
    user.password = await bcrypt.hash(newPassword, 12)
    await userRepository.save(user)

    logger.info(`Password changed for user: ${user.email}`)

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Logout (client-side token invalidation)
router.post('/logout', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  logger.info(`User logged out: ${req.user!.email}`)
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

// Forgot password (initiate reset)
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body

    if (!email) {
      throw new AppError('Email is required', 400)
    }

    const user = await userRepository.findOne({ where: { email: email.toLowerCase() } })
    if (!user) {
      // Don't reveal if user exists or not
      res.json({
        success: true,
        message: 'If the email exists in our system, a password reset link has been sent'
      })
      return
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )

    // Save reset token and expiry
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
    await userRepository.save(user)

    // In production, send email with reset link
    // For now, just log the token for development
    logger.info(`Password reset token for ${user.email}: ${resetToken}`)

    res.json({
      success: true,
      message: 'If the email exists in our system, a password reset link has been sent',
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    })
  } catch (error) {
    next(error)
  }
})

// Reset password
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetToken, newPassword } = req.body

    if (!resetToken || !newPassword) {
      throw new AppError('Reset token and new password are required', 400)
    }

    if (newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400)
    }

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET!) as {
      userId: string
      type: string
    }

    if (decoded.type !== 'password_reset') {
      throw new AppError('Invalid reset token', 401)
    }

    // Get user and verify token
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
      select: ['id', 'email', 'resetPasswordToken', 'resetPasswordExpires']
    })

    if (!user || user.resetPasswordToken !== resetToken || 
        !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new AppError('Invalid or expired reset token', 401)
    }

    // Update password and clear reset token
    user.password = await bcrypt.hash(newPassword, 12)
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await userRepository.save(user)

    logger.info(`Password reset completed for user: ${user.email}`)

    res.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      next(new AppError('Invalid or expired reset token', 401))
    } else {
      next(error)
    }
  }
})

export default router