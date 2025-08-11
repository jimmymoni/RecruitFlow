-- FIRM-BASED WORKSPACE SCHEMA FOR RECRUITFLOW
-- Discord-like team collaboration with firm accounts and sub-users

-- Drop existing tables if needed (be careful in production)
-- DROP TABLE IF EXISTS team_members CASCADE;
-- DROP TABLE IF EXISTS teams CASCADE;

-- Firms table (Main accounts)
CREATE TABLE IF NOT EXISTS firms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    domain VARCHAR(100), -- company domain like @acmerecruitment.com
    subscription_plan VARCHAR(50) DEFAULT 'basic', -- basic, pro, enterprise
    max_users INTEGER DEFAULT 15,
    logo_url TEXT,
    address TEXT,
    phone VARCHAR(20),
    website VARCHAR(200),
    timezone VARCHAR(50) DEFAULT 'UTC',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Firm users (Sub-accounts under each firm)
CREATE TABLE IF NOT EXISTS firm_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100), -- Custom display name for chat
    role VARCHAR(30) DEFAULT 'recruiter', -- admin, manager, recruiter, assistant
    department VARCHAR(100),
    job_title VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    bio TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    permissions JSONB DEFAULT '{}', -- specific permissions
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_online BOOLEAN DEFAULT false,
    user_status VARCHAR(20) DEFAULT 'offline', -- online, away, busy, offline
    status_message VARCHAR(200),
    created_by UUID REFERENCES firm_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(firm_id, email)
);

-- Workspace channels (Discord-like channels for each firm)
CREATE TABLE IF NOT EXISTS workspace_channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'text', -- text, voice, announcement, private
    category VARCHAR(50) DEFAULT 'general', -- general, candidates, jobs, clients, projects
    is_private BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0, -- for ordering channels
    permissions JSONB DEFAULT '{}', -- channel-specific permissions
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES firm_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channel members (who has access to private channels)
CREATE TABLE IF NOT EXISTS channel_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES workspace_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES firm_users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- admin, member
    can_read BOOLEAN DEFAULT true,
    can_write BOOLEAN DEFAULT true,
    can_manage BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_id, user_id)
);

