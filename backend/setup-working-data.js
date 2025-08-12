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

const setupWorkingData = async () => {
  try {
    console.log('🚀 Setting up working chat data based on actual schema...')

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
    const userName = `${users.first_name} ${users.last_name}`
    console.log(`✅ Found test user: ${userName}`)

    // Basic threads - only required columns
    console.log('🔄 Inserting threads with basic schema...')
    
    const basicThreads = [
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'AI-Hiring-Pipeline',
        description: 'AI-powered candidate screening and workflow automation',
        type: 'ai_workflow',
        created_by: userId
      },
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        name: 'urgent-positions', 
        description: 'High-priority job openings requiring immediate attention',
        type: 'urgent',
        created_by: userId
      },
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        name: 'team-pulse',
        description: 'Daily team updates and collaboration',
        type: 'general',
        created_by: userId
      }
    ]

    for (const thread of basicThreads) {
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

    // Basic participants - only required columns
    console.log('🔄 Inserting thread participants...')
    
    const basicParticipants = [
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        user_id: userId
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        user_id: userId
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        user_id: userId
      }
    ]

    for (const participant of basicParticipants) {
      const { data: existing } = await supabase
        .from('thread_participants')
        .select('id')
        .eq('thread_id', participant.thread_id)
        .eq('user_id', participant.user_id)
        .single()

      if (!existing) {
        const { error } = await supabase
          .from('thread_participants')
          .insert([participant])
        
        if (error) {
          console.error('❌ Error inserting participant:', error)
        } else {
          console.log('✅ Inserted participant')
        }
      }
    }

    // Messages with sender_name required
    console.log('🔄 Inserting messages with sender_name...')
    
    const basicMessages = [
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        sender_id: userId,
        sender_name: userName,
        content: '🤖 AI detected 5 high-quality candidates for Senior Developer role. Auto-screening completed with 94% confidence.',
        message_type: 'ai_insight'
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        sender_id: userId,
        sender_name: userName,
        content: 'Great! Can we review the top 3 candidates together?',
        message_type: 'text'
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        sender_id: userId,
        sender_name: userName,
        content: '🚨 CEO position at TechCorp needs 3 candidates by Friday. Current pipeline: 0 candidates.',
        message_type: 'text'
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        sender_id: userId,
        sender_name: userName,
        content: '📊 Daily Pulse: 23 new applications, 5 interviews scheduled, 2 offers sent. Team velocity: +15% vs yesterday.',
        message_type: 'ai_insight'
      }
    ]

    for (let i = 0; i < basicMessages.length; i++) {
      const message = basicMessages[i]
      const { error } = await supabase
        .from('chat_messages')
        .insert([message])
      
      if (error) {
        console.error(`❌ Error inserting message ${i + 1}:`, error)
      } else {
        console.log(`✅ Inserted message ${i + 1}: "${message.content.substring(0, 50)}..."`)
      }
    }

    console.log('🎉 Working chat data setup complete!')
    return true

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

setupWorkingData().then(success => {
  console.log(success ? '✅ Setup completed successfully!' : '❌ Setup failed!')
  process.exit(success ? 0 : 1)
})