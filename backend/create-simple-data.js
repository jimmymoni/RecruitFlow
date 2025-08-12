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

const createSimpleData = async () => {
  try {
    console.log('🚀 Creating sample chat data with existing schema...')

    // Get test user
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
    console.log(`✅ Found test user: ${users.first_name} ${users.last_name}`)

    // Insert simple threads (adapting to existing schema)
    console.log('🔄 Inserting threads with minimal schema...')
    
    const simpleThreads = [
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'AI-Hiring-Pipeline',
        description: 'AI-powered candidate screening and workflow automation',
        type: 'ai_workflow',
        priority: 'high',
        created_by: userId
      },
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        name: 'urgent-positions', 
        description: 'High-priority job openings requiring immediate attention',
        type: 'urgent',
        priority: 'urgent',
        created_by: userId
      },
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        name: 'team-pulse',
        description: 'Daily team updates and collaboration',
        type: 'general',
        priority: 'medium',
        created_by: userId
      }
    ]

    for (const thread of simpleThreads) {
      // Check if thread exists
      const { data: existing } = await supabase
        .from('chat_threads')
        .select('id')
        .eq('id', thread.id)
        .single()

      if (!existing) {
        const { error } = await supabase
          .from('chat_threads')
          .insert([thread])
        
        if (error) {
          console.error(`❌ Error inserting thread ${thread.name}:`, error)
        } else {
          console.log(`✅ Inserted thread: ${thread.name}`)
        }
      } else {
        console.log(`ℹ️ Thread ${thread.name} already exists`)
      }
    }

    // Insert thread participants (using the suggested table name)
    console.log('🔄 Inserting thread participants...')
    
    const participants = [
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
    ]

    for (const participant of participants) {
      const { error } = await supabase
        .from('thread_participants')
        .insert([participant])
      
      if (error) {
        console.error('❌ Error inserting participant:', error)
      } else {
        console.log('✅ Inserted participant')
      }
    }

    // Insert simple messages
    console.log('🔄 Inserting messages...')
    
    const simpleMessages = [
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        sender_id: userId,
        content: '🤖 AI detected 5 high-quality candidates for Senior Developer role. Auto-screening completed with 94% confidence.',
        message_type: 'ai_insight'
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
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        sender_id: userId,
        content: '📊 Daily Pulse: 23 new applications, 5 interviews scheduled, 2 offers sent. Team velocity: +15% vs yesterday.',
        message_type: 'ai_insight'
      }
    ]

    for (let i = 0; i < simpleMessages.length; i++) {
      const message = simpleMessages[i]
      const { error } = await supabase
        .from('chat_messages')
        .insert([message])
      
      if (error) {
        console.error(`❌ Error inserting message ${i + 1}:`, error)
      } else {
        console.log(`✅ Inserted message ${i + 1}`)
      }
    }

    // Simple user presence
    console.log('🔄 Inserting user presence...')
    const { error: presenceError } = await supabase
      .from('user_presence')
      .upsert([
        {
          user_id: userId,
          status: 'online'
        }
      ], {
        onConflict: 'user_id'
      })

    if (presenceError) {
      console.error('❌ Error inserting presence:', presenceError)
    } else {
      console.log('✅ Inserted user presence')
    }

    console.log('🎉 Simple chat data created successfully!')
    return true

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

createSimpleData().then(success => {
  console.log(success ? '✅ Done!' : '❌ Failed!')
  process.exit(success ? 0 : 1)
})