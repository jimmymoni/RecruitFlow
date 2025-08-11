import express from 'express'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// POST /api/firm-auth/register-firm - Register a new firm (master account)
router.post('/register-firm', async (req, res) => {
  try {
    const {
      firmName,
      domain,
      adminEmail,
      adminPassword,
      adminFirstName,
      adminLastName,
      subscriptionPlan = 'basic'
    } = req.body

    // Validate required fields
    if (!firmName || !adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
      return res.status(400).json({
        error: 'Missing required fields: firmName, adminEmail, adminPassword, adminFirstName, adminLastName'
      })
    }

    // Check if firm with domain already exists
    if (domain) {
      const { data: existingFirm } = await supabaseAdmin
        .from('firms')
        .select('id')
        .eq('domain', domain)
        .single()

      if (existingFirm) {
        return res.status(400).json({ error: 'Firm with this domain already exists' })
      }
    }

    // Check if admin email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('firm_users')
      .select('id')
      .eq('email', adminEmail)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Hash admin password
    const passwordHash = await bcrypt.hash(adminPassword, 10)

    // Start transaction by creating firm first
    const { data: firm, error: firmError } = await supabaseAdmin
      .from('firms')
      .insert([{
        name: firmName,
        domain: domain,
        subscription_plan: subscriptionPlan,
        max_users: subscriptionPlan === 'basic' ? 10 : subscriptionPlan === 'pro' ? 15 : 25,
        is_active: true
      }])
      .select()
      .single()

    if (firmError) {
      console.error('Firm creation error:', firmError)
      return res.status(500).json({ error: 'Failed to create firm' })
    }

    // Create admin user
    const { data: adminUser, error: userError } = await supabaseAdmin
      .from('firm_users')
      .insert([{
        firm_id: firm.id,
        email: adminEmail,
        password_hash: passwordHash,
        first_name: adminFirstName,
        last_name: adminLastName,
        display_name: `${adminFirstName} ${adminLastName}`,
        role: 'admin',
        status: 'active',
        is_online: false,
        user_status: 'offline'
      }])
      .select()
      .single()

    if (userError) {
      console.error('Admin user creation error:', userError)
      // Clean up firm if user creation fails
      await supabaseAdmin.from('firms').delete().eq('id', firm.id)
      return res.status(500).json({ error: 'Failed to create admin user' })
    }

    // Create default workspace channels
    const defaultChannels = [
      { name: 'general', description: 'General discussion for the team', category: 'general' },
      { name: 'announcements', description: 'Important company announcements', category: 'general' },
      { name: 'candidates', description: 'Discuss candidates and applications', category: 'candidates' },
      { name: 'jobs', description: 'Job postings and requirements', category: 'jobs' },
      { name: 'clients', description: 'Client relationships and updates', category: 'clients' }
    ]

    const channelsToInsert = defaultChannels.map((channel, index) => ({
      firm_id: firm.id,
      name: channel.name,
      description: channel.description,
      category: channel.category,
      type: 'text',
      is_private: false,
      position: index,
      created_by: adminUser.id
    }))

    const { error: channelsError } = await supabaseAdmin
      .from('workspace_channels')
      .insert(channelsToInsert)

    if (channelsError) {
      console.error('Channels creation error:', channelsError)
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        userId: adminUser.id,
        firmId: firm.id,
        email: adminUser.email,
        role: adminUser.role,
        type: 'firm_user'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      {
        userId: adminUser.id,
        firmId: firm.id,
        email: adminUser.email,
        role: adminUser.role,
        type: 'firm_user'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Update user's last login
    await supabaseAdmin
      .from('firm_users')
      .update({ 
        last_login_at: new Date().toISOString(),
        is_online: true,
        user_status: 'online'
      })
      .eq('id', adminUser.id)

    return res.status(201).json({
      success: true,
      message: 'Firm registered successfully',
      firm: {
        id: firm.id,
        name: firm.name,
        domain: firm.domain,
        subscription_plan: firm.subscription_plan,
        max_users: firm.max_users
      },
      user: {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.first_name,
        lastName: adminUser.last_name,
        displayName: adminUser.display_name,
        role: adminUser.role,
        isOnline: true
      },
      accessToken,
      refreshToken
    })

  } catch (err) {
    console.error('Firm registration error:', err)
    return res.status(500).json({ error: 'Internal server error during firm registration' })
  }
})

// POST /api/firm-auth/login - Login for firm users (sub-accounts)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('firm_users')
      .select(`
        *,
        firm:firms(
          id,
          name,
          domain,
          subscription_plan,
          max_users,
          is_active
        )
      `)
      .eq('email', email)
      .eq('status', 'active')
      .single()

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check if firm is active
    if (!user.firm.is_active) {
      return res.status(403).json({ error: 'Firm account is inactive' })
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash)
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        firmId: user.firm_id,
        email: user.email,
        role: user.role,
        type: 'firm_user'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        firmId: user.firm_id,
        email: user.email,
        role: user.role,
        type: 'firm_user'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Update user's last login and online status
    await supabaseAdmin
      .from('firm_users')
      .update({ 
        last_login_at: new Date().toISOString(),
        is_online: true,
        user_status: 'online'
      })
      .eq('id', user.id)

    return res.json({
      success: true,
      message: 'Login successful',
      firm: {
        id: user.firm.id,
        name: user.firm.name,
        domain: user.firm.domain,
        subscription_plan: user.firm.subscription_plan,
        max_users: user.firm.max_users
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name,
        role: user.role,
        department: user.department,
        jobTitle: user.job_title,
        isOnline: true,
        userStatus: 'online'
      },
      accessToken,
      refreshToken
    })

  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Internal server error during login' })
  }
})

