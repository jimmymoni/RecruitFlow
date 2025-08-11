-- Teams Chat Database Schema
-- Real-time messaging system for RecruitFlow

-- Chat Threads/Channels
CREATE TABLE IF NOT EXISTS chat_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'group', -- 'main', 'group', 'direct'
  description TEXT,
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thread Participants (many-to-many relationship)
CREATE TABLE IF NOT EXISTS thread_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  sender_name VARCHAR(255) NOT NULL,
  sender_role VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'command', 'system', 'file'
  command_result JSONB, -- For slash command results
  rich_preview JSONB, -- For rich message previews
  file_url TEXT, -- For file attachments
  reply_to_id UUID REFERENCES chat_messages(id),
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- User Presence/Status
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'offline', -- 'online', 'away', 'busy', 'offline'
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_thread_id UUID REFERENCES chat_threads(id),
  is_typing BOOLEAN DEFAULT false,
  typing_thread_id UUID REFERENCES chat_threads(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user_id ON thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_participants_thread_id ON thread_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);

-- Row Level Security (RLS) Policies
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Chat threads: Users can see threads they participate in
CREATE POLICY "Users can view threads they participate in" ON chat_threads
  FOR SELECT USING (
    id IN (
      SELECT thread_id FROM thread_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create threads" ON chat_threads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Thread participants: Users can see participants of threads they're in
CREATE POLICY "Users can view participants of their threads" ON thread_participants
  FOR SELECT USING (
    thread_id IN (
      SELECT thread_id FROM thread_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join threads" ON thread_participants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Chat messages: Users can see messages in threads they participate in
CREATE POLICY "Users can view messages in their threads" ON chat_messages
  FOR SELECT USING (
    thread_id IN (
      SELECT thread_id FROM thread_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their threads" ON chat_messages
  FOR INSERT WITH CHECK (
    thread_id IN (
      SELECT thread_id FROM thread_participants 
      WHERE user_id = auth.uid()
    ) AND sender_id = auth.uid()
  );

-- Message reactions: Users can see reactions on messages they can see
CREATE POLICY "Users can view reactions on accessible messages" ON message_reactions
  FOR SELECT USING (
    message_id IN (
      SELECT m.id FROM chat_messages m
      JOIN thread_participants tp ON m.thread_id = tp.thread_id
      WHERE tp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can react to accessible messages" ON message_reactions
  FOR INSERT WITH CHECK (
    message_id IN (
      SELECT m.id FROM chat_messages m
      JOIN thread_participants tp ON m.thread_id = tp.thread_id
      WHERE tp.user_id = auth.uid()
    ) AND user_id = auth.uid()
  );

-- User presence: Users can see presence of users in their threads
CREATE POLICY "Users can view presence" ON user_presence
  FOR SELECT USING (true); -- Allow viewing all user presence

CREATE POLICY "Users can update their own presence" ON user_presence
  FOR ALL USING (user_id = auth.uid());

-- Insert default chat threads
INSERT INTO chat_threads (name, type, description) VALUES 
  ('General', 'main', 'General team discussion'),
  ('Candidates', 'group', 'Discuss candidates and recruitment'),
  ('Jobs', 'group', 'Job postings and requirements'),
  ('Clients', 'group', 'Client relationships and updates')
ON CONFLICT (name) DO NOTHING;

-- Functions for real-time features

-- Function to update thread activity
CREATE OR REPLACE FUNCTION update_thread_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_threads 
  SET updated_at = NOW() 
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update thread activity when message is sent
CREATE TRIGGER update_thread_activity_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_activity();

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_presence (user_id, status, last_seen) 
  VALUES (NEW.sender_id, 'online', NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    status = 'online',
    last_seen = NOW(),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user presence when message is sent
CREATE TRIGGER update_user_presence_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_user_presence();