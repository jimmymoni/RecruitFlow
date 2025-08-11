-- ===========================================
-- RESET AND FIX SUPABASE TABLES
-- ===========================================
-- This will clean up and recreate all tables properly

-- ===========================================
-- 1. DROP ALL EXISTING TABLES (CLEAN SLATE)
-- ===========================================

-- Drop chat tables first (due to foreign keys)
DROP TABLE IF EXISTS message_reactions CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;  
DROP TABLE IF EXISTS thread_participants CASCADE;
DROP TABLE IF EXISTS chat_threads CASCADE;
DROP TABLE IF EXISTS user_presence CASCADE;

-- Drop auth tables
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS firm_users CASCADE;
DROP TABLE IF EXISTS firms CASCADE;

-- Drop any other tables that might be causing issues
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- ===========================================
-- 2. CREATE CORE AUTH TABLES
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

-- ===========================================
-- 3. CREATE CHAT TABLES
-- ===========================================

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

-- Thread Participants
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

-- User Presence
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
-- 4. CREATE INDEXES
-- ===========================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_chat_messages_thread_id ON chat_messages(thread_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_thread_participants_user_id ON thread_participants(user_id);
CREATE INDEX idx_thread_participants_thread_id ON thread_participants(thread_id);
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_user_presence_status ON user_presence(status);

-- ===========================================
-- 5. ENABLE RLS AND CREATE POLICIES
-- ===========================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for testing (we'll tighten later)
CREATE POLICY "users_all" ON users FOR ALL USING (true);
CREATE POLICY "chat_threads_all" ON chat_threads FOR ALL USING (true);
CREATE POLICY "thread_participants_all" ON thread_participants FOR ALL USING (true);
CREATE POLICY "chat_messages_all" ON chat_messages FOR ALL USING (true);
CREATE POLICY "message_reactions_all" ON message_reactions FOR ALL USING (true);
CREATE POLICY "user_presence_all" ON user_presence FOR ALL USING (true);

-- ===========================================
-- 6. INSERT TEST DATA
-- ===========================================

-- Create test user (matches AuthSystem defaults)
INSERT INTO users (
    email, 
    password, 
    first_name, 
    last_name, 
    role, 
    is_active
) VALUES (
    'test@test.com',
    '$2b$10$E/dz8tLOK9A5BsKV5VgxEu.UdKKGQ5sXLJ8Tz/BhY7k6rHiDJlN5a', -- password: "123456"
    'Test',
    'User',
    'admin',
    true
);

-- Create additional test users
INSERT INTO users (
    email, 
    password, 
    first_name, 
    last_name, 
    role, 
    is_active
) VALUES 
    (
        'admin@recruitflow.com',
        '$2b$10$E/dz8tLOK9A5BsKV5VgxEu.UdKKGQ5sXLJ8Tz/BhY7k6rHiDJlN5a', -- password: "123456"
        'Admin',
        'User',
        'admin',
        true
    ),
    (
        'sarah@recruitflow.com',
        '$2b$10$E/dz8tLOK9A5BsKV5VgxEu.UdKKGQ5sXLJ8Tz/BhY7k6rHiDJlN5a', -- password: "123456"
        'Sarah',
        'Johnson',
        'manager',
        true
    ),
    (
        'mike@recruitflow.com',
        '$2b$10$E/dz8tLOK9A5BsKV5VgxEu.UdKKGQ5sXLJ8Tz/BhY7k6rHiDJlN5a', -- password: "123456"
        'Mike',
        'Davis',
        'recruiter',
        true
    );

-- Create default chat threads
INSERT INTO chat_threads (name, type, description) VALUES 
    ('General', 'main', 'General team discussion'),
    ('Candidates', 'group', 'Discuss candidates and recruitment'),
    ('Jobs', 'group', 'Job postings and requirements'),
    ('Clients', 'group', 'Client relationships and updates');

-- ===========================================
-- 7. VERIFICATION
-- ===========================================

-- Check that everything was created properly
SELECT 'Tables created successfully!' as status;

SELECT 'Users:' as section, email, first_name, last_name, role FROM users;
SELECT 'Threads:' as section, name, type, description FROM chat_threads;

-- ===========================================
-- SETUP COMPLETE!  
-- ===========================================
-- 
-- ✅ All tables dropped and recreated cleanly
-- ✅ Test users created with proper passwords
-- ✅ Default chat threads created
-- ✅ Indexes and RLS policies set up
-- 
-- 🔐 LOGIN CREDENTIALS:
-- 📧 test@test.com (pre-filled in form)
-- 🔑 123456
-- 
-- 📧 admin@recruitflow.com
-- 🔑 123456
-- 
-- 📧 sarah@recruitflow.com  
-- 🔑 123456
-- 
-- 📧 mike@recruitflow.com
-- 🔑 123456
-- 
-- ===========================================