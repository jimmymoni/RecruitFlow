import express, { Request, Response } from 'express'
import { supabase } from '../config/supabase'
import { authMiddleware } from '../middleware/auth'
import { logger } from '../utils/logger'

// Optional Socket.IO import - will be undefined if not available
let io: any
try {
  const serverModule = require('../server')
  io = serverModule.io
} catch (error) {
  logger.warn('Socket.IO not available - real-time features disabled')
}

const router = express.Router()

// Apply auth middleware to all chat routes
router.use(authMiddleware)

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

// Get all chat threads for the authenticated user
router.get('/threads', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    // First, auto-join user to all default threads if not already a participant
    const { data: allThreads } = await supabase
      .from('chat_threads')
      .select('id, name, type, description')
      .in('type', ['main', 'group'])

    if (allThreads && allThreads.length > 0) {
      // Add user to all default threads (ignore conflicts)
      const participantInserts = allThreads.map(thread => ({
        thread_id: thread.id,
        user_id: userId
      }))

      await supabase
        .from('thread_participants')
        .upsert(participantInserts, { onConflict: 'thread_id,user_id' })
    }

    const { data: threads, error } = await supabase
      .from('chat_threads')
      .select(`
        *,
        thread_participants!inner(user_id),
        chat_messages(
          id,
          content,
          sender_name,
          created_at
        )
      `)
      .eq('thread_participants.user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      logger.error('Error fetching chat threads:', error)
      return res.status(500).json({ error: 'Failed to fetch chat threads' })
    }

    // Get unread count and last message for each thread
    const threadsWithMetadata = await Promise.all(
      threads.map(async (thread) => {
        // Get unread count
        const { data: participant } = await supabase
          .from('thread_participants')
          .select('last_read_at')
          .eq('thread_id', thread.id)
          .eq('user_id', userId)
          .single()

        const { count: unreadCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('thread_id', thread.id)
          .gt('created_at', participant?.last_read_at || '1970-01-01')

        // Get last message
        const { data: lastMessage } = await supabase
          .from('chat_messages')
          .select('content, sender_name, created_at')
          .eq('thread_id', thread.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...thread,
          unreadCount: unreadCount || 0,
          lastMessage: lastMessage?.content || '',
          lastActivity: lastMessage?.created_at || thread.updated_at,
          participants: thread.thread_participants?.length || 0
        }
      })
    )

    res.json(threadsWithMetadata)
  } catch (error) {
    logger.error('Error in /threads:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get messages for a specific thread
router.get('/threads/:threadId/messages', async (req: AuthRequest, res: Response) => {
  try {
    const { threadId } = req.params
    const userId = req.user?.id
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const offset = (page - 1) * limit

    // Check if user is participant in this thread
    const { data: participation } = await supabase
      .from('thread_participants')
      .select('id')
      .eq('thread_id', threadId)
      .eq('user_id', userId)
      .single()

    if (!participation) {
      return res.status(403).json({ error: 'Access denied to this thread' })
    }

    // Fetch messages with reactions
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        message_reactions(
          emoji,
          user_id,
          created_at
        )
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logger.error('Error fetching messages:', error)
      return res.status(500).json({ error: 'Failed to fetch messages' })
    }

    // Format messages for frontend
    const formattedMessages = messages.reverse().map(message => ({
      id: message.id,
      senderId: message.sender_id,
      senderName: message.sender_name,
      senderRole: message.sender_role,
      content: message.content,
      type: message.message_type,
      timestamp: message.created_at,
      editedAt: message.edited_at,
      replyToId: message.reply_to_id,
      commandResult: message.command_result,
      richPreview: message.rich_preview,
      fileUrl: message.file_url,
      reactions: message.message_reactions?.reduce((acc: any, reaction: any) => {
        const existingReaction = acc.find((r: any) => r.emoji === reaction.emoji)
        if (existingReaction) {
          existingReaction.count++
          existingReaction.users.push(reaction.user_id)
        } else {
          acc.push({
            emoji: reaction.emoji,
            count: 1,
            users: [reaction.user_id]
          })
        }
        return acc
      }, []) || []
    }))

    // Update last_read_at for the user
    await supabase
      .from('thread_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('thread_id', threadId)
      .eq('user_id', userId)

    res.json(formattedMessages)
  } catch (error) {
    logger.error('Error in /threads/:threadId/messages:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Send a message to a thread
router.post('/threads/:threadId/messages', async (req: AuthRequest, res: Response) => {
  try {
    const { threadId } = req.params
    const { content, type = 'text', replyToId, commandResult, richPreview, fileUrl } = req.body
    const user = req.user!

    // Check if user is participant in this thread
    const { data: participation } = await supabase
      .from('thread_participants')
      .select('id')
      .eq('thread_id', threadId)
      .eq('user_id', user.id)
      .single()

    if (!participation) {
      return res.status(403).json({ error: 'Access denied to this thread' })
    }

    // Insert the message
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        sender_name: `${user.firstName} ${user.lastName}`,
        sender_role: user.role,
        content: content.trim(),
        message_type: type,
        reply_to_id: replyToId || null,
        command_result: commandResult || null,
        rich_preview: richPreview || null,
        file_url: fileUrl || null
      })
      .select()
      .single()

    if (error) {
      logger.error('Error sending message:', error)
      return res.status(500).json({ error: 'Failed to send message' })
    }

    // Format message for real-time broadcast
    const formattedMessage = {
      id: message.id,
      senderId: message.sender_id,
      senderName: message.sender_name,
      senderRole: message.sender_role,
      content: message.content,
      type: message.message_type,
      timestamp: message.created_at,
      replyToId: message.reply_to_id,
      commandResult: message.command_result,
      richPreview: message.rich_preview,
      fileUrl: message.file_url,
      reactions: []
    }

    // Broadcast message to all users in the thread via Socket.io
    io?.to(`thread-${threadId}`).emit('new-message', {
      threadId,
      message: formattedMessage
    })

    res.status(201).json(formattedMessage)
  } catch (error) {
    logger.error('Error in POST /threads/:threadId/messages:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Join a thread (for real-time updates)
router.post('/threads/:threadId/join', async (req: AuthRequest, res: Response) => {
  try {
    const { threadId } = req.params
    const userId = req.user?.id

    // Add user as participant if not already
    const { error } = await supabase
      .from('thread_participants')
      .insert({
        thread_id: threadId,
        user_id: userId,
      })
      .select()
      .single()

    if (error && error.code !== '23505') { // 23505 is unique constraint violation
      logger.error('Error joining thread:', error)
      return res.status(500).json({ error: 'Failed to join thread' })
    }

    res.json({ success: true })
  } catch (error) {
    logger.error('Error in POST /threads/:threadId/join:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Add reaction to a message
router.post('/messages/:messageId/reactions', async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params
    const { emoji } = req.body
    const userId = req.user?.id

    const { data: reaction, error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: userId,
        emoji
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Reaction already exists' })
      }
      logger.error('Error adding reaction:', error)
      return res.status(500).json({ error: 'Failed to add reaction' })
    }

    // Get the thread ID for broadcasting
    const { data: message } = await supabase
      .from('chat_messages')
      .select('thread_id')
      .eq('id', messageId)
      .single()

    if (message) {
      // Broadcast reaction to thread
      io?.to(`thread-${message.thread_id}`).emit('new-reaction', {
        messageId,
        emoji,
        userId
      })
    }

    res.status(201).json(reaction)
  } catch (error) {
    logger.error('Error in POST /messages/:messageId/reactions:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user presence and typing status
router.post('/presence', async (req: AuthRequest, res: Response) => {
  try {
    const { status, isTyping = false, typingThreadId } = req.body
    const userId = req.user?.id

    const { error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: userId,
        status,
        is_typing: isTyping,
        typing_thread_id: typingThreadId,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) {
      logger.error('Error updating presence:', error)
      return res.status(500).json({ error: 'Failed to update presence' })
    }

    // Broadcast presence update
    io?.emit('presence-update', {
      userId,
      status,
      isTyping,
      typingThreadId,
      lastSeen: new Date().toISOString()
    })

    res.json({ success: true })
  } catch (error) {
    logger.error('Error in POST /presence:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get online users
router.get('/presence', async (req: AuthRequest, res: Response) => {
  try {
    const { data: presence, error } = await supabase
      .from('user_presence')
      .select('*')
      .in('status', ['online', 'away', 'busy'])

    if (error) {
      logger.error('Error fetching presence:', error)
      return res.status(500).json({ error: 'Failed to fetch presence' })
    }

    res.json(presence)
  } catch (error) {
    logger.error('Error in GET /presence:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Initialize chat with default data (for development/testing)
router.post('/init', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const userName = `${req.user?.firstName} ${req.user?.lastName}`

    logger.info(`Initializing chat for user: ${userName} (${userId})`)

    // Create default threads if they don't exist
    const defaultThreads = [
      { name: 'General', type: 'main', description: 'General team discussion' },
      { name: 'Candidates', type: 'group', description: 'Discuss candidates and recruitment' },
      { name: 'Jobs', type: 'group', description: 'Job postings and requirements' },
      { name: 'Clients', type: 'group', description: 'Client relationships and updates' }
    ]

    let threadsCreated = 0
    let userJoined = 0

    for (const threadData of defaultThreads) {
      try {
        // Check if thread exists first
        const { data: existingThread } = await supabase
          .from('chat_threads')
          .select('id, name, description, type')
          .eq('name', threadData.name)
          .single()

        let thread = existingThread

        if (!existingThread) {
          // Create new thread
          const { data: newThread, error: threadError } = await supabase
            .from('chat_threads')
            .insert(threadData)
            .select()
            .single()

          if (threadError) {
            logger.error(`Error creating thread ${threadData.name}:`, threadError)
            continue
          }

          thread = newThread
          threadsCreated++
        }

        if (thread) {
          // Add current user to thread
          const { error: participantError } = await supabase
            .from('thread_participants')
            .insert({
              thread_id: thread.id,
              user_id: userId
            })

          if (participantError && participantError.code !== '23505') {
            logger.error(`Error adding user to thread ${thread.name}:`, participantError)
          } else if (!participantError) {
            userJoined++
          }

          // Add a welcome message if this is a new thread with no messages
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id)

          if (count === 0) {
            await supabase
              .from('chat_messages')
              .insert({
                thread_id: thread.id,
                sender_id: 'system',
                sender_name: 'RecruitFlow Bot',
                sender_role: 'system',
                content: `Welcome to #${thread.name}! 🎉 This channel is for ${thread.description?.toLowerCase()}. Feel free to start chatting!`,
                message_type: 'system'
              })
          }
        }
      } catch (error) {
        logger.error(`Error processing thread ${threadData.name}:`, error)
        continue
      }
    }

    // Set user presence
    try {
      await supabase
        .from('user_presence')
        .insert({
          user_id: userId,
          status: 'online',
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
    } catch (presenceError: any) {
      if (presenceError.code === '23505') {
        // Update existing presence
        await supabase
          .from('user_presence')
          .update({
            status: 'online',
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
      }
    }

    logger.info(`Chat init complete: ${threadsCreated} threads created, joined ${userJoined} threads`)
    res.json({ 
      success: true, 
      message: 'Chat initialized successfully',
      threadsCreated,
      userJoined
    })
  } catch (error) {
    logger.error('Error in /init:', error)
    res.status(500).json({ error: 'Failed to initialize chat', details: error })
  }
})

export default router