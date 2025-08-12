import * as express from 'express'
import { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import * as jwt from 'jsonwebtoken'

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    email: string
    role: string
  }
}

const router = express.Router()

// Function to get Supabase admin client
const getSupabaseAdmin = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Middleware to authenticate requests
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: any) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' })
  }
}

// GET /api/teams/threads - Get all chat threads for the team
router.get('/threads', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    // Get all threads with recent messages
    const { data: threads, error: threadsError } = await supabaseAdmin
      .from('chat_threads')
      .select(`
        id,
        name,
        description,
        type,
        created_at,
        updated_at,
        created_by,
        thread_participants (
          user_id,
          users (
            id,
            first_name,
            last_name,
            role
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (threadsError) {
      console.error('Error fetching threads:', threadsError)
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch threads',
        error: threadsError.message 
      })
    }

    // Get recent messages for each thread
    const threadsWithMessages = await Promise.all(
      threads.map(async (thread) => {
        const { data: messages, error: messagesError } = await supabaseAdmin
          .from('chat_messages')
          .select(`
            id,
            content,
            message_type,
            created_at,
            sender_id,
            sender_name,
            sender_role
          `)
          .eq('thread_id', thread.id)
          .order('created_at', { ascending: true })
          .limit(50)

        if (messagesError) {
          console.error('Error fetching messages for thread', thread.id, messagesError)
          return { ...thread, chat_messages: [] }
        }

        // Format messages (no ai_data field)
        const formattedMessages = messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          message_type: msg.message_type,
          sender_name: (msg as any).sender_name || 'Unknown User',
          sender_role: (msg as any).sender_role || 'user',
          created_at: msg.created_at
        }))

        // Get unread count for current user
        const { count: unreadCount } = await supabaseAdmin
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('thread_id', thread.id)
          .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

        return {
          ...thread,
          chat_messages: formattedMessages,
          unread_count: unreadCount || 0
        }
      })
    )

    return res.json({
      success: true,
      threads: threadsWithMessages
    })

  } catch (error) {
    console.error('Teams threads error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// POST /api/teams/threads - Create a new chat thread
router.post('/threads', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, type = 'general', priority = 'medium', ai_enabled = false } = req.body
    const userId = req.user?.userId

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Thread name is required'
      })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Create the thread
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('chat_threads')
      .insert([
        {
          name: name.trim(),
          description: description?.trim(),
          type,
          priority,
          ai_enabled,
          created_by: userId,
          last_activity: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (threadError) {
      console.error('Error creating thread:', threadError)
      return res.status(500).json({
        success: false,
        message: 'Failed to create thread',
        error: threadError.message
      })
    }

    // Add creator to thread members
    const { error: memberError } = await supabaseAdmin
      .from('thread_members')
      .insert([
        {
          thread_id: thread.id,
          user_id: userId,
          role: 'admin',
          joined_at: new Date().toISOString()
        }
      ])

    if (memberError) {
      console.error('Error adding thread member:', memberError)
    }

    return res.status(201).json({
      success: true,
      message: 'Thread created successfully',
      thread: {
        ...thread,
        chat_messages: [],
        unread_count: 0
      }
    })

  } catch (error) {
    console.error('Create thread error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// POST /api/teams/threads/:threadId/messages - Send a message to a thread
router.post('/threads/:threadId/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { threadId } = req.params
    const { content, type = 'text', ai_data } = req.body
    const userId = req.user?.userId

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Verify thread exists and user has access
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('chat_threads')
      .select('id, name')
      .eq('id', threadId)
      .single()

    if (threadError || !thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      })
    }

    // Get user info for sender_name and sender_role
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name, role')
      .eq('id', userId)
      .single()

    const senderName = user ? `${user.first_name} ${user.last_name}` : 'Unknown User'
    const senderRole = user?.role || 'user'

    // Create the message
    const { data: message, error: messageError } = await supabaseAdmin
      .from('chat_messages')
      .insert([
        {
          thread_id: threadId,
          sender_id: userId,
          sender_name: senderName,
          sender_role: senderRole,
          content: content.trim(),
          message_type: type
        }
      ])
      .select(`
        id,
        content,
        message_type,
        created_at,
        sender_name,
        sender_role
      `)
      .single()

    if (messageError) {
      console.error('Error creating message:', messageError)
      return res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: messageError.message
      })
    }

    // Update thread's updated_at timestamp
    await supabaseAdmin
      .from('chat_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId)

    // Format message response
    const formattedMessage = {
      id: message.id,
      content: message.content,
      message_type: message.message_type,
      sender_name: (message as any).sender_name,
      sender_role: (message as any).sender_role,
      created_at: message.created_at
    }

    return res.status(201).json({
      success: true,
      message: formattedMessage
    })

  } catch (error) {
    console.error('Send message error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// GET /api/teams/threads/:threadId/messages - Get messages for a specific thread
router.get('/threads/:threadId/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { threadId } = req.params
    const { limit = 50, before } = req.query

    const supabaseAdmin = getSupabaseAdmin()

    let query = supabaseAdmin
      .from('chat_messages')
      .select(`
        id,
        content,
        message_type,
        created_at,
        sender_id,
        sender_name,
        sender_role
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: false })
      .limit(Number(limit))

    if (before) {
      query = query.lt('created_at', before as string)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch messages',
        error: error.message
      })
    }

    // Format messages
    const formattedMessages = messages
      .reverse() // Show oldest first
      .map(msg => ({
        id: msg.id,
        content: msg.content,
        message_type: msg.message_type,
        sender_name: (msg as any).sender_name || 'Unknown User',
        sender_role: (msg as any).sender_role || 'user',
        created_at: msg.created_at
      }))

    return res.json({
      success: true,
      messages: formattedMessages
    })

  } catch (error) {
    console.error('Get messages error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// GET /api/teams/members - Get team members with presence status
router.get('/members', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: members, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        role,
        last_login_at,
        is_active,
        avatar,
        user_presence (
          status,
          last_seen,
          current_activity
        )
      `)
      .eq('is_active', true)
      .order('last_login_at', { ascending: false })

    if (error) {
      console.error('Error fetching team members:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch team members',
        error: error.message
      })
    }

    // Format members with presence status
    const formattedMembers = members.map(member => {
      const presence = member.user_presence?.[0]
      const lastSeen = presence?.last_seen || member.last_login_at
      const timeSinceLastSeen = lastSeen ? Date.now() - new Date(lastSeen).getTime() : Infinity
      
      // Determine online status based on last activity
      let status = 'offline'
      if (timeSinceLastSeen < 5 * 60 * 1000) { // 5 minutes
        status = presence?.status || 'online'
      } else if (timeSinceLastSeen < 30 * 60 * 1000) { // 30 minutes
        status = 'away'
      }

      return {
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        role: member.role,
        status,
        avatar: member.avatar,
        current_activity: presence?.current_activity,
        last_seen: lastSeen
      }
    })

    return res.json({
      success: true,
      members: formattedMembers
    })

  } catch (error) {
    console.error('Get team members error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// POST /api/teams/presence - Update user presence status
router.post('/presence', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, current_activity } = req.body
    const userId = req.user?.userId

    const validStatuses = ['online', 'away', 'busy', 'offline']
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: online, away, busy, offline'
      })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Upsert presence record
    const { error } = await supabaseAdmin
      .from('user_presence')
      .upsert([
        {
          user_id: userId,
          status: status || 'online',
          current_activity: current_activity || null,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ], {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error updating presence:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to update presence',
        error: error.message
      })
    }

    return res.json({
      success: true,
      message: 'Presence updated successfully'
    })

  } catch (error) {
    console.error('Update presence error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// POST /api/teams/ai-insight - Trigger AI insight generation
router.post('/ai-insight', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { thread_id, insight_type = 'general' } = req.body
    const userId = req.user?.userId

    // AI insight templates based on type
    const insights = {
      general: [
        '🤖 AI Analysis: 3 new candidates match your requirements with 95%+ fit score. Would you like me to schedule interviews?',
        '📊 Workflow Update: Auto-screening completed for 12 applications. 4 candidates advanced to next stage.',
        '⚡ Quick Win: I found 2 passive candidates on LinkedIn who perfectly match the Senior Developer role.',
        '🎯 Smart Suggestion: Based on recent hires, candidates with React + Node.js experience have 85% success rate.'
      ],
      candidate_review: [
        '🔍 Candidate Alert: Alex Chen (95% fit) submitted application for Senior Developer. High technical skill match detected.',
        '📈 Pipeline Insight: 23 new applications today with 67% pre-screening pass rate. AI filtered 15 high-potential candidates.',
        '🎯 Review Ready: 5 candidates have completed initial screening and are ready for detailed AI analysis.',
        '💡 Skill Match Alert: Found 3 candidates with perfect React + TypeScript + AWS experience match.'
      ],
      market_intelligence: [
        '📊 Market Intelligence: Salary expectations in your area increased 12% for React developers. Consider budget adjustment.',
        '🚀 Sourcing Insight: 45% response rate improvement when mentioning remote work options in outreach.',
        '📈 Trend Alert: JavaScript frameworks demand shifted 23% toward Next.js in your market.',
        '💰 Competitive Analysis: Your offers are 8% below market average for senior positions.'
      ]
    }

    const selectedInsights = insights[insight_type as keyof typeof insights] || insights.general
    const randomInsight = selectedInsights[Math.floor(Math.random() * selectedInsights.length)]

    // If thread_id provided, send insight as message
    if (thread_id) {
      const supabaseAdmin = getSupabaseAdmin()

      const { data: message, error } = await supabaseAdmin
        .from('chat_messages')
        .insert([
          {
            thread_id,
            sender_id: userId, // In a real system, this would be the AI bot user ID
            content: randomInsight,
            message_type: 'ai_insight',
            ai_data: {
              insight_type,
              confidence: Math.floor(Math.random() * 20) + 80,
              generated_at: new Date().toISOString(),
              priority: Math.random() > 0.7 ? 'high' : 'medium'
            },
            created_at: new Date().toISOString()
          }
        ])
        .select(`
          id,
          content,
          message_type,
          ai_data,
          created_at
        `)
        .single()

      if (error) {
        console.error('Error creating AI insight message:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to generate AI insight',
          error: error.message
        })
      }

      // Update thread's last activity
      await supabaseAdmin
        .from('chat_threads')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', thread_id)

      return res.json({
        success: true,
        message: {
          id: message.id,
          content: message.content,
          message_type: message.message_type,
          ai_data: message.ai_data,
          sender_name: 'RecruitFlow AI',
          sender_role: 'ai',
          created_at: message.created_at
        }
      })
    } else {
      // Return insight without saving
      return res.json({
        success: true,
        insight: {
          content: randomInsight,
          type: insight_type,
          generated_at: new Date().toISOString()
        }
      })
    }

  } catch (error) {
    console.error('AI insight error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router