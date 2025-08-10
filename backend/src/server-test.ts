import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

const app = express()
const PORT = process.env.PORT || 3001

// Basic middleware
app.use(cors())
app.use(express.json())

// Test endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'RecruitFlow Backend is running',
    timestamp: new Date().toISOString(),
    supabase: {
      url: process.env.SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_ANON_KEY,
      keyLength: process.env.SUPABASE_ANON_KEY?.length || 0
    }
  })
})

app.get('/api', (req, res) => {
  res.json({
    name: 'RecruitFlow Backend API',
    version: '1.0.0',
    description: 'AI-powered recruitment management system',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      candidates: '/api/candidates'
    }
  })
})

// Test database connection
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .limit(10)
    
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      count: data.length,
      users: data
    })
  } catch (err) {
    return res.status(500).json({ error: 'Database connection failed', details: err })
  }
})

// Test endpoint for candidates
app.get('/api/candidates', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('id, first_name, last_name, email, status')
      .limit(10)
    
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      count: data.length,
      candidates: data
    })
  } catch (err) {
    return res.status(500).json({ error: 'Database connection failed', details: err })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 RecruitFlow Backend running on port ${PORT}`)
  console.log(`✅ Supabase URL: ${process.env.SUPABASE_URL}`)
  console.log(`✅ Supabase Key Length: ${process.env.SUPABASE_ANON_KEY?.length}`)
  console.log(`📋 Test: http://localhost:${PORT}/api/health`)
})