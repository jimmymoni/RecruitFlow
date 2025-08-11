import { Server as SocketServer, Socket } from 'socket.io'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface AuthenticatedSocket extends Socket {
  userId?: string
  userEmail?: string
  userRole?: string
}

// Store active connections
const activeConnections = new Map<string, AuthenticatedSocket>()

export const setupChatHandlers = (io: SocketServer) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token
      
      if (!token) {
        return next(new Error('Authentication token required'))
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      socket.userId = decoded.userId
      socket.userEmail = decoded.email
      socket.userRole = decoded.role
      
      next()
    } catch (err) {
      console.error('Socket authentication error:', err)
      next(new Error('Invalid authentication token'))
    }
  })

  io.on('connection', async (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userEmail} connected with socket ${socket.id}`)
    
    // Store connection
    if (socket.userId) {
      activeConnections.set(socket.userId, socket)
      
      // Update user presence
      await updateUserPresence(socket.userId, 'online')
      
      // Broadcast user online status to their teams
      await broadcastUserStatus(socket.userId, 'online', io)
    }
    
    // Join user to their team rooms
    await joinUserTeams(socket)
    
    // Handle chat message
    socket.on('send_message', async (data) => {
      try {
        await handleSendMessage(socket, data, io)
      } catch (error) {
        console.error('Send message error:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })
    
    // Handle typing indicator
    socket.on('typing_start', async (data) => {
      const { channelId } = data
      socket.to(`channel_${channelId}`).emit('user_typing', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        channelId
      })
    })
    
    socket.on('typing_stop', async (data) => {
      const { channelId } = data
      socket.to(`channel_${channelId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        channelId
      })
    })
    
    // Handle message reactions
    socket.on('add_reaction', async (data) => {
      try {
        await handleAddReaction(socket, data, io)
      } catch (error) {
        console.error('Add reaction error:', error)
        socket.emit('error', { message: 'Failed to add reaction' })
      }
    })
    
    // Handle joining/leaving channels
    socket.on('join_channel', async (channelId: string) => {
      const hasAccess = await checkChannelAccess(socket.userId!, channelId)
      if (hasAccess) {
        socket.join(`channel_${channelId}`)
        console.log(`User ${socket.userEmail} joined channel ${channelId}`)
      }
    })
    
    socket.on('leave_channel', (channelId: string) => {
      socket.leave(`channel_${channelId}`)
      console.log(`User ${socket.userEmail} left channel ${channelId}`)
    })
    
    // Handle task notifications
    socket.on('task_assigned', async (data) => {
      try {
        await handleTaskAssigned(data, io)
      } catch (error) {
        console.error('Task assignment error:', error)
      }
    })
    
    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.userEmail} disconnected`)
      
      if (socket.userId) {
        activeConnections.delete(socket.userId)
        await updateUserPresence(socket.userId, 'offline')
        await broadcastUserStatus(socket.userId, 'offline', io)
      }
    })
    
    // Handle status updates
    socket.on('update_status', async (data) => {
      const { status, statusMessage } = data
      if (socket.userId) {
        await updateUserPresence(socket.userId, status, statusMessage)
        await broadcastUserStatus(socket.userId, status, io)
      }
    })
  })
}

// Helper functions
async function joinUserTeams(socket: AuthenticatedSocket) {
  try {
    const { data: teams } = await supabaseAdmin
      .from('teams')
      .select(`
        id,
        team_members!inner(user_id)
      `)
      .eq('team_members.user_id', socket.userId)
      .eq('team_members.is_active', true)
    
    if (teams) {
      teams.forEach(team => {
        socket.join(`team_${team.id}`)
        console.log(`User ${socket.userEmail} joined team ${team.id}`)
      })
    }
    
    // Also join channels the user has access to
    const { data: channels } = await supabaseAdmin
      .from('chat_channels')
      .select('id')
      .eq('team_id', teams?.map(t => t.id))
    
    if (channels) {
      channels.forEach(channel => {
        socket.join(`channel_${channel.id}`)
      })
    }
  } catch (error) {
    console.error('Error joining user teams:', error)
  }
}

async function handleSendMessage(socket: AuthenticatedSocket, data: any, io: SocketServer) {
  const { channelId, content, messageType = 'text', replyToId, metadata = {} } = data
  
  // Verify user has access to this channel
  const hasAccess = await checkChannelAccess(socket.userId!, channelId)
  if (!hasAccess) {
    socket.emit('error', { message: 'Access denied to this channel' })
    return
  }
  
  // Save message to database
  const { data: message, error } = await supabaseAdmin
    .from('messages')
    .insert([{
      channel_id: channelId,
      sender_id: socket.userId,
      content,
      message_type: messageType,
      reply_to_id: replyToId || null,
      metadata
    }])
    .select(`
      *,
      sender:users(
        id,
        first_name,
        last_name,
        email,
        avatar
      ),
      reply_to:messages(
        id,
        content,
        sender:users(first_name, last_name)
      )
    `)
    .single()
  
  if (error) {
    console.error('Database error saving message:', error)
    socket.emit('error', { message: 'Failed to save message' })
    return
  }
  
  // Broadcast message to all users in the channel
  io.to(`channel_${channelId}`).emit('new_message', {
    ...message,
    timestamp: new Date().toISOString()
  })
  
  // Create notifications for mentions
  if (content.includes('@')) {
    await handleMentionNotifications(message, channelId)
  }
}

async function handleAddReaction(socket: AuthenticatedSocket, data: any, io: SocketServer) {
  const { messageId, reaction } = data
  
  // Save reaction to database
  const { data: reactionData, error } = await supabaseAdmin
    .from('message_reactions')
    .insert([{
      message_id: messageId,
      user_id: socket.userId,
      reaction
    }])
    .select(`
      *,
      user:users(
        id,
        first_name,
        last_name,
        avatar
      )
    `)
    .single()
  
  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      // User already reacted with this emoji, remove it instead
      await supabaseAdmin
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', socket.userId)
        .eq('reaction', reaction)
      
      io.emit('reaction_removed', { messageId, reaction, userId: socket.userId })
      return
    }
    
    console.error('Database error saving reaction:', error)
    socket.emit('error', { message: 'Failed to add reaction' })
    return
  }
  
  // Broadcast reaction to all connected users
  io.emit('reaction_added', {
    messageId,
    reaction: reactionData
  })
}

async function handleTaskAssigned(data: any, io: SocketServer) {
  const { taskId, assignedToId, assignedById, title } = data
  
  // Create notification
  await supabaseAdmin
    .from('notifications')
    .insert([{
      user_id: assignedToId,
      type: 'task_assigned',
      title: 'New Task Assigned',
      content: `You have been assigned a new task: ${title}`,
      data: { taskId, assignedById }
    }])
  
  // Send real-time notification if user is online
  const userSocket = activeConnections.get(assignedToId)
  if (userSocket) {
    userSocket.emit('notification', {
      type: 'task_assigned',
      title: 'New Task Assigned',
      content: `You have been assigned a new task: ${title}`,
      data: { taskId }
    })
  }
}

async function checkChannelAccess(userId: string, channelId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('chat_channels')
      .select(`
        id,
        type,
        team_id,
        teams(
          team_members!inner(user_id)
        )
      `)
      .eq('id', channelId)
      .eq('teams.team_members.user_id', userId)
      .eq('teams.team_members.is_active', true)
      .single()
    
    return !error && !!data
  } catch (error) {
    console.error('Error checking channel access:', error)
    return false
  }
}

async function updateUserPresence(userId: string, status: string, statusMessage?: string) {
  try {
    await supabaseAdmin
      .from('user_presence')
      .upsert({
        user_id: userId,
        status,
        status_message: statusMessage || null,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error updating user presence:', error)
  }
}

async function broadcastUserStatus(userId: string, status: string, io: SocketServer) {
  try {
    // Get user's teams to broadcast status to team members
    const { data: teams } = await supabaseAdmin
      .from('teams')
      .select('id')
      .eq('team_members.user_id', userId)
      .eq('team_members.is_active', true)
    
    if (teams) {
      teams.forEach(team => {
        io.to(`team_${team.id}`).emit('user_status_changed', {
          userId,
          status,
          timestamp: new Date().toISOString()
        })
      })
    }
  } catch (error) {
    console.error('Error broadcasting user status:', error)
  }
}

async function handleMentionNotifications(message: any, channelId: string) {
  try {
    // Extract mentions from message content (simple @username pattern)
    const mentions = message.content.match(/@(\w+)/g)
    
    if (mentions) {
      for (const mention of mentions) {
        const email = mention.substring(1) // Remove @
        
        // Find user by email
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', email)
          .single()
        
        if (user) {
          // Create mention notification
          await supabaseAdmin
            .from('notifications')
            .insert([{
              user_id: user.id,
              type: 'mention',
              title: 'You were mentioned',
              content: `${message.sender.first_name} ${message.sender.last_name} mentioned you in a message`,
              data: { messageId: message.id, channelId }
            }])
          
          // Send real-time notification
          const userSocket = activeConnections.get(user.id)
          if (userSocket) {
            userSocket.emit('notification', {
              type: 'mention',
              title: 'You were mentioned',
              content: `${message.sender.first_name} mentioned you`,
              data: { messageId: message.id, channelId }
            })
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling mention notifications:', error)
  }
}

export { activeConnections }