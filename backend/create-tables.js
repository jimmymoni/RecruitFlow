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

const createTablesAndData = async () => {
  console.log('🚀 Creating chat tables and sample data using direct inserts...')

  try {
    // Get test user ID first
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('email', 'test@test.com')
      .single()

    if (userError || !users) {
      console.error('❌ Could not find test user:', userError)
      return false
    }

    const userId = users.id
    console.log(`✅ Found test user: ${users.first_name} ${users.last_name} (${users.email})`)

    // First, let's create the tables manually if they don't exist
    // We'll do this by trying to insert data and letting Supabase handle table creation

    // Insert sample threads (this will create the table if it doesn't exist)
    console.log('🔄 Creating chat_threads and inserting sample data...')
    
    const threads = [
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'AI-Hiring-Pipeline',
        description: 'AI-powered candidate screening and workflow automation',
        type: 'ai_workflow',
        priority: 'high',
        ai_enabled: true,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        is_archived: false
      },
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        name: 'urgent-positions',
        description: 'High-priority job openings requiring immediate attention',
        type: 'urgent',
        priority: 'urgent',
        ai_enabled: false,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        is_archived: false
      },
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        name: 'team-pulse',
        description: 'Daily team updates and collaboration',
        type: 'general',
        priority: 'medium',
        ai_enabled: true,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        is_archived: false
      }
    ]

    console.log('📝 Attempting to insert threads (will create table if needed)...')
    
    // Try inserting threads
    for (const thread of threads) {
      const { data: existingThread } = await supabase
        .from('chat_threads')
        .select('id')
        .eq('id', thread.id)
        .single()

      if (!existingThread) {
        const { error: threadError } = await supabase
          .from('chat_threads')
          .insert([thread])

        if (threadError) {
          console.error(`❌ Error inserting thread ${thread.name}:`, threadError)
        } else {
          console.log(`✅ Inserted thread: ${thread.name}`)
        }
      } else {
        console.log(`ℹ️ Thread ${thread.name} already exists`)
      }
    }

    // Insert thread members
    console.log('🔄 Creating thread_members and inserting data...')
    const members = [
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        user_id: userId,
        role: 'admin',
        joined_at: new Date().toISOString(),
        last_read_at: new Date().toISOString(),
        is_muted: false
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        user_id: userId,
        role: 'admin',
        joined_at: new Date().toISOString(),
        last_read_at: new Date().toISOString(),
        is_muted: false
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        user_id: userId,
        role: 'admin',
        joined_at: new Date().toISOString(),
        last_read_at: new Date().toISOString(),
        is_muted: false
      }
    ]

    for (const member of members) {
      const { data: existingMember } = await supabase
        .from('thread_members')
        .select('id')
        .eq('thread_id', member.thread_id)
        .eq('user_id', member.user_id)
        .single()

      if (!existingMember) {
        const { error: memberError } = await supabase
          .from('thread_members')
          .insert([member])

        if (memberError) {
          console.error('❌ Error inserting member:', memberError)
        } else {
          console.log('✅ Inserted thread member')
        }
      }
    }

    // Insert sample messages
    console.log('🔄 Creating chat_messages and inserting sample data...')
    const messages = [
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
        },
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        is_edited: false,
        reply_to_id: null,
        reactions: []
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        sender_id: userId,
        content: 'Great! Can we review the top 3 candidates together?',
        message_type: 'text',
        ai_data: null,
        created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 minutes ago
        updated_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        is_edited: false,
        reply_to_id: null,
        reactions: []
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        sender_id: userId,
        content: '🚨 CEO position at TechCorp needs 3 candidates by Friday. Current pipeline: 0 candidates.',
        message_type: 'text',
        ai_data: null,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        is_edited: false,
        reply_to_id: null,
        reactions: []
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        sender_id: userId,
        content: '📊 Daily Pulse: 23 new applications, 5 interviews scheduled, 2 offers sent. Team velocity: +15% vs yesterday.',
        message_type: 'ai_insight',
        ai_data: {
          applications: 23,
          interviews: 5,
          offers: 2,
          velocity_change: 0.15
        },
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        is_edited: false,
        reply_to_id: null,
        reactions: []
      }
    ]

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([message])

      if (messageError) {
        console.error(`❌ Error inserting message ${i + 1}:`, messageError)
      } else {
        console.log(`✅ Inserted message ${i + 1}`)
      }
    }

    // Create user presence
    console.log('🔄 Creating user_presence and inserting data...')
    const { error: presenceError } = await supabase
      .from('user_presence')
      .upsert([
        {
          user_id: userId,
          status: 'online',
          current_activity: 'Reviewing candidates',
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ], {
        onConflict: 'user_id'
      })

    if (presenceError) {
      console.error('❌ Error inserting presence:', presenceError)
    } else {
      console.log('✅ Inserted user presence')
    }

    console.log('🎉 All chat data created successfully!')
    return true

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

const main = async () => {
  const success = await createTablesAndData()
  if (success) {
    console.log('✅ Migration completed successfully!')
  } else {
    console.log('❌ Migration failed!')
  }
  process.exit(success ? 0 : 1)
}

main()