-- Workspace messages (Discord-like messaging)
CREATE TABLE IF NOT EXISTS workspace_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES workspace_channels(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES firm_users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, file, image, system, task_update
    reply_to_id UUID REFERENCES workspace_messages(id) ON DELETE SET NULL,
    thread_id UUID REFERENCES workspace_messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    mentions JSONB DEFAULT '[]', -- array of user IDs mentioned
    attachments JSONB DEFAULT '[]', -- file attachments
    reactions JSONB DEFAULT '{}', -- emoji reactions with user counts
    metadata JSONB DEFAULT '{}', -- additional data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message reactions (individual user reactions)
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES workspace_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES firm_users(id) ON DELETE CASCADE,
    emoji VARCHAR(50) NOT NULL, -- :thumbsup:, :heart:, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Workspace tasks (integrated task management)
CREATE TABLE IF NOT EXISTS workspace_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES workspace_channels(id) ON DELETE SET NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo', -- todo, in_progress, review, done, cancelled
    priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high, urgent
    assigned_to UUID REFERENCES firm_users(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES firm_users(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    related_candidate_id UUID, -- link to candidates table
    related_job_id UUID, -- link to jobs table
    related_client_id UUID, -- link to clients table
    watchers UUID[], -- users watching this task
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task comments (discussion on tasks)
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES workspace_tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES firm_users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity feed (Discord-like activity tracking)
CREATE TABLE IF NOT EXISTS workspace_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES workspace_channels(id) ON DELETE SET NULL,
    user_id UUID REFERENCES firm_users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL, -- message, task_created, task_completed, user_joined, etc.
    title VARCHAR(200) NOT NULL,
    description TEXT,
    data JSONB DEFAULT '{}', -- activity-specific data
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User notifications
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES firm_users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- mention, task_assigned, dm, etc.
    title VARCHAR(200) NOT NULL,
    content TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    channel_id UUID REFERENCES workspace_channels(id) ON DELETE SET NULL,
    created_by UUID REFERENCES firm_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Firm invitations (invite system for new users)
CREATE TABLE IF NOT EXISTS firm_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invited_by UUID REFERENCES firm_users(id) ON DELETE SET NULL,
    role VARCHAR(30) DEFAULT 'recruiter',
    token VARCHAR(100) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(firm_id, email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_firm_users_firm_id ON firm_users(firm_id);
CREATE INDEX IF NOT EXISTS idx_firm_users_email ON firm_users(email);
CREATE INDEX IF NOT EXISTS idx_firm_users_is_online ON firm_users(is_online);
CREATE INDEX IF NOT EXISTS idx_workspace_channels_firm_id ON workspace_channels(firm_id);
CREATE INDEX IF NOT EXISTS idx_workspace_messages_channel_id ON workspace_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_workspace_messages_created_at ON workspace_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_firm_id ON workspace_tasks(firm_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_assigned_to ON workspace_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_status ON workspace_tasks(status);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_firm_id ON workspace_activities(firm_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_firms_updated_at BEFORE UPDATE ON firms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_firm_users_updated_at BEFORE UPDATE ON firm_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_channels_updated_at BEFORE UPDATE ON workspace_channels 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_tasks_updated_at BEFORE UPDATE ON workspace_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_invitations ENABLE ROW LEVEL SECURITY;

-- Sample RLS policies
CREATE POLICY "Users can view their firm data" ON firms FOR SELECT 
    USING (id IN (SELECT firm_id FROM firm_users WHERE id = auth.uid()));

CREATE POLICY "Users can view firm members" ON firm_users FOR SELECT 
    USING (firm_id IN (SELECT firm_id FROM firm_users WHERE id = auth.uid()));

CREATE POLICY "Users can view their firm channels" ON workspace_channels FOR SELECT 
    USING (firm_id IN (SELECT firm_id FROM firm_users WHERE id = auth.uid()));

CREATE POLICY "Users can view messages in their firm channels" ON workspace_messages FOR SELECT 
    USING (channel_id IN (
        SELECT wc.id FROM workspace_channels wc 
        JOIN firm_users fu ON wc.firm_id = fu.firm_id 
        WHERE fu.id = auth.uid()
    ));

-- Insert sample data
INSERT INTO firms (name, domain, max_users, subscription_plan) VALUES 
    ('Acme Recruitment', 'acmerecruitment.com', 15, 'pro'),
    ('TalentFirst Agency', 'talentfirst.com', 10, 'basic'),
    ('Elite Staffing Solutions', 'elitestaffing.com', 25, 'enterprise')
ON CONFLICT DO NOTHING;

-- Create default admin user for each firm
DO $$
DECLARE 
    firm_record RECORD;
    admin_user_id UUID;
BEGIN
    FOR firm_record IN SELECT * FROM firms LOOP
        -- Create admin user
        INSERT INTO firm_users (
            firm_id, email, password_hash, first_name, last_name, 
            role, display_name, status
        ) VALUES (
            firm_record.id, 
            'admin@' || firm_record.domain,
            '$2b$10$dummy_hash_replace_with_real_hash',
            'Admin',
            'User',
            'admin',
            'Admin',
            'active'
        ) RETURNING id INTO admin_user_id;
        
        -- Create default channels for this firm
        INSERT INTO workspace_channels (firm_id, name, description, category, created_by) VALUES
            (firm_record.id, 'general', 'General discussion for the team', 'general', admin_user_id),
            (firm_record.id, 'candidates', 'Discuss candidates and applications', 'candidates', admin_user_id),
            (firm_record.id, 'jobs', 'Job postings and requirements', 'jobs', admin_user_id),
            (firm_record.id, 'clients', 'Client relationships and updates', 'clients', admin_user_id),
            (firm_record.id, 'announcements', 'Important company announcements', 'general', admin_user_id);
    END LOOP;
END $$;

-- Sample users for testing
INSERT INTO firm_users (
    firm_id, email, password_hash, first_name, last_name, 
    display_name, role, department, job_title
) 
SELECT 
    f.id,
    'sarah.johnson@' || f.domain,
    '$2b$10$dummy_hash_replace_with_real_hash',
    'Sarah',
    'Johnson',
    'Sarah J.',
    'recruiter',
    'Talent Acquisition',
    'Senior Recruiter'
FROM firms f
WHERE f.name = 'Acme Recruitment'
ON CONFLICT DO NOTHING;