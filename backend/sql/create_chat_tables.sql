-- Teams Chat Tables for RecruitFlow

-- Chat threads (channels/conversations)
CREATE TABLE IF NOT EXISTS chat_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('general', 'ai_workflow', 'urgent', 'private', 'announcement')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    ai_enabled BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT false
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'ai_insight', 'workflow', 'system', 'file', 'image')),
    ai_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT false,
    reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    reactions JSONB DEFAULT '[]'::jsonb
);

-- Thread members (who has access to each thread)
CREATE TABLE IF NOT EXISTS thread_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    is_muted BOOLEAN DEFAULT false,
    UNIQUE(thread_id, user_id)
);

-- User presence for real-time status
CREATE TABLE IF NOT EXISTS user_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    current_activity TEXT,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_thread_members_thread_id ON thread_members(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_members_user_id ON thread_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_created_by ON chat_threads(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_threads_last_activity ON chat_threads(last_activity);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_threads
CREATE POLICY "Users can view threads they are members of" ON chat_threads FOR SELECT USING (
    id IN (SELECT thread_id FROM thread_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create threads" ON chat_threads FOR INSERT WITH CHECK (
    created_by = auth.uid()
);

CREATE POLICY "Thread creators can update their threads" ON chat_threads FOR UPDATE USING (
    created_by = auth.uid()
);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in threads they are members of" ON chat_messages FOR SELECT USING (
    thread_id IN (SELECT thread_id FROM thread_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert messages in threads they are members of" ON chat_messages FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    thread_id IN (SELECT thread_id FROM thread_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own messages" ON chat_messages FOR UPDATE USING (
    sender_id = auth.uid()
);

-- RLS Policies for thread_members
CREATE POLICY "Users can view thread members for their threads" ON thread_members FOR SELECT USING (
    thread_id IN (SELECT thread_id FROM thread_members WHERE user_id = auth.uid())
);

CREATE POLICY "Thread admins can manage members" ON thread_members FOR ALL USING (
    thread_id IN (
        SELECT thread_id FROM thread_members 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- RLS Policies for user_presence
CREATE POLICY "Users can view all user presence" ON user_presence FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own presence" ON user_presence FOR ALL USING (
    user_id = auth.uid()
);

-- Insert some default data for testing
INSERT INTO chat_threads (id, name, description, type, priority, ai_enabled, created_by) VALUES 
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'AI-Hiring-Pipeline',
    'AI-powered candidate screening and workflow automation',
    'ai_workflow',
    'high',
    true,
    (SELECT id FROM users WHERE email = 'test@test.com' LIMIT 1)
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'urgent-positions',
    'High-priority job openings requiring immediate attention',
    'urgent',
    'urgent',
    false,
    (SELECT id FROM users WHERE email = 'test@test.com' LIMIT 1)
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'team-pulse',
    'Daily team updates and collaboration',
    'general',
    'medium',
    true,
    (SELECT id FROM users WHERE email = 'test@test.com' LIMIT 1)
) ON CONFLICT (id) DO NOTHING;

-- Add thread members
INSERT INTO thread_members (thread_id, user_id, role) VALUES 
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    (SELECT id FROM users WHERE email = 'test@test.com' LIMIT 1),
    'admin'
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    (SELECT id FROM users WHERE email = 'test@test.com' LIMIT 1),
    'admin'
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    (SELECT id FROM users WHERE email = 'test@test.com' LIMIT 1),
    'admin'
) ON CONFLICT (thread_id, user_id) DO NOTHING;

-- Add some initial messages
INSERT INTO chat_messages (thread_id, sender_id, content, message_type, ai_data) VALUES 
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    (SELECT id FROM users WHERE email = 'test@test.com' LIMIT 1),
    '🤖 AI detected 5 high-quality candidates for Senior Developer role. Auto-screening completed with 94% confidence.',
    'ai_insight',
    '{"confidence": 0.94, "candidates_found": 5, "role": "Senior Developer", "insight_type": "screening_complete"}'
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    (SELECT id FROM users WHERE email = 'test@test.com' LIMIT 1),
    'Great! Can we review the top 3 candidates together?',
    'text',
    null
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    (SELECT id FROM users WHERE email = 'test@test.com' LIMIT 1),
    '🚨 CEO position at TechCorp needs 3 candidates by Friday. Current pipeline: 0 candidates.',
    'text',
    null
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    (SELECT id FROM users WHERE email = 'test@test.com' LIMIT 1),
    '📊 Daily Pulse: 23 new applications, 5 interviews scheduled, 2 offers sent. Team velocity: +15% vs yesterday.',
    'ai_insight',
    '{"applications": 23, "interviews": 5, "offers": 2, "velocity_change": 0.15}'
) ON CONFLICT DO NOTHING;

-- Initialize user presence
INSERT INTO user_presence (user_id, status, current_activity) VALUES 
(
    (SELECT id FROM users WHERE email = 'test@test.com' LIMIT 1),
    'online',
    'Reviewing candidates'
) ON CONFLICT (user_id) DO UPDATE SET 
    status = EXCLUDED.status,
    current_activity = EXCLUDED.current_activity,
    updated_at = NOW();

-- Update timestamps
UPDATE chat_threads SET last_activity = NOW() WHERE name IN ('AI-Hiring-Pipeline', 'urgent-positions', 'team-pulse');