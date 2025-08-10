# 🚀 RecruitFlow - Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Choose:
   - **Name**: RecruitFlow
   - **Password**: Choose a strong password
   - **Region**: Closest to you
5. Wait for project creation (2-3 minutes)

## Step 2: Get Your Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsI...`)
   - **service_role key** (starts with `eyJhbGciOiJIUzI1NiIsI...`)

## Step 3: Update Environment Variables

Open `backend/.env` file and replace:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsI... (your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsI... (your service role key)
```

## Step 4: Set Up Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
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
CREATE TABLE candidates (
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
CREATE TABLE clients (
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
CREATE TABLE jobs (
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

-- Communications table
CREATE TABLE communications (
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
  created_by_id UUID NOT NULL REFERENCES users(id),
  candidate_id UUID REFERENCES candidates(id),
  client_id UUID REFERENCES clients(id),
  job_id UUID REFERENCES jobs(id),
  parent_id UUID REFERENCES communications(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Processing Logs table
CREATE TABLE ai_processing_logs (
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
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_assigned_to ON candidates(assigned_to_id);
CREATE INDEX idx_candidates_created_at ON candidates(created_at);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_communications_candidate_id ON communications(candidate_id);
CREATE INDEX idx_communications_created_at ON communications(created_at);
CREATE INDEX idx_ai_logs_created_at ON ai_processing_logs(created_at);
CREATE INDEX idx_ai_logs_type ON ai_processing_logs(type);
```

4. Click **Run** to execute the SQL
5. You should see "Success. No rows returned" message

## Step 5: Test Your Setup

1. Go to `backend/` folder in terminal
2. Run: `npm run dev`
3. You should see:
   ```
   🔌 Supabase client initialized
   📍 URL: https://your-project.supabase.co
   🚀 RecruitFlow Backend running on port 5000
   ```

## Step 6: Create Your First User

Test the registration endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@recruitflow.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

## 🎉 You're Ready!

Your RecruitFlow backend is now connected to Supabase and ready to use!

## Troubleshooting

- **"Missing Supabase environment variables"**: Make sure your `.env` file has the correct keys
- **"relation does not exist"**: Run the SQL commands in Step 4
- **Connection errors**: Check your Supabase URL and keys are correct
- **Permission errors**: Make sure you're using the service role key for backend operations

## Next Steps

- Set up the frontend to connect to your backend
- Configure AI API keys if you want AI features
- Deploy to production (Vercel, Railway, etc.)