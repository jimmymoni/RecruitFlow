import { Server as SocketIOServer } from 'socket.io'
import { logger } from '../utils/logger'
import { supabase } from '../config/supabase'
import jwt from 'jsonwebtoken'

interface AuthenticatedSocket {
  id: string
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
  join: (room: string) => void
  leave: (room: string) => void
  emit: (event: string, data: any) => void
  to: (room: string) => any
}

interface TypingUser {
  userId: string
  userName: string
  threadId: string
  timestamp: number
}

// Store typing users for cleanup
const typingUsers = new Map<string, TypingUser>()

export const setupChatSockets = (io: SocketIOServer) => {
  // Authentication middleware for socket connections
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return next(new Error('Authentication token required'))
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      
      // Get user details from Supabase
      const { data: user, error } = await supabase.auth.getUser(token)
      
      if (error || !user.user) {
        return next(new Error('Invalid authentication token'))
      }

      // Add user info to socket
      socket.user = {
        id: user.user.id,
        email: user.user.email,
        firstName: decoded.firstName || 'User',
        lastName: decoded.lastName || '',
        role: decoded.role || 'recruiter'
      }

      next()
    } catch (error) {
      logger.error('Socket authentication error:', error)
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    if (!socket.user) return

    const userId = socket.user.id
    const userName = `${socket.user.firstName} ${socket.user.lastName}`
    
    logger.info(`💬 Chat socket connected: ${userName} (${socket.id})`)

    // Update user presence to online
    updateUserPresence(userId, 'online')

    // Handle joining a thread room
    socket.on('join-thread', async (threadId: string) => {
      try {
        // Verify user has access to this thread
        const { data: participation } = await supabase
          .from('thread_participants')
          .select('id')
          .eq('thread_id', threadId)
          .eq('user_id', userId)
          .single()

        if (!participation) {
          socket.emit('error', { message: 'Access denied to this thread' })
          return
        }

        // Join the thread room
        socket.join(`thread-${threadId}`)
        logger.info(`User ${userName} joined thread ${threadId}`)

        // Notify others in the thread
        socket.to(`thread-${threadId}`).emit('user-joined', {
          userId,
          userName,
          threadId
        })

      } catch (error) {
        logger.error('Error joining thread:', error)
        socket.emit('error', { message: 'Failed to join thread' })
      }
    })

    // Handle leaving a thread room
    socket.on('leave-thread', (threadId: string) => {
      socket.leave(`thread-${threadId}`)
      logger.info(`User ${userName} left thread ${threadId}`)

      // Notify others in the thread
      socket.to(`thread-${threadId}`).emit('user-left', {
        userId,
        userName,
        threadId
      })

      // Clear typing status for this thread
      const typingKey = `${userId}-${threadId}`
      if (typingUsers.has(typingKey)) {
        typingUsers.delete(typingKey)
        socket.to(`thread-${threadId}`).emit('user-stopped-typing', {
          userId,
          userName,
          threadId
        })
      }
    })

    // Handle typing indicators
    socket.on('typing-start', (threadId: string) => {
      const typingKey = `${userId}-${threadId}`
      
      // Store typing status
      typingUsers.set(typingKey, {
        userId,
        userName,
        threadId,
        timestamp: Date.now()
      })

      // Broadcast typing status to others in thread
      socket.to(`thread-${threadId}`).emit('user-typing', {
        userId,
        userName,
        threadId
      })

      logger.debug(`User ${userName} started typing in thread ${threadId}`)
    })

    socket.on('typing-stop', (threadId: string) => {
      const typingKey = `${userId}-${threadId}`
      
      // Remove typing status
      if (typingUsers.has(typingKey)) {
        typingUsers.delete(typingKey)
        
        // Broadcast stop typing to others in thread
        socket.to(`thread-${threadId}`).emit('user-stopped-typing', {
          userId,
          userName,
          threadId
        })

        logger.debug(`User ${userName} stopped typing in thread ${threadId}`)
      }
    })

    // Handle real-time message sending (backup to HTTP API)
    socket.on('send-message', async (data) => {
      try {
        const { threadId, content, type = 'text' } = data

        // Verify access to thread
        const { data: participation } = await supabase
          .from('thread_participants')
          .select('id')
          .eq('thread_id', threadId)
          .eq('user_id', userId)
          .single()

        if (!participation) {
          socket.emit('error', { message: 'Access denied to this thread' })
          return
        }

        // Insert message into database
        const { data: message, error } = await supabase
          .from('chat_messages')
          .insert({
            thread_id: threadId,
            sender_id: userId,
            sender_name: userName,
            sender_role: socket.user!.role,
            content: content.trim(),
            message_type: type
          })
          .select()
          .single()

        if (error) {
          logger.error('Error sending message via socket:', error)
          socket.emit('error', { message: 'Failed to send message' })
          return
        }

        // Format and broadcast message
        const formattedMessage = {
          id: message.id,
          senderId: message.sender_id,
          senderName: message.sender_name,
          senderRole: message.sender_role,
          content: message.content,
          type: message.message_type,
          timestamp: message.created_at,
          reactions: []
        }

        // Broadcast to all users in thread (including sender)
        io.to(`thread-${threadId}`).emit('new-message', {
          threadId,
          message: formattedMessage
        })

        logger.info(`Message sent by ${userName} to thread ${threadId}`)

      } catch (error) {
        logger.error('Error handling send-message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Handle user status changes
    socket.on('status-change', (status: 'online' | 'away' | 'busy') => {
      updateUserPresence(userId, status)
      
      // Broadcast status change to all connected clients
      io.emit('user-status-changed', {
        userId,
        userName,
        status
      })
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`💬 Chat socket disconnected: ${userName} (${socket.id})`)
      
      // Update user presence to offline
      updateUserPresence(userId, 'offline')

      // Clean up typing indicators
      const userTypingKeys = Array.from(typingUsers.keys()).filter(key => key.startsWith(`${userId}-`))
      userTypingKeys.forEach(key => {
        const typing = typingUsers.get(key)
        if (typing) {
          typingUsers.delete(key)
          socket.to(`thread-${typing.threadId}`).emit('user-stopped-typing', {
            userId,
            userName,
            threadId: typing.threadId
          })
        }
      })

      // Broadcast user offline status
      io.emit('user-status-changed', {
        userId,
        userName,
        status: 'offline'
      })
    })
  })

  // Clean up stale typing indicators every 30 seconds
  setInterval(() => {
    const now = Date.now()
    const staleThreshold = 10000 // 10 seconds

    typingUsers.forEach((typing, key) => {
      if (now - typing.timestamp > staleThreshold) {
        typingUsers.delete(key)
        io.to(`thread-${typing.threadId}`).emit('user-stopped-typing', {
          userId: typing.userId,
          userName: typing.userName,
          threadId: typing.threadId
        })
      }
    })
  }, 30000)

  logger.info('🔌 Chat socket handlers initialized')
}

// Helper function to update user presence in database
async function updateUserPresence(userId: string, status: string) {
  try {
    await supabase
      .from('user_presence')
      .upsert({
        user_id: userId,
        status,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
  } catch (error) {
    logger.error('Error updating user presence:', error)
  }
}