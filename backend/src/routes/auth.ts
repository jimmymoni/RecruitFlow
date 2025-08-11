import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// Function to get Supabase admin client (lazy initialization)
const getSupabaseAdmin = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Helper function to generate JWT tokens
const generateTokens = (userId: string, email: string, role: string) => {
  const accessToken = jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  )
  
  const refreshToken = jwt.sign(
    { userId, email, role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  )
  
  return { accessToken, refreshToken }
}

// Helper function to hash password
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

// Validation rules
const signupValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('role').optional().isIn(['admin', 'manager', 'recruiter', 'coordinator']).withMessage('Invalid role')
]

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
]

// POST /api/auth/signup - Register new user
router.post('/signup', signupValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password, firstName, lastName, role = 'recruiter', phone } = req.body

    // Check if user already exists
    const supabaseAdmin = getSupabaseAdmin()
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user in database
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          first_name: firstName,
          last_name: lastName,
          role,
          phone,
          is_active: true
        }
      ])
      .select('id, email, first_name, last_name, role, is_active, created_at')
      .single()

    if (error) {
      console.error('Signup error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account',
        error: error.message
      })
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(newUser.id, newUser.email, newUser.role)

    // Return success response (don't send refresh token in response body)
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
        isActive: newUser.is_active,
        createdAt: newUser.created_at
      },
      accessToken,
      refreshToken // In production, consider using httpOnly cookies
    })

  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error during signup'
    })
  }
})

// POST /api/auth/login - User login
router.post('/login', loginValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Get user from database
    const supabaseAdmin = getSupabaseAdmin()
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, password, first_name, last_name, role, is_active, last_login_at')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check if user account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Update last login time
    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id)

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role)

    // Return success response
    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        lastLoginAt: user.last_login_at
      },
      accessToken,
      refreshToken
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    })
  }
})

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any
    
    // Get current user data
    const supabaseAdmin = getSupabaseAdmin()
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, is_active')
      .eq('id', decoded.userId)
      .single()

    if (error || !user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      })
    }

    // Generate new tokens
    const tokens = generateTokens(user.id, user.email, user.role)

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    })
  }
})

// POST /api/auth/logout - User logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // In a more complex setup, you might want to blacklist the token
    // For now, we'll just return success as the client will remove the token
    return res.json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error during logout'
    })
  }
})

// GET /api/auth/me - Get current user profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Get user from database
    const supabaseAdmin = getSupabaseAdmin()
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, phone, avatar, last_login_at, created_at')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      })
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        phone: user.phone,
        avatar: user.avatar,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at
      }
    })

  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }
})

export default router