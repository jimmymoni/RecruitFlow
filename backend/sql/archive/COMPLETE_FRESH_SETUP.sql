-- ===========================================
-- RECRUITFLOW COMPLETE FRESH SETUP
-- ===========================================
-- This is ONE script that does EVERYTHING from scratch
-- Delete all other scripts and use only this one

-- ===========================================
-- 1. CLEAN SLATE - DROP EVERYTHING
-- ===========================================

-- Drop all tables in correct order (foreign keys first)
DROP TABLE IF EXISTS message_reactions CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;  
DROP TABLE IF EXISTS thread_participants CASCADE;
DROP TABLE IF EXISTS user_presence CASCADE;
DROP TABLE IF EXISTS chat_threads CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS firm_users CASCADE;
DROP TABLE IF EXISTS firms CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Drop any functions that might exist
DROP FUNCTION IF EXISTS auto_join_user_to_all_threads(UUID);
DROP FUNCTION IF EXISTS update_thread_activity();
DROP FUNCTION IF EXISTS update_user_presence();

-- ===========================================
-- 2. CREATE CORE TABLES
-- ===========================================

-- Users table (main authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'recruiter',
    is_active BOOLEAN DEFAULT true,
    phone VARCHAR(50),
    avatar TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Threads/Channels
CREATE TABLE chat_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'group',
    description TEXT,
    is_pinned BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thread Participants (who's in which channel)
CREATE TABLE thread_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(thread_id, user_id)
);

-- Chat Messages  
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id UUID,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    command_result JSONB,
    rich_preview JSONB,
    file_url TEXT,
    reply_to_id UUID REFERENCES chat_messages(id),
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Reactions
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- User Presence (online/offline status)
CREATE TABLE user_presence (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'offline',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_thread_id UUID REFERENCES chat_threads(id),
    is_typing BOOLEAN DEFAULT false,
    typing_thread_id UUID REFERENCES chat_threads(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_chat_messages_thread_id ON chat_messages(thread_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_thread_participants_user_id ON thread_participants(user_id);
CREATE INDEX idx_thread_participants_thread_id ON thread_participants(thread_id);
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_user_presence_status ON user_presence(status);

-- ===========================================
-- 4. ENABLE SECURITY (RLS)
-- ===========================================

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Create simple policies (allow everything for testing)
CREATE POLICY "users_all" ON users FOR ALL USING (true);
CREATE POLICY "chat_threads_all" ON chat_threads FOR ALL USING (true);
CREATE POLICY "thread_participants_all" ON thread_participants FOR ALL USING (true);
CREATE POLICY "chat_messages_all" ON chat_messages FOR ALL USING (true);
CREATE POLICY "message_reactions_all" ON message_reactions FOR ALL USING (true);
CREATE POLICY "user_presence_all" ON user_presence FOR ALL USING (true);

-- ===========================================
-- 5. CREATE USERS WITH CORRECT PASSWORDS
-- ===========================================

-- Create test users (password for all: "123456")
INSERT INTO users (email, password, first_name, last_name, role, is_active) VALUES 
    ('test@test.com', '$2a$10$bjXQHQhZvQjczefLpmnZzOXBnjPWmjJG.zGL9aLGz5hA5J3EJ5oEi', 'Test', 'User', 'admin', true),
    ('admin@recruitflow.com', '$2a$10$bjXQHQhZvQjczefLpmnZzOXBnjPWmjJG.zGL9aLGz5hA5J3EJ5oEi', 'Admin', 'User', 'admin', true),
    ('sarah@recruitflow.com', '$2a$10$bjXQHQhZvQjczefLpmnZzOXBnjPWmjJG.zGL9aLGz5hA5J3EJ5oEi', 'Sarah', 'Johnson', 'manager', true),
    ('mike@recruitflow.com', '$2a$10$bjXQHQhZvQjczefLpmnZzOXBnjPWmjJG.zGL9aLGz5hA5J3EJ5oEi', 'Mike', 'Davis', 'recruiter', true);

-- ===========================================
-- 6. CREATE CHAT CHANNELS
-- ===========================================

-- Create default chat channels
INSERT INTO chat_threads (name, type, description) VALUES 
    ('General', 'main', 'General team discussion'),
    ('Candidates', 'group', 'Discuss candidates and recruitment'),
    ('Jobs', 'group', 'Job postings and requirements'),
    ('Clients', 'group', 'Client relationships and updates');

-- ===========================================
-- 7. ADD ALL USERS TO ALL CHANNELS
-- ===========================================

-- Get user and thread IDs and add everyone to everything
INSERT INTO thread_participants (thread_id, user_id, joined_at, last_read_at)
SELECT 
    ct.id as thread_id,
    u.id as user_id,
    NOW() - INTERVAL '1 day' as joined_at,
    NOW() - INTERVAL '1 hour' as last_read_at
FROM chat_threads ct
CROSS JOIN users u;

-- ===========================================
-- 8. ADD SAMPLE MESSAGES TO MAKE CHAT ALIVE
-- ===========================================

-- Insert sample messages for each channel
INSERT INTO chat_messages (thread_id, sender_id, sender_name, sender_role, content, message_type, created_at)
SELECT 
    -- General channel messages
    (SELECT id FROM chat_threads WHERE name = 'General'),
    (SELECT id FROM users WHERE email = 'sarah@recruitflow.com'),
    'Sarah Johnson',
    'manager',
    'Good morning team! Ready for another productive day? ☀️',
    'text',
    NOW() - INTERVAL '4 hours'
UNION ALL SELECT
    (SELECT id FROM chat_threads WHERE name = 'General'),
    (SELECT id FROM users WHERE email = 'mike@recruitflow.com'),
    'Mike Davis',
    'recruiter',
    'Morning Sarah! Just finished reviewing applications. Looking good! 💪',
    'text',
    NOW() - INTERVAL '3 hours 30 minutes'
UNION ALL SELECT
    (SELECT id FROM chat_threads WHERE name = 'General'),
    (SELECT id FROM users WHERE email = 'admin@recruitflow.com'),
    'Admin User',
    'admin',
    'Great work everyone! The recruitment pipeline is really picking up momentum.',
    'text',
    NOW() - INTERVAL '2 hours'
UNION ALL SELECT
    -- Candidates channel messages
    (SELECT id FROM chat_threads WHERE name = 'Candidates'),
    (SELECT id FROM users WHERE email = 'mike@recruitflow.com'),
    'Mike Davis',
    'recruiter',
    '📋 New candidate: Senior React Developer with 6+ years experience',
    'text',
    NOW() - INTERVAL '3 hours'
UNION ALL SELECT
    (SELECT id FROM chat_threads WHERE name = 'Candidates'),
    (SELECT id FROM users WHERE email = 'sarah@recruitflow.com'),
    'Sarah Johnson',
    'manager',
    'I''ll review their portfolio and set up a screening call 📞',
    'text',
    NOW() - INTERVAL '2 hours 15 minutes'
UNION ALL SELECT
    -- Jobs channel messages
    (SELECT id FROM chat_threads WHERE name = 'Jobs'),
    (SELECT id FROM users WHERE email = 'admin@recruitflow.com'),
    'Admin User',
    'admin',
    '💼 New job: Full Stack Developer at TechCorp - $85k-$105k',
    'text',
    NOW() - INTERVAL '4 hours'
UNION ALL SELECT
    (SELECT id FROM chat_threads WHERE name = 'Jobs'),
    (SELECT id FROM users WHERE email = 'sarah@recruitflow.com'),
    'Sarah Johnson',
    'manager',
    'Great opportunity! I have several candidates who would be perfect',
    'text',
    NOW() - INTERVAL '3 hours 20 minutes'
UNION ALL SELECT
    -- Clients channel messages
    (SELECT id FROM chat_threads WHERE name = 'Clients'),
    (SELECT id FROM users WHERE email = 'sarah@recruitflow.com'),
    'Sarah Johnson',
    'manager',
    '🏢 TechCorp meeting went well! They want to expand dev team by 5 people',
    'text',
    NOW() - INTERVAL '2 hours'
UNION ALL SELECT
    (SELECT id FROM chat_threads WHERE name = 'Clients'),
    (SELECT id FROM users WHERE email = 'mike@recruitflow.com'),
    'Mike Davis',
    'recruiter',
    'I can start with senior positions immediately. Have great candidates!',
    'text',
    NOW() - INTERVAL '1 hour 15 minutes';

-- ===========================================
-- 9. SET USER PRESENCE (WHO'S ONLINE)
-- ===========================================

-- Set realistic user presence
INSERT INTO user_presence (user_id, status, last_seen, updated_at)
SELECT 
    id,
    CASE 
        WHEN email = 'test@test.com' THEN 'online'
        WHEN email = 'sarah@recruitflow.com' THEN 'online'
        WHEN email = 'mike@recruitflow.com' THEN 'away'
        ELSE 'offline'
    END,
    CASE 
        WHEN email = 'test@test.com' THEN NOW()
        WHEN email = 'sarah@recruitflow.com' THEN NOW() - INTERVAL '5 minutes'
        WHEN email = 'mike@recruitflow.com' THEN NOW() - INTERVAL '15 minutes'
        ELSE NOW() - INTERVAL '2 hours'
    END,
    NOW()
FROM users;

-- ===========================================
-- 10. VERIFICATION & SUCCESS MESSAGE
-- ===========================================

-- Show what was created
SELECT 'SETUP COMPLETE! 🎉' as status;
SELECT 'Users created:' as info, COUNT(*) as count FROM users;
SELECT 'Channels created:' as info, COUNT(*) as count FROM chat_threads;
SELECT 'Messages created:' as info, COUNT(*) as count FROM chat_messages;
SELECT 'User-channel memberships:' as info, COUNT(*) as count FROM thread_participants;

-- Show users and their status
SELECT 
    u.first_name || ' ' || u.last_name as name,
    u.email,
    u.role,
    COALESCE(up.status, 'offline') as status
FROM users u
LEFT JOIN user_presence up ON u.id = up.user_id
ORDER BY u.first_name;

-- ===========================================
-- SUCCESS! EVERYTHING IS READY! 🚀
-- ===========================================
-- 
-- ✅ Database completely reset and rebuilt
-- ✅ 4 users created with correct passwords
-- ✅ 4 chat channels created
-- ✅ All users added to all channels  
-- ✅ Sample messages in every channel
-- ✅ Realistic user presence (online/away/offline)
-- ✅ Security policies enabled
-- ✅ Indexes created for performance
-- 
-- 🔐 LOGIN CREDENTIALS (all passwords: "123456"):
-- 📧 test@test.com (pre-filled in login form)
-- 📧 admin@recruitflow.com
-- 📧 sarah@recruitflow.com  
-- 📧 mike@recruitflow.com
-- 
-- 🎯 WHAT TO DO NEXT:
-- 1. Go to http://localhost:5173
-- 2. Login with test@test.com / 123456
-- 3. Click "Teams" tab
-- 4. See live chat with conversations! 
-- 
-- ===========================================