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

const finalChatSetup = async () => {
  try {
    console.log('🚀 Final chat setup with complete schema...')

    // Get test user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('email', 'test@test.com')
      .single()

    if (userError || !users) {
      console.error('❌ Could not find test user:', userError)
      return false
    }

    const userId = users.id
    const userName = `${users.first_name} ${users.last_name}`
    const userRole = users.role || 'admin'
    console.log(`✅ Found test user: ${userName} (${userRole})`)

    // Messages with all required fields
    console.log('🔄 Inserting messages with complete schema...')
    
    const completeMessages = [
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        sender_id: userId,
        sender_name: 'RecruitFlow AI',
        sender_role: 'ai',
        content: '🤖 AI detected 5 high-quality candidates for Senior Developer role. Auto-screening completed with 94% confidence.',
        message_type: 'ai_insight'
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        sender_id: userId,
        sender_name: userName,
        sender_role: userRole,
        content: 'Great! Can we review the top 3 candidates together?',
        message_type: 'text'
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        sender_id: userId,
        sender_name: userName,
        sender_role: userRole,
        content: '🚨 CEO position at TechCorp needs 3 candidates by Friday. Current pipeline: 0 candidates.',
        message_type: 'text'
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        sender_id: userId,
        sender_name: 'RecruitFlow AI',
        sender_role: 'ai',
        content: '📊 Daily Pulse: 23 new applications, 5 interviews scheduled, 2 offers sent. Team velocity: +15% vs yesterday.',
        message_type: 'ai_insight'
      },
      // Add a few more messages for a richer conversation
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        sender_id: userId,
        sender_name: userName,
        sender_role: userRole,
        content: 'Perfect! Let me schedule interviews for the top candidates.',
        message_type: 'text'
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        sender_id: userId,
        sender_name: userName,
        sender_role: userRole,
        content: 'I have 2 potential candidates from our network. Setting up calls today.',
        message_type: 'text'
      },
      {
        thread_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        sender_id: userId,
        sender_name: userName,
        sender_role: userRole,
        content: 'Excellent metrics! Team is really hitting our targets this month.',
        message_type: 'text'
      }
    ]

    let successCount = 0
    for (let i = 0; i < completeMessages.length; i++) {
      const message = completeMessages[i]
      const { error } = await supabase
        .from('chat_messages')
        .insert([message])
      
      if (error) {
        console.error(`❌ Error inserting message ${i + 1}:`, error)
      } else {
        console.log(`✅ Inserted message ${i + 1}: "${message.content.substring(0, 50)}..." by ${message.sender_name}`)
        successCount++
      }
    }

    console.log(`🎉 Chat setup complete! Successfully inserted ${successCount}/${completeMessages.length} messages`)
    return successCount > 0

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

finalChatSetup().then(success => {
  console.log(success ? '✅ Final setup completed successfully!' : '❌ Final setup failed!')
  process.exit(success ? 0 : 1)
})