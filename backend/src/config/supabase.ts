import { createClient } from '@supabase/supabase-js'
import { logger } from '../utils/logger'

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key'

const hasValidSupabaseConfig = supabaseUrl.includes('supabase.co') && 
  !supabaseUrl.includes('your-project') && 
  !supabaseKey.includes('your-') && 
  !supabaseKey.includes('placeholder') && 
  supabaseKey.length > 50

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  db: {
    schema: 'public'
  }
})

// Database health check
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Check if we have valid Supabase configuration
    if (!hasValidSupabaseConfig) {
      logger.warn('⚠️  Supabase configuration not set up yet')
      return false
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found (acceptable for initial setup)
      logger.error('Supabase connection error:', error)
      return false
    }
    
    logger.info('✅ Supabase connection is healthy')
    return true
  } catch (error) {
    logger.error('❌ Supabase connection failed:', error)
    return false
  }
}

// Initialize database tables (SQL commands for Supabase)
export const initializeDatabase = async (): Promise<void> => {
  logger.info('🔧 Setting up Supabase database schema...')
  
  // We'll run these SQL commands in Supabase dashboard initially
  // Later we can use migrations or the Supabase CLI
  const sqlSchema = `
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR UNIQUE NOT NULL,
      password VARCHAR NOT NULL,
      first_name VARCHAR NOT NULL,
      last_name VARCHAR NOT NULL,
      role VARCHAR DEFAULT 'recruiter' CHECK (role IN ('admin', 'manager', 'recruiter', 'coordinator')),
      is_active BOOLEAN DEFAULT true,
      phone VARCHAR,
      avatar VARCHAR,
      preferences JSONB,
      last_login_at TIMESTAMP,
      reset_password_token VARCHAR,
      reset_password_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Candidates table
    CREATE TABLE IF NOT EXISTS candidates (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      first_name VARCHAR NOT NULL,
      last_name VARCHAR NOT NULL,
      email VARCHAR UNIQUE NOT NULL,
      phone VARCHAR,
      location VARCHAR,
      linkedin_url VARCHAR,
      portfolio_url VARCHAR,
      status VARCHAR DEFAULT 'new' CHECK (status IN ('new', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')),
      summary TEXT,
      skills JSONB,
      experience JSONB,
      education JSONB,
      certifications JSONB,
      languages JSONB,
      salary_expectation JSONB,
      ai_quality_score DECIMAL(3,1),
      ai_insights JSONB,
      tags JSONB,
      notes TEXT,
      is_active BOOLEAN DEFAULT true,
      last_contacted_at TIMESTAMP,
      source VARCHAR,
      assigned_to_id UUID REFERENCES users(id),
      current_job_id UUID,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Clients table
    CREATE TABLE IF NOT EXISTS clients (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      company_name VARCHAR NOT NULL,
      website VARCHAR,
      description TEXT,
      status VARCHAR DEFAULT 'prospect' CHECK (status IN ('prospect', 'active', 'inactive', 'blacklisted')),
      industry VARCHAR,
      company_size VARCHAR,
      address JSONB,
      phone VARCHAR,
      email VARCHAR,
      linkedin_url VARCHAR,
      contacts JSONB,
      contract_terms JSONB,
      rating DECIMAL(3,1),
      notes TEXT,
      tags JSONB,
      last_contacted_at TIMESTAMP,
      next_follow_up_at TIMESTAMP,
      total_jobs_posted INTEGER DEFAULT 0,
      total_jobs_filled INTEGER DEFAULT 0,
      total_revenue DECIMAL(15,2) DEFAULT 0,
      payment_method VARCHAR,
      payment_terms VARCHAR DEFAULT 'net30',
      is_active BOOLEAN DEFAULT true,
      source VARCHAR,
      preferences JSONB,
      assigned_to_id UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Jobs table
    CREATE TABLE IF NOT EXISTS jobs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed', 'filled', 'cancelled')),
      employment_type VARCHAR NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'temporary', 'internship')),
      location VARCHAR,
      is_remote BOOLEAN DEFAULT false,
      salary_range JSONB,
      required_skills JSONB NOT NULL,
      preferred_skills JSONB,
      requirements JSONB,
      benefits JSONB,
      application_deadline TIMESTAMP,
      start_date TIMESTAMP,
      priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      notes TEXT,
      tags JSONB,
      view_count INTEGER DEFAULT 0,
      application_count INTEGER DEFAULT 0,
      source_url VARCHAR,
      reference_number VARCHAR,
      fee DECIMAL(10,2),
      fee_type VARCHAR CHECK (fee_type IN ('percentage', 'fixed')),
      pipeline JSONB,
      is_active BOOLEAN DEFAULT true,
      client_id UUID NOT NULL REFERENCES clients(id),
      created_by_id UUID NOT NULL REFERENCES users(id),
      assigned_to_id UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      closed_at TIMESTAMP,
      filled_at TIMESTAMP
    );

    -- Add foreign key for candidates current_job_id
    ALTER TABLE candidates ADD CONSTRAINT fk_candidates_current_job 
      FOREIGN KEY (current_job_id) REFERENCES jobs(id);

    -- Documents table
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      original_name VARCHAR NOT NULL,
      file_name VARCHAR NOT NULL,
      file_path VARCHAR NOT NULL,
      mime_type VARCHAR NOT NULL,
      file_size INTEGER NOT NULL,
      type VARCHAR NOT NULL CHECK (type IN ('resume', 'cover_letter', 'portfolio', 'certificate', 'contract', 'job_description', 'other')),
      status VARCHAR DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'processed', 'failed')),
      description TEXT,
      tags JSONB,
      checksum VARCHAR,
      version INTEGER,
      is_public BOOLEAN DEFAULT false,
      expires_at TIMESTAMP,
      extracted_text TEXT,
      ai_analysis JSONB,
      metadata JSONB,
      download_count INTEGER,
      last_accessed_at TIMESTAMP,
      uploaded_by_id UUID NOT NULL REFERENCES users(id),
      candidate_id UUID REFERENCES candidates(id),
      client_id UUID REFERENCES clients(id),
      job_id UUID REFERENCES jobs(id),
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Communications table
    CREATE TABLE IF NOT EXISTS communications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      type VARCHAR NOT NULL CHECK (type IN ('email', 'phone', 'sms', 'linkedin', 'in_person', 'video_call', 'note')),
      direction VARCHAR NOT NULL CHECK (direction IN ('inbound', 'outbound')),
      subject VARCHAR,
      content TEXT NOT NULL,
      status VARCHAR DEFAULT 'sent' CHECK (status IN ('scheduled', 'sent', 'delivered', 'read', 'replied', 'failed', 'cancelled')),
      scheduled_for TIMESTAMP,
      sent_at TIMESTAMP,
      delivered_at TIMESTAMP,
      read_at TIMESTAMP,
      replied_at TIMESTAMP,
      recipients JSONB,
      from_email VARCHAR,
      from_phone VARCHAR,
      attachments JSONB,
      metadata JSONB,
      tags JSONB,
      notes TEXT,
      is_important BOOLEAN DEFAULT false,
      is_archived BOOLEAN DEFAULT false,
      follow_up_date TIMESTAMP,
      open_count INTEGER DEFAULT 0,
      click_count INTEGER DEFAULT 0,
      last_opened_at TIMESTAMP,
      last_clicked_at TIMESTAMP,
      sentiment_score DECIMAL(3,2),
      language_detected VARCHAR,
      ai_analysis JSONB,
      created_by_id UUID NOT NULL REFERENCES users(id),
      candidate_id UUID REFERENCES candidates(id),
      client_id UUID REFERENCES clients(id),
      job_id UUID REFERENCES jobs(id),
      parent_id UUID REFERENCES communications(id),
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- AI Processing Logs table
    CREATE TABLE IF NOT EXISTS ai_processing_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      type VARCHAR NOT NULL CHECK (type IN ('resume_parsing', 'candidate_screening', 'content_generation', 'insights_generation', 'workflow_execution')),
      provider VARCHAR NOT NULL,
      model VARCHAR NOT NULL,
      prompt TEXT NOT NULL,
      response TEXT,
      status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
      tokens_used INTEGER,
      cost DECIMAL(10,8),
      processing_time_ms INTEGER,
      confidence_score DECIMAL(3,2),
      metadata JSONB,
      error_message TEXT,
      user_id UUID REFERENCES users(id),
      candidate_id UUID REFERENCES candidates(id),
      document_id UUID REFERENCES documents(id),
      created_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
    CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
    CREATE INDEX IF NOT EXISTS idx_candidates_assigned_to ON candidates(assigned_to_id);
    CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
    CREATE INDEX IF NOT EXISTS idx_communications_candidate_id ON communications(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);
    CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_processing_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_ai_logs_type ON ai_processing_logs(type);

    -- Enable Row Level Security (RLS)
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
    ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
    ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE ai_processing_logs ENABLE ROW LEVEL SECURITY;
  `
  
  logger.info('📋 Database schema ready. Please run this SQL in your Supabase dashboard:')
  logger.info('👉 Go to https://app.supabase.com -> Your Project -> SQL Editor')
  logger.info('👉 Paste and run the schema commands to create tables')
}

// Log Supabase info
if (hasValidSupabaseConfig) {
  logger.info('🔌 Supabase client initialized')
  logger.info(`📍 URL: ${supabaseUrl}`)
  logger.info(`🔑 Using API Key: ${supabaseKey?.substring(0, 20)}...`)
} else {
  logger.warn('🔌 Supabase client initialized with placeholder config')
  logger.info('📖 Please set up Supabase - see SUPABASE_SETUP.md')
}

export default supabase