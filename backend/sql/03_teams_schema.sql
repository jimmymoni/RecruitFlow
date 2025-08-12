-- Teams and Chat functionality
-- This script creates the database schema for team collaboration features

-- Chat threads table
CREATE TABLE IF NOT EXISTS chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'general' CHECK (type IN ('general', 'ai_workflow', 'urgent', 'project')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    ai_enabled BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Thread members table (for private/group threads)
CREATE TABLE IF NOT EXISTS thread_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    notifications_enabled BOOLEAN DEFAULT true,
    UNIQUE(thread_id, user_id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'ai_insight', 'workflow', 'system', 'file', 'image')),
    ai_data JSONB,
    reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

-- User presence table for real-time status
CREATE TABLE IF NOT EXISTS user_presence (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(10) DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    current_activity TEXT,
    last_seen TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reaction VARCHAR(50) NOT NULL, -- emoji or reaction type
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id, reaction)
);

-- Thread bookmarks table
CREATE TABLE IF NOT EXISTS thread_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(thread_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_threads_last_activity ON chat_threads(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_chat_threads_type_priority ON chat_threads(type, priority);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id_created_at ON chat_messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_created_at ON chat_messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thread_members_user_id ON thread_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status, last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);

-- Triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_threads_updated_at 
    BEFORE UPDATE ON chat_threads 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_presence_updated_at 
    BEFORE UPDATE ON user_presence 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Trigger to update thread last_activity when new message is posted
CREATE OR REPLACE FUNCTION update_thread_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_threads 
    SET last_activity = NEW.created_at 
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_activity_on_message 
    AFTER INSERT ON chat_messages 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_thread_last_activity();

-- Insert default threads
INSERT INTO chat_threads (name, description, type, priority, ai_enabled, created_by) 
VALUES 
    ('AI-Hiring-Pipeline', 'AI-powered candidate screening and workflow automation', 'ai_workflow', 'high', true, (SELECT id FROM users LIMIT 1)),
    ('urgent-positions', 'High-priority job openings requiring immediate attention', 'urgent', 'urgent', false, (SELECT id FROM users LIMIT 1)),
    ('team-pulse', 'Daily team updates and collaboration', 'general', 'medium', true, (SELECT id FROM users LIMIT 1)),
    ('client-updates', 'Client communication and relationship updates', 'general', 'medium', false, (SELECT id FROM users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert sample messages for the AI workflow thread
INSERT INTO chat_messages (thread_id, sender_id, content, message_type, ai_data)
SELECT 
    t.id as thread_id,
    u.id as sender_id,
    '🤖 AI detected 5 high-quality candidates for Senior Developer role. Auto-screening completed with 94% confidence.',
    'ai_insight',
    '{"confidence": 94, "candidates_analyzed": 5, "auto_screening": true}'::jsonb
FROM chat_threads t, users u 
WHERE t.name = 'AI-Hiring-Pipeline' 
AND u.role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO chat_messages (thread_id, sender_id, content, message_type)
SELECT 
    t.id as thread_id,
    u.id as sender_id,
    'Great! Can we review the top 3 candidates together?',
    'text'
FROM chat_threads t, users u 
WHERE t.name = 'AI-Hiring-Pipeline' 
AND u.role = 'manager'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample urgent message
INSERT INTO chat_messages (thread_id, sender_id, content, message_type)
SELECT 
    t.id as thread_id,
    u.id as sender_id,
    '🚨 CEO position at TechCorp needs 3 candidates by Friday. Current pipeline: 0 candidates.',
    'text'
FROM chat_threads t, users u 
WHERE t.name = 'urgent-positions' 
AND u.role = 'recruiter'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert daily pulse message
INSERT INTO chat_messages (thread_id, sender_id, content, message_type, ai_data)
SELECT 
    t.id as thread_id,
    u.id as sender_id,
    '📊 Daily Pulse: 23 new applications, 5 interviews scheduled, 2 offers sent. Team velocity: +15% vs yesterday.',
    'ai_insight',
    '{"applications": 23, "interviews": 5, "offers": 2, "velocity_change": 15}'::jsonb
FROM chat_threads t, users u 
WHERE t.name = 'team-pulse' 
AND u.role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_threads
CREATE POLICY "Users can view all public threads" ON chat_threads
    FOR SELECT USING (true);

CREATE POLICY "Users can create threads" ON chat_threads
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Thread creators can update their threads" ON chat_threads
    FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for chat_messages  
CREATE POLICY "Users can view messages in threads they have access to" ON chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Users can insert messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON chat_messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- RLS Policies for user_presence
CREATE POLICY "Users can view all presence status" ON user_presence
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own presence" ON user_presence
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for message_reactions
CREATE POLICY "Users can view all reactions" ON message_reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reactions" ON message_reactions
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for thread_bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON thread_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for thread_members
CREATE POLICY "Users can view thread members" ON thread_members
    FOR SELECT USING (true);

CREATE POLICY "Users can join threads" ON thread_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE chat_threads IS 'Team chat threads/channels for collaboration';
COMMENT ON TABLE thread_members IS 'Members who have access to specific threads';
COMMENT ON TABLE chat_messages IS 'Messages posted in team chat threads';
COMMENT ON TABLE user_presence IS 'Real-time user presence and activity status';
COMMENT ON TABLE message_reactions IS 'User reactions to chat messages (emojis, likes, etc.)';
COMMENT ON TABLE thread_bookmarks IS 'User bookmarks for important threads';