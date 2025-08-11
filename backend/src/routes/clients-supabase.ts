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

// GET /api/clients - List all clients
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const { page = 1, limit = 20, search, status, industry } = req.query
    
    let query = supabaseAdmin
      .from('clients')
      .select(`
        id,
        company_name,
        contact_name,
        contact_email,
        contact_phone,
        website,
        industry,
        company_size,
        status,
        billing_address,
        notes,
        contract_start_date,
        contract_end_date,
        payment_terms,
        total_jobs_posted,
        total_placements,
        total_revenue,
        satisfaction_rating,
        preferred_communication,
        timezone,
        created_by,
        created_at,
        updated_at
      `)
    
    // Add search filter
    if (search) {
      query = query.or(`company_name.ilike.%${search}%,contact_name.ilike.%${search}%,contact_email.ilike.%${search}%`)
    }
    
    // Add status filter
    if (status) {
      query = query.eq('status', status)
    }
    
    // Add industry filter
    if (industry) {
      query = query.eq('industry', industry)
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
      clients: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (err) {
    console.error('Clients GET error:', err)
    return res.status(500).json({ error: 'Failed to fetch clients' })
  }
})

// GET /api/clients/:id - Get single client
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Client not found' })
      }
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      client: data
    })
  } catch (err) {
    console.error('Client GET error:', err)
    return res.status(500).json({ error: 'Failed to fetch client' })
  }
})

// POST /api/clients - Create new client
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      website,
      industry,
      companySize,
      status = 'prospective',
      billingAddress,
      notes,
      contractStartDate,
      contractEndDate,
      paymentTerms,
      preferredCommunication = 'email',
      timezone
    } = req.body
    
    // Validate required fields
    if (!companyName || !contactName || !contactEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: companyName, contactName, contactEmail' 
      })
    }
    
    // Check if client with email already exists
    const { data: existing } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('contact_email', contactEmail)
      .single()
    
    if (existing) {
      return res.status(400).json({ error: 'Client with this email already exists' })
    }
    
    const clientData = {
      company_name: companyName,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      website,
      industry,
      company_size: companySize,
      status,
      billing_address: billingAddress,
      notes,
      contract_start_date: contractStartDate ? new Date(contractStartDate).toISOString() : null,
      contract_end_date: contractEndDate ? new Date(contractEndDate).toISOString() : null,
      payment_terms: paymentTerms,
      preferred_communication: preferredCommunication,
      timezone,
      total_jobs_posted: 0,
      total_placements: 0,
      total_revenue: 0,
      satisfaction_rating: null,
      created_by: req.user.id
    }
    
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert([clientData])
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.status(201).json({
      success: true,
      message: 'Client created successfully',
      client: data
    })
  } catch (err) {
    console.error('Client POST error:', err)
    return res.status(500).json({ error: 'Failed to create client' })
  }
})

// PUT /api/clients/:id - Update client
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      website,
      industry,
      companySize,
      status,
      billingAddress,
      notes,
      contractStartDate,
      contractEndDate,
      paymentTerms,
      satisfactionRating,
      preferredCommunication,
      timezone
    } = req.body
    
    // Check if client exists
    const { data: existing } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('id', id)
      .single()
    
    if (!existing) {
      return res.status(404).json({ error: 'Client not found' })
    }
    
    // Check if email is already used by another client
    if (contactEmail) {
      const { data: emailExists } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('contact_email', contactEmail)
        .neq('id', id)
        .single()
      
      if (emailExists) {
        return res.status(400).json({ error: 'Email already used by another client' })
      }
    }
    
    const updateData = {
      ...(companyName && { company_name: companyName }),
      ...(contactName && { contact_name: contactName }),
      ...(contactEmail && { contact_email: contactEmail }),
      ...(contactPhone !== undefined && { contact_phone: contactPhone }),
      ...(website !== undefined && { website }),
      ...(industry && { industry }),
      ...(companySize && { company_size: companySize }),
      ...(status && { status }),
      ...(billingAddress !== undefined && { billing_address: billingAddress }),
      ...(notes !== undefined && { notes }),
      ...(contractStartDate && { contract_start_date: new Date(contractStartDate).toISOString() }),
      ...(contractEndDate && { contract_end_date: new Date(contractEndDate).toISOString() }),
      ...(paymentTerms !== undefined && { payment_terms: paymentTerms }),
      ...(satisfactionRating !== undefined && { satisfaction_rating: satisfactionRating }),
      ...(preferredCommunication && { preferred_communication: preferredCommunication }),
      ...(timezone && { timezone }),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabaseAdmin
      .from('clients')
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
      message: 'Client updated successfully',
      client: data
    })
  } catch (err) {
    console.error('Client PUT error:', err)
    return res.status(500).json({ error: 'Failed to update client' })
  }
})

// DELETE /api/clients/:id - Delete client
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    
    // Check if client exists
    const { data: existing } = await supabaseAdmin
      .from('clients')
      .select('id, company_name, contact_name')
      .eq('id', id)
      .single()
    
    if (!existing) {
      return res.status(404).json({ error: 'Client not found' })
    }
    
    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      message: `Client ${existing.company_name} (${existing.contact_name}) deleted successfully`
    })
  } catch (err) {
    console.error('Client DELETE error:', err)
    return res.status(500).json({ error: 'Failed to delete client' })
  }
})

// GET /api/clients/stats/overview - Get client statistics
router.get('/stats/overview', authenticateToken, async (req: any, res) => {
  try {
    // Get total clients
    const { count: totalClients } = await supabaseAdmin
      .from('clients')
      .select('*', { count: 'exact', head: true })
    
    // Get clients by status
    const { data: statusCounts } = await supabaseAdmin
      .from('clients')
      .select('status')
    
    const statusStats: any = statusCounts?.reduce((acc: any, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1
      return acc
    }, {}) || {}
    
    // Get recent clients (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: recentClients } = await supabaseAdmin
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo)
    
    // Get active clients
    const activeClients = (statusStats['active'] || 0) + (statusStats['contract_signed'] || 0)
    
    return res.json({
      success: true,
      stats: {
        total: totalClients || 0,
        active: activeClients,
        recent: recentClients || 0,
        byStatus: statusStats,
        prospective: statusStats['prospective'] || 0,
        inactive: statusStats['inactive'] || 0
      }
    })
  } catch (err) {
    console.error('Client stats error:', err)
    return res.status(500).json({ error: 'Failed to fetch client statistics' })
  }
})

export default router