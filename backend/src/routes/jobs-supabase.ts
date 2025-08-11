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

// GET /api/jobs - List all jobs
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const { page = 1, limit = 20, search, status, location, company } = req.query
    
    let query = supabaseAdmin
      .from('jobs')
      .select(`
        id,
        title,
        company,
        location,
        type,
        status,
        description,
        requirements,
        salary_min,
        salary_max,
        currency,
        benefits,
        skills_required,
        experience_level,
        posted_at,
        closing_date,
        applications_count,
        views_count,
        created_by,
        created_at,
        updated_at
      `)
    
    // Add search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    // Add status filter
    if (status) {
      query = query.eq('status', status)
    }
    
    // Add location filter
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    
    // Add company filter
    if (company) {
      query = query.ilike('company', `%${company}%`)
    }
    
    // Add pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })
    
    // Execute query
    const { data, error, count } = await query
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      jobs: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (err) {
    console.error('Jobs GET error:', err)
    return res.status(500).json({ error: 'Failed to fetch jobs' })
  }
})

// GET /api/jobs/:id - Get single job
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Job not found' })
      }
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      job: data
    })
  } catch (err) {
    console.error('Job GET error:', err)
    return res.status(500).json({ error: 'Failed to fetch job' })
  }
})

// POST /api/jobs - Create new job
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const {
      title,
      company,
      location,
      type = 'full-time',
      status = 'draft',
      description,
      requirements,
      salaryMin,
      salaryMax,
      currency = 'USD',
      benefits,
      skillsRequired = [],
      experienceLevel = 'mid',
      closingDate,
      isRemote = false
    } = req.body
    
    // Validate required fields
    if (!title || !company) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, company' 
      })
    }
    
    const jobData = {
      title,
      company,
      location,
      type,
      status,
      description,
      requirements,
      salary_min: salaryMin,
      salary_max: salaryMax,
      currency,
      benefits,
      skills_required: skillsRequired,
      experience_level: experienceLevel,
      closing_date: closingDate ? new Date(closingDate).toISOString() : null,
      is_remote: isRemote,
      applications_count: 0,
      views_count: 0,
      posted_at: status === 'active' ? new Date().toISOString() : null,
      created_by: req.user.id
    }
    
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert([jobData])
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: data
    })
  } catch (err) {
    console.error('Job POST error:', err)
    return res.status(500).json({ error: 'Failed to create job' })
  }
})

// PUT /api/jobs/:id - Update job
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const {
      title,
      company,
      location,
      type,
      status,
      description,
      requirements,
      salaryMin,
      salaryMax,
      currency,
      benefits,
      skillsRequired,
      experienceLevel,
      closingDate,
      isRemote
    } = req.body
    
    // Check if job exists
    const { data: existing } = await supabaseAdmin
      .from('jobs')
      .select('id, status')
      .eq('id', id)
      .single()
    
    if (!existing) {
      return res.status(404).json({ error: 'Job not found' })
    }
    
    const updateData: any = {
      ...(title && { title }),
      ...(company && { company }),
      ...(location && { location }),
      ...(type && { type }),
      ...(description && { description }),
      ...(requirements && { requirements }),
      ...(salaryMin && { salary_min: salaryMin }),
      ...(salaryMax && { salary_max: salaryMax }),
      ...(currency && { currency }),
      ...(benefits && { benefits }),
      ...(skillsRequired && { skills_required: skillsRequired }),
      ...(experienceLevel && { experience_level: experienceLevel }),
      ...(closingDate && { closing_date: new Date(closingDate).toISOString() }),
      ...(isRemote !== undefined && { is_remote: isRemote }),
      updated_at: new Date().toISOString()
    }
    
    // Handle status changes
    if (status && status !== existing.status) {
      updateData.status = status
      if (status === 'active' && existing.status === 'draft') {
        updateData.posted_at = new Date().toISOString()
      }
    }
    
    const { data, error } = await supabaseAdmin
      .from('jobs')
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
      message: 'Job updated successfully',
      job: data
    })
  } catch (err) {
    console.error('Job PUT error:', err)
    return res.status(500).json({ error: 'Failed to update job' })
  }
})

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    
    // Check if job exists
    const { data: existing } = await supabaseAdmin
      .from('jobs')
      .select('id, title, company')
      .eq('id', id)
      .single()
    
    if (!existing) {
      return res.status(404).json({ error: 'Job not found' })
    }
    
    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      message: `Job "${existing.title}" at ${existing.company} deleted successfully`
    })
  } catch (err) {
    console.error('Job DELETE error:', err)
    return res.status(500).json({ error: 'Failed to delete job' })
  }
})

// POST /api/jobs/:id/status - Update job status
router.post('/:id/status', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }
    
    const validStatuses = ['draft', 'active', 'paused', 'closed', 'filled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      })
    }
    
    const { data: existing } = await supabaseAdmin
      .from('jobs')
      .select('status')
      .eq('id', id)
      .single()
    
    if (!existing) {
      return res.status(404).json({ error: 'Job not found' })
    }
    
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }
    
    // Set posted_at when activating a draft job
    if (status === 'active' && existing.status === 'draft') {
      updateData.posted_at = new Date().toISOString()
    }
    
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      message: 'Job status updated successfully',
      job: data
    })
  } catch (err) {
    console.error('Job status update error:', err)
    return res.status(500).json({ error: 'Failed to update job status' })
  }
})

// GET /api/jobs/stats/overview - Get job statistics
router.get('/stats/overview', authenticateToken, async (req: any, res) => {
  try {
    // Get total jobs
    const { count: totalJobs } = await supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact', head: true })
    
    // Get jobs by status
    const { data: statusCounts } = await supabaseAdmin
      .from('jobs')
      .select('status')
    
    const statusStats: any = statusCounts?.reduce((acc: any, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1
      return acc
    }, {}) || {}
    
    // Get recent jobs (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: recentJobs } = await supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo)
    
    // Get active jobs
    const activeJobs = statusStats['active'] || 0
    
    return res.json({
      success: true,
      stats: {
        total: totalJobs || 0,
        active: activeJobs,
        recent: recentJobs || 0,
        byStatus: statusStats,
        draft: statusStats['draft'] || 0,
        closed: statusStats['closed'] || 0,
        filled: statusStats['filled'] || 0
      }
    })
  } catch (err) {
    console.error('Job stats error:', err)
    return res.status(500).json({ error: 'Failed to fetch job statistics' })
  }
})

export default router