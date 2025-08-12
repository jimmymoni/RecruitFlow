const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const createChatTables = async () => {
  console.log('🔄 Creating chat tables...')

  // Create chat_threads table
  const { error: threadsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS chat_threads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) DEFAULT 'general',
        priority VARCHAR(20) DEFAULT 'medium',
        ai_enabled BOOLEAN DEFAULT false,
        created_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        last_activity TIMESTAMPTZ DEFAULT NOW(),
        is_archived BOOLEAN DEFAULT false
      );
    `
  })

  if (threadsError) {
    console.error('❌ Error creating chat_threads:', threadsError)
    return false
  }

  // Create chat_messages table
  const { error: messagesError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        thread_id UUID NOT NULL,
        sender_id UUID,
        content TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        ai_data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        is_edited BOOLEAN DEFAULT false,
        reply_to_id UUID,
        reactions JSONB DEFAULT '[]'::jsonb
      );
    `
  })

  if (messagesError) {
    console.error('❌ Error creating chat_messages:', messagesError)
    return false
  }

  // Create thread_members table
  const { error: membersError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS thread_members (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        thread_id UUID NOT NULL,
        user_id UUID NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        last_read_at TIMESTAMPTZ DEFAULT NOW(),
        is_muted BOOLEAN DEFAULT false
      );
    `
  })

  if (membersError) {
    console.error('❌ Error creating thread_members:', membersError)
    return false
  }

  // Create user_presence table
  const { error: presenceError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS user_presence (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'offline',
        current_activity TEXT,
        last_seen TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  })

  if (presenceError) {
    console.error('❌ Error creating user_presence:', presenceError)
    return false
  }

  console.log('✅ All chat tables created successfully!')
  return true
}

const insertSampleData = async () => {
  console.log('🔄 Inserting sample data...')

  // Get test user ID
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'test@test.com')
    .single()

  if (userError || !users) {
    console.error('❌ Could not find test user:', userError)
    return false
  }

  const userId = users.id

  // Insert sample threads
  const { error: threadsInsertError } = await supabase
    .from('chat_threads')
    .insert([
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'AI-Hiring-Pipeline',
        description: 'AI-powered candidate screening and workflow automation',
        type: 'ai_workflow',
        priority: 'high',
        ai_enabled: true,
        created_by: userId
      },
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        name: 'urgent-positions',
        description: 'High-priority job openings requiring immediate attention',
        type: 'urgent',
        priority: 'urgent',
        ai_enabled: false,
        created_by: userId
      },
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        name: 'team-pulse',
        description: 'Daily team updates and collaboration',
        type: 'general',
        priority: 'medium',
        ai_enabled: true,
        created_by: userId
      }
    ])

  if (threadsInsertError) {
    console.error('❌ Error inserting threads:', threadsInsertError)
  } else {
    console.log('✅ Sample threads inserted!')
  }

  // Insert thread members
  const { error: membersInsertError } = await supabase
    .from('thread_members')
    .insert([
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        user_id: userId,
        role: 'admin'
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        user_id: userId,
        role: 'admin'
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        user_id: userId,
        role: 'admin'
      }
    ])

  if (membersInsertError) {
    console.error('❌ Error inserting members:', membersInsertError)
  } else {
    console.log('✅ Thread members inserted!')
  }

  // Insert sample messages
  const { error: messagesInsertError } = await supabase
    .from('chat_messages')
    .insert([
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        sender_id: userId,
        content: '🤖 AI detected 5 high-quality candidates for Senior Developer role. Auto-screening completed with 94% confidence.',
        message_type: 'ai_insight',
        ai_data: {
          confidence: 0.94,
          candidates_found: 5,
          role: 'Senior Developer',
          insight_type: 'screening_complete'
        }
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        sender_id: userId,
        content: 'Great! Can we review the top 3 candidates together?',
        message_type: 'text'
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        sender_id: userId,
        content: '🚨 CEO position at TechCorp needs 3 candidates by Friday. Current pipeline: 0 candidates.',
        message_type: 'text'
      }
    ])

  if (messagesInsertError) {
    console.error('❌ Error inserting messages:', messagesInsertError)
  } else {
    console.log('✅ Sample messages inserted!')
  }

  return true
}

const runMigration = async () => {
  console.log('🚀 Starting chat tables migration...')
  
  const tablesCreated = await createChatTables()
  if (!tablesCreated) {
    console.error('❌ Migration failed!')
    process.exit(1)
  }

  const dataInserted = await insertSampleData()
  if (!dataInserted) {
    console.error('❌ Sample data insertion failed!')
    process.exit(1)
  }

  console.log('🎉 Migration completed successfully!')
  process.exit(0)
}

runMigration()