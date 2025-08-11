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

// GET /api/candidates - List all candidates
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const { page = 1, limit = 20, search, status, skills } = req.query
    
    let query = supabaseAdmin
      .from('candidates')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        location,
        status,
        summary,
        skills,
        created_at,
        updated_at
      `)
    
    // Add search filter
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,skills.cs.{${search}}`)
    }
    
    // Add status filter
    if (status) {
      query = query.eq('status', status)
    }
    
    // Add skills filter
    if (skills) {
      const skillsArray = skills.split(',')
      query = query.contains('skills', skillsArray)
    }
    
    // Add pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    
    // Execute query
    const { data, error, count } = await query
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      candidates: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (err) {
    console.error('Candidates GET error:', err)
    return res.status(500).json({ error: 'Failed to fetch candidates' })
  }
})

// GET /api/candidates/:id - Get single candidate
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    
    const { data, error } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Candidate not found' })
      }
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      candidate: data
    })
  } catch (err) {
    console.error('Candidate GET error:', err)
    return res.status(500).json({ error: 'Failed to fetch candidate' })
  }
})

// POST /api/candidates - Create new candidate
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      status = 'new',
      summary,
      skills = []
    } = req.body
    
    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields: firstName, lastName, email' 
      })
    }
    
    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('candidates')
      .select('id')
      .eq('email', email)
      .single()
    
    if (existing) {
      return res.status(400).json({ error: 'Candidate with this email already exists' })
    }
    
    const candidateData = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      location,
      status,
      summary,
      skills: skills || []
    }
    
    const { data, error } = await supabaseAdmin
      .from('candidates')
      .insert([candidateData])
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      candidate: data
    })
  } catch (err) {
    console.error('Candidate POST error:', err)
    return res.status(500).json({ error: 'Failed to create candidate' })
  }
})

// PUT /api/candidates/:id - Update candidate
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      status,
      summary,
      skills
    } = req.body
    
    // Check if candidate exists
    const { data: existing } = await supabaseAdmin
      .from('candidates')
      .select('id')
      .eq('id', id)
      .single()
    
    if (!existing) {
      return res.status(404).json({ error: 'Candidate not found' })
    }
    
    // Check if email is already used by another candidate
    if (email) {
      const { data: emailExists } = await supabaseAdmin
        .from('candidates')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .single()
      
      if (emailExists) {
        return res.status(400).json({ error: 'Email already used by another candidate' })
      }
    }
    
    const updateData = {
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(location && { location }),
      ...(status && { status }),
      ...(summary && { summary }),
      ...(skills && { skills }),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabaseAdmin
      .from('candidates')
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
      message: 'Candidate updated successfully',
      candidate: data
    })
  } catch (err) {
    console.error('Candidate PUT error:', err)
    return res.status(500).json({ error: 'Failed to update candidate' })
  }
})

// DELETE /api/candidates/:id - Delete candidate
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    
    // Check if candidate exists
    const { data: existing } = await supabaseAdmin
      .from('candidates')
      .select('id, first_name, last_name')
      .eq('id', id)
      .single()
    
    if (!existing) {
      return res.status(404).json({ error: 'Candidate not found' })
    }
    
    const { error } = await supabaseAdmin
      .from('candidates')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      message: `Candidate ${existing.first_name} ${existing.last_name} deleted successfully`
    })
  } catch (err) {
    console.error('Candidate DELETE error:', err)
    return res.status(500).json({ error: 'Failed to delete candidate' })
  }
})

// GET /api/candidates/stats/overview - Get candidate statistics
router.get('/stats/overview', authenticateToken, async (req: any, res) => {
  try {
    // Get total candidates
    const { count: totalCandidates } = await supabaseAdmin
      .from('candidates')
      .select('*', { count: 'exact', head: true })
    
    // Get candidates by status
    const { data: statusCounts } = await supabaseAdmin
      .from('candidates')
      .select('status')
    
    const statusStats: any = statusCounts?.reduce((acc: any, candidate) => {
      acc[candidate.status] = (acc[candidate.status] || 0) + 1
      return acc
    }, {}) || {}
    
    // Get recent candidates (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: recentCandidates } = await supabaseAdmin
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo)
    
    return res.json({
      success: true,
      stats: {
        total: totalCandidates || 0,
        recent: recentCandidates || 0,
        byStatus: statusStats,
        activeStatuses: ['new', 'screening', 'interview'].reduce((sum: number, status: string) => 
          sum + (statusStats[status] || 0), 0)
      }
    })
  } catch (err) {
    console.error('Candidate stats error:', err)
    return res.status(500).json({ error: 'Failed to fetch candidate statistics' })
  }
})

export default router