import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import authRoutes from './routes/auth'
import candidatesRoutes from './routes/candidates-supabase'
import jobsRoutes from './routes/jobs-supabase'
import clientsRoutes from './routes/clients-supabase'
import filesRoutes from './routes/files-supabase'
import teamsRoutes from './routes/teams-supabase'
import tasksRoutes from './routes/tasks-supabase'
import firmAuthRoutes from './routes/firm-auth'
import chatRoutes from './routes/chat'

dotenv.config()

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Admin client for write operations (bypasses RLS)
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

const app = express()
const PORT = process.env.PORT || 3001

// Basic middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/candidates', candidatesRoutes)
app.use('/api/jobs', jobsRoutes)
app.use('/api/clients', clientsRoutes)
app.use('/api/files', filesRoutes)
app.use('/api/teams', teamsRoutes)
app.use('/api/tasks', tasksRoutes)
app.use('/api/firm-auth', firmAuthRoutes)
app.use('/api/chat', chatRoutes)

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
    const { data, error } = await supabaseAdmin
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

// Test endpoint for candidates schema check
app.get('/api/candidates-schema-test', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('candidates')
      .select('id, first_name, last_name, email, status, phone, location, summary, skills')
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

// Add sample candidates for testing
app.post('/api/candidates/sample', async (req, res) => {
  try {
    const sampleCandidates = [
      {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0123',
        location: 'San Francisco, CA',
        status: 'screening',
        summary: 'Senior Frontend Developer with 5+ years experience in React and TypeScript',
        skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Node.js'],
        experience: [
          { company: 'TechCorp', title: 'Senior Frontend Developer', years: '2021-2024' },
          { company: 'StartupXYZ', title: 'Frontend Developer', years: '2019-2021' }
        ]
      },
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-0456',
        location: 'New York, NY',
        status: 'interview',
        summary: 'Full Stack Developer with expertise in Python and React',
        skills: ['Python', 'React', 'Django', 'PostgreSQL', 'AWS'],
        experience: [
          { company: 'BigTech', title: 'Full Stack Developer', years: '2020-2024' },
          { company: 'MediumCorp', title: 'Backend Developer', years: '2018-2020' }
        ]
      },
      {
        first_name: 'Emily',
        last_name: 'Chen',
        email: 'emily.chen@email.com',
        phone: '+1-555-0789',
        location: 'Seattle, WA',
        status: 'new',
        summary: 'DevOps Engineer with cloud infrastructure experience',
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Python'],
        experience: [
          { company: 'CloudCorp', title: 'DevOps Engineer', years: '2022-2024' },
          { company: 'StartupABC', title: 'Junior DevOps', years: '2020-2022' }
        ]
      }
    ]

    const { data, error } = await supabaseAdmin
      .from('candidates')
      .insert(sampleCandidates)
      .select()
    
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      message: 'Sample candidates created successfully',
      count: data.length,
      candidates: data
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create sample candidates', details: err })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 RecruitFlow Backend running on port ${PORT}`)
  console.log(`✅ Supabase URL: ${process.env.SUPABASE_URL}`)
  console.log(`✅ Supabase Key Length: ${process.env.SUPABASE_ANON_KEY?.length}`)
  console.log(`📋 Test: http://localhost:${PORT}/api/health`)
}).on('error', (err) => {
  console.error('❌ Server startup error:', err)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err)
  process.exit(1)
})