-- ===========================================
-- SIMPLE CHAT SETUP - NO CONFLICTS
-- ===========================================
-- This creates the basic chat structure without sample users
-- Run this in your Supabase SQL Editor

-- 1. CREATE BASIC CHAT TABLES
-- ===========================================

-- Chat Threads/Channels
CREATE TABLE IF NOT EXISTS chat_threads (
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
CREATE TABLE IF NOT EXISTS thread_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
  user_id UUID,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
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
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- User Presence
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'offline',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_thread_id UUID REFERENCES chat_threads(id),
  is_typing BOOLEAN DEFAULT false,
  typing_thread_id UUID REFERENCES chat_threads(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user_id ON thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_participants_thread_id ON thread_participants(thread_id);

-- 3. ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- 4. CREATE SIMPLE RLS POLICIES (Allow all for testing)
-- ===========================================

-- Allow authenticated users to do everything for now (we'll tighten this later)
DROP POLICY IF EXISTS "chat_threads_all" ON chat_threads;
CREATE POLICY "chat_threads_all" ON chat_threads FOR ALL USING (true);

DROP POLICY IF EXISTS "thread_participants_all" ON thread_participants;
CREATE POLICY "thread_participants_all" ON thread_participants FOR ALL USING (true);

DROP POLICY IF EXISTS "chat_messages_all" ON chat_messages;
CREATE POLICY "chat_messages_all" ON chat_messages FOR ALL USING (true);

DROP POLICY IF EXISTS "message_reactions_all" ON message_reactions;
CREATE POLICY "message_reactions_all" ON message_reactions FOR ALL USING (true);

DROP POLICY IF EXISTS "user_presence_all" ON user_presence;
CREATE POLICY "user_presence_all" ON user_presence FOR ALL USING (true);

-- 5. INSERT DEFAULT THREADS
-- ===========================================

-- First delete any existing threads to avoid conflicts
DELETE FROM chat_threads WHERE name IN ('General', 'Candidates', 'Jobs', 'Clients');

-- Insert fresh default threads
INSERT INTO chat_threads (name, type, description) VALUES 
  ('General', 'main', 'General team discussion'),
  ('Candidates', 'group', 'Discuss candidates and recruitment'),
  ('Jobs', 'group', 'Job postings and requirements'),
  ('Clients', 'group', 'Client relationships and updates');

-- 6. CREATE AUTO-JOIN FUNCTION
-- ===========================================

CREATE OR REPLACE FUNCTION auto_join_user_to_all_threads(user_uuid UUID)
RETURNS void AS $$
BEGIN
    -- Add user to all existing threads
    INSERT INTO thread_participants (thread_id, user_id)
    SELECT id, user_uuid
    FROM chat_threads
    ON CONFLICT (thread_id, user_id) DO NOTHING;
    
    -- Set user presence
    INSERT INTO user_presence (user_id, status, last_seen, updated_at)
    VALUES (user_uuid, 'online', NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        status = 'online',
        last_seen = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- SETUP COMPLETE!
-- ===========================================
-- 
-- ✅ Basic chat tables created
-- ✅ Default threads created (General, Candidates, Jobs, Clients)
-- ✅ Permissive RLS policies for testing
-- ✅ Auto-join function ready
-- 
-- Next: Go to your RecruitFlow app and click Teams!
-- The backend will automatically join you to threads.
--
-- ===========================================

SELECT 'Basic chat setup complete!' as status;