// POST /api/firm-auth/invite-user - Invite new user to firm
router.post('/invite-user', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Check if user is admin or manager
    const { data: currentUser } = await supabaseAdmin
      .from('firm_users')
      .select('role, firm_id')
      .eq('id', decoded.userId)
      .single()

    if (!currentUser || !['admin', 'manager'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Only admins and managers can invite users' })
    }

    const { email, firstName, lastName, role = 'recruiter', department, jobTitle } = req.body

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, firstName, and lastName are required' })
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('firm_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Check firm user limit
    const { count: userCount } = await supabaseAdmin
      .from('firm_users')
      .select('*', { count: 'exact', head: true })
      .eq('firm_id', currentUser.firm_id)

    const { data: firm } = await supabaseAdmin
      .from('firms')
      .select('max_users')
      .eq('id', currentUser.firm_id)
      .single()

    if (userCount && firm && userCount >= firm.max_users) {
      return res.status(400).json({ error: 'Firm has reached maximum user limit' })
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex')

    // Create invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('firm_invitations')
      .insert([{
        firm_id: currentUser.firm_id,
        email: email,
        invited_by: decoded.userId,
        role: role,
        token: invitationToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }])
      .select()
      .single()

    if (inviteError) {
      console.error('Invitation creation error:', inviteError)
      return res.status(500).json({ error: 'Failed to create invitation' })
    }

    // TODO: Send invitation email
    // For now, return the invitation details

    return res.status(201).json({
      success: true,
      message: 'User invitation created successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        token: invitationToken,
        expiresAt: invitation.expires_at
      },
      // In production, you wouldn't return the token - it would be sent via email
      invitationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join-firm?token=${invitationToken}`
    })

  } catch (err) {
    console.error('User invitation error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/firm-auth/accept-invitation - Accept firm invitation
router.post('/accept-invitation', async (req, res) => {
  try {
    const { token, password, displayName } = req.body

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' })
    }

    // Find invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('firm_invitations')
      .select(`
        *,
        firm:firms(
          id,
          name,
          domain,
          is_active
        )
      `)
      .eq('token', token)
      .eq('is_used', false)
      .single()

    if (inviteError || !invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' })
    }

    // Check if invitation is expired
    if (new Date() > new Date(invitation.expires_at)) {
      return res.status(400).json({ error: 'Invitation has expired' })
    }

    // Check if firm is active
    if (!invitation.firm.is_active) {
      return res.status(403).json({ error: 'Firm account is inactive' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Extract name from email if not provided
    const emailParts = invitation.email.split('@')[0].split('.')
    const defaultFirstName = emailParts[0] || 'User'
    const defaultLastName = emailParts[1] || ''

    // Create user
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('firm_users')
      .insert([{
        firm_id: invitation.firm_id,
        email: invitation.email,
        password_hash: passwordHash,
        first_name: defaultFirstName,
        last_name: defaultLastName,
        display_name: displayName || `${defaultFirstName} ${defaultLastName}`,
        role: invitation.role,
        status: 'active',
        is_online: true,
        user_status: 'online',
        created_by: invitation.invited_by
      }])
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return res.status(500).json({ error: 'Failed to create user account' })
    }

    // Mark invitation as used
    await supabaseAdmin
      .from('firm_invitations')
      .update({ is_used: true })
      .eq('id', invitation.id)

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        userId: newUser.id,
        firmId: newUser.firm_id,
        email: newUser.email,
        role: newUser.role,
        type: 'firm_user'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      {
        userId: newUser.id,
        firmId: newUser.firm_id,
        email: newUser.email,
        role: newUser.role,
        type: 'firm_user'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      firm: {
        id: invitation.firm.id,
        name: invitation.firm.name,
        domain: invitation.firm.domain
      },
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        displayName: newUser.display_name,
        role: newUser.role,
        isOnline: true
      },
      accessToken,
      refreshToken
    })

  } catch (err) {
    console.error('Accept invitation error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/firm-auth/logout - Logout user
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        
        // Update user status to offline
        await supabaseAdmin
          .from('firm_users')
          .update({ 
            is_online: false,
            user_status: 'offline'
          })
          .eq('id', decoded.userId)
      } catch (err) {
        // Token might be expired, continue with logout
      }
    }

    return res.json({
      success: true,
      message: 'Logged out successfully'
    })

  } catch (err) {
    console.error('Logout error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/firm-auth/me - Get current user profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    const { data: user, error } = await supabaseAdmin
      .from('firm_users')
      .select(`
        *,
        firm:firms(
          id,
          name,
          domain,
          subscription_plan,
          max_users,
          is_active
        )
      `)
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({
      success: true,
      firm: {
        id: user.firm.id,
        name: user.firm.name,
        domain: user.firm.domain,
        subscription_plan: user.firm.subscription_plan,
        max_users: user.firm.max_users
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name,
        role: user.role,
        department: user.department,
        jobTitle: user.job_title,
        isOnline: user.is_online,
        userStatus: user.user_status,
        statusMessage: user.status_message,
        lastLoginAt: user.last_login_at
      }
    })

  } catch (err) {
    console.error('Get profile error:', err)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
})

export default router