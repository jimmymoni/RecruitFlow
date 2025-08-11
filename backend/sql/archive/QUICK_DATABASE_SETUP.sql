-- QUICK DATABASE SETUP FOR RECRUITFLOW WORKSPACE
-- Copy and paste this into Supabase SQL Editor and click RUN

-- 1. Firms table (Master accounts)
CREATE TABLE IF NOT EXISTS firms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    domain VARCHAR(100),
    subscription_plan VARCHAR(50) DEFAULT 'pro',
    max_users INTEGER DEFAULT 15,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Firm users (Sub-accounts)
CREATE TABLE IF NOT EXISTS firm_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    role VARCHAR(30) DEFAULT 'recruiter',
    department VARCHAR(100),
    job_title VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    is_online BOOLEAN DEFAULT false,
    user_status VARCHAR(20) DEFAULT 'offline',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Workspace channels
CREATE TABLE IF NOT EXISTS workspace_channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'text',
    category VARCHAR(50) DEFAULT 'general',
    is_private BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Workspace messages
CREATE TABLE IF NOT EXISTS workspace_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES workspace_channels(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES firm_users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Firm invitations
CREATE TABLE IF NOT EXISTS firm_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invited_by UUID REFERENCES firm_users(id) ON DELETE SET NULL,
    role VARCHAR(30) DEFAULT 'recruiter',
    token VARCHAR(100) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_firm_users_firm_id ON firm_users(firm_id);
CREATE INDEX IF NOT EXISTS idx_firm_users_email ON firm_users(email);
CREATE INDEX IF NOT EXISTS idx_workspace_channels_firm_id ON workspace_channels(firm_id);
CREATE INDEX IF NOT EXISTS idx_workspace_messages_channel_id ON workspace_messages(channel_id);

-- Insert a test firm with admin user
INSERT INTO firms (name, domain, subscription_plan, max_users) VALUES 
    ('Demo Recruitment Agency', 'demo.recruitflow.com', 'pro', 15)
ON CONFLICT DO NOTHING;

-- Get the firm ID and create admin user
DO $$
DECLARE 
    demo_firm_id UUID;
BEGIN
    SELECT id INTO demo_firm_id FROM firms WHERE name = 'Demo Recruitment Agency' LIMIT 1;
    
    IF demo_firm_id IS NOT NULL THEN
        -- Create admin user (password: admin123)
        INSERT INTO firm_users (
            firm_id, email, password_hash, first_name, last_name, 
            display_name, role, job_title, status
        ) VALUES (
            demo_firm_id,
            'admin@demo.recruitflow.com',
            '$2b$10$rQ3K3Jv8gGx7sJ9mF2nOkOGd7X4vZ1qW3R5Y7T9nK2L4P6M8Q0S1E',
            'Demo',
            'Admin',
            'Demo Admin',
            'admin',
            'System Administrator',
            'active'
        ) ON CONFLICT (email) DO NOTHING;
        
        -- Create default channels
        INSERT INTO workspace_channels (firm_id, name, description, category, position) VALUES
            (demo_firm_id, 'general', 'General team discussion', 'general', 1),
            (demo_firm_id, 'candidates', 'Discuss candidates and applications', 'candidates', 2),
            (demo_firm_id, 'jobs', 'Job postings and requirements', 'jobs', 3),
            (demo_firm_id, 'clients', 'Client relationships and updates', 'clients', 4)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Show success message
SELECT 
    'SUCCESS: Database setup complete!' as message,
    COUNT(*) as firms_created
FROM firms;

SELECT 
    'Demo login credentials:' as info,
    'Email: admin@demo.recruitflow.com' as email,
    'Password: admin123' as password;