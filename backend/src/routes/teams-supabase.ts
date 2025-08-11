import express from 'express'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
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

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// GET /api/teams - List user's teams
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('teams')
      .select(`
        *,
        team_members!inner(
          id,
          role,
          joined_at,
          is_active,
          user_id
        )
      `)
      .eq('team_members.user_id', req.user.userId)
      .eq('team_members.is_active', true)
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      teams: data || []
    })
  } catch (err) {
    console.error('Teams GET error:', err)
    return res.status(500).json({ error: 'Failed to fetch teams' })
  }
})

// GET /api/teams/:id - Get single team with members
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    
    // Check if user is member of this team
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', id)
      .eq('user_id', req.user.userId)
      .eq('is_active', true)
      .single()
    
    if (!membership) {
      return res.status(403).json({ error: 'Access denied - not a team member' })
    }
    
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select(`
        *,
        team_members(
          id,
          role,
          joined_at,
          is_active,
          users(
            id,
            first_name,
            last_name,
            email,
            avatar,
            role
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (teamError) {
      console.error('Database error:', teamError)
      return res.status(500).json({ error: teamError.message })
    }
    
    return res.json({
      success: true,
      team: team,
      userRole: membership.role
    })
  } catch (err) {
    console.error('Team GET error:', err)
    return res.status(500).json({ error: 'Failed to fetch team' })
  }
})

// POST /api/teams - Create new team
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { name, description, color = '#0ea5e9' } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Team name is required' })
    }
    
    // Create team
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .insert([{
        name,
        description,
        color,
        created_by: req.user.userId
      }])
      .select()
      .single()
    
    if (teamError) {
      console.error('Database error:', teamError)
      return res.status(500).json({ error: teamError.message })
    }
    
    // Add creator as admin member
    const { error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert([{
        team_id: team.id,
        user_id: req.user.userId,
        role: 'admin'
      }])
    
    if (memberError) {
      console.error('Member creation error:', memberError)
      // Try to clean up the team if member creation fails
      await supabaseAdmin.from('teams').delete().eq('id', team.id)
      return res.status(500).json({ error: 'Failed to add team creator as member' })
    }
    
    // Create default general channel
    const { error: channelError } = await supabaseAdmin
      .from('chat_channels')
      .insert([{
        name: 'General',
        description: 'General team discussion',
        type: 'team',
        team_id: team.id,
        created_by: req.user.userId
      }])
    
    if (channelError) {
      console.error('Channel creation error:', channelError)
    }
    
    return res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team: team
    })
  } catch (err) {
    console.error('Team POST error:', err)
    return res.status(500).json({ error: 'Failed to create team' })
  }
})

// POST /api/teams/:id/members - Add member to team
router.post('/:id/members', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const { email, role = 'member' } = req.body
    
    if (!email) {
      return res.status(400).json({ error: 'User email is required' })
    }
    
    // Check if current user is admin of this team
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', id)
      .eq('user_id', req.user.userId)
      .eq('is_active', true)
      .single()
    
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only team admins can add members' })
    }
    
    // Find user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('email', email)
      .single()
    
    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('team_id', id)
      .eq('user_id', user.id)
      .single()
    
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a team member' })
    }
    
    // Add user to team
    const { data: newMember, error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert([{
        team_id: id,
        user_id: user.id,
        role
      }])
      .select(`
        *,
        users(
          id,
          first_name,
          last_name,
          email,
          avatar,
          role
        )
      `)
      .single()
    
    if (memberError) {
      console.error('Member creation error:', memberError)
      return res.status(500).json({ error: memberError.message })
    }
    
    return res.status(201).json({
      success: true,
      message: `${user.first_name} ${user.last_name} added to team`,
      member: newMember
    })
  } catch (err) {
    console.error('Add member error:', err)
    return res.status(500).json({ error: 'Failed to add team member' })
  }
})

// DELETE /api/teams/:id/members/:userId - Remove member from team
router.delete('/:id/members/:userId', authenticateToken, async (req: any, res) => {
  try {
    const { id, userId } = req.params
    
    // Check if current user is admin of this team
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', id)
      .eq('user_id', req.user.userId)
      .eq('is_active', true)
      .single()
    
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only team admins can remove members' })
    }
    
    // Get member info before deletion
    const { data: member } = await supabaseAdmin
      .from('team_members')
      .select(`
        *,
        users(first_name, last_name, email)
      `)
      .eq('team_id', id)
      .eq('user_id', userId)
      .single()
    
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' })
    }
    
    // Remove member
    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('team_id', id)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      message: `${member.users.first_name} ${member.users.last_name} removed from team`
    })
  } catch (err) {
    console.error('Remove member error:', err)
    return res.status(500).json({ error: 'Failed to remove team member' })
  }
})

// PUT /api/teams/:id - Update team
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const { name, description, color } = req.body
    
    // Check if user is admin of this team
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', id)
      .eq('user_id', req.user.userId)
      .eq('is_active', true)
      .single()
    
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only team admins can update team details' })
    }
    
    const updateData = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(color && { color }),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabaseAdmin
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      message: 'Team updated successfully',
      team: data
    })
  } catch (err) {
    console.error('Team PUT error:', err)
    return res.status(500).json({ error: 'Failed to update team' })
  }
})

// GET /api/teams/:id/channels - Get team chat channels
router.get('/:id/channels', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    
    // Check if user is member of this team
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', id)
      .eq('user_id', req.user.userId)
      .eq('is_active', true)
      .single()
    
    if (!membership) {
      return res.status(403).json({ error: 'Access denied - not a team member' })
    }
    
    const { data, error } = await supabaseAdmin
      .from('chat_channels')
      .select('*')
      .eq('team_id', id)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      channels: data || []
    })
  } catch (err) {
    console.error('Channels GET error:', err)
    return res.status(500).json({ error: 'Failed to fetch channels' })
  }
})

export default router