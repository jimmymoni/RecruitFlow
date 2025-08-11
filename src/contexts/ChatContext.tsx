import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useUser } from './UserContext'

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  content: string
  type: 'text' | 'command' | 'system' | 'file'
  timestamp: string
  editedAt?: string
  replyToId?: string
  commandResult?: any
  richPreview?: any
  fileUrl?: string
  reactions: Array<{
    emoji: string
    count: number
    users: string[]
  }>
}

interface ChatThread {
  id: string
  name: string
  type: 'main' | 'group' | 'direct'
  description?: string
  isPinned: boolean
  participants: number
  unreadCount: number
  lastMessage: string
  lastActivity: string
  createdAt: string
  updatedAt: string
}

interface UserPresence {
  userId: string
  userName: string
  status: 'online' | 'away' | 'busy' | 'offline'
  isTyping: boolean
  typingThreadId?: string
  lastSeen: string
}

interface TypingUser {
  userId: string
  userName: string
  threadId: string
}

interface ChatContextType {
  // Connection state
  isConnected: boolean
  socket: Socket | null
  
  // Chat data
  threads: ChatThread[]
  messages: { [threadId: string]: ChatMessage[] }
  activeThread: ChatThread | null
  
  // User presence
  userPresence: { [userId: string]: UserPresence }
  typingUsers: TypingUser[]
  
  // Actions
  setActiveThread: (thread: ChatThread) => void
  sendMessage: (threadId: string, content: string, type?: string) => Promise<void>
  joinThread: (threadId: string) => void
  leaveThread: (threadId: string) => void
  startTyping: (threadId: string) => void
  stopTyping: (threadId: string) => void
  addReaction: (messageId: string, emoji: string) => Promise<void>
  updateUserStatus: (status: 'online' | 'away' | 'busy') => void
  
  // Loading states
  isLoadingThreads: boolean
  isLoadingMessages: { [threadId: string]: boolean }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: ReactNode
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user, token, isAuthenticated } = useUser()
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  
  // Chat data
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [messages, setMessages] = useState<{ [threadId: string]: ChatMessage[] }>({})
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null)
  
  // User presence
  const [userPresence, setUserPresence] = useState<{ [userId: string]: UserPresence }>({})
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  
  // Loading states
  const [isLoadingThreads, setIsLoadingThreads] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState<{ [threadId: string]: boolean }>({})

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !token || !user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    console.log('🔌 Connecting to chat socket...')
    
    const newSocket = io('http://localhost:3003', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('✅ Chat socket connected')
      setIsConnected(true)
      initializeChat().then(() => loadThreads())
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Chat socket disconnected')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ Chat socket connection error:', error)
      setIsConnected(false)
      
      // Fallback: Load data via HTTP API when Socket.IO fails
      console.log('⚡ Loading chat data via HTTP API fallback...')
      initializeChat().then(() => loadThreads())
    })

    // Real-time message handling
    newSocket.on('new-message', ({ threadId, message }: { threadId: string, message: ChatMessage }) => {
      setMessages(prev => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), message]
      }))
      
      // Update thread's last activity
      setThreads(prev => prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, lastMessage: message.content, lastActivity: message.timestamp }
          : thread
      ))
    })

    // Typing indicators
    newSocket.on('user-typing', ({ userId, userName, threadId }: TypingUser) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => !(u.userId === userId && u.threadId === threadId))
        return [...filtered, { userId, userName, threadId }]
      })
    })

    newSocket.on('user-stopped-typing', ({ userId, threadId }: { userId: string, threadId: string }) => {
      setTypingUsers(prev => prev.filter(u => !(u.userId === userId && u.threadId === threadId)))
    })

    // User presence updates
    newSocket.on('user-status-changed', ({ userId, userName, status }: { userId: string, userName: string, status: string }) => {
      setUserPresence(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          userId,
          userName,
          status: status as any,
          lastSeen: new Date().toISOString()
        }
      }))
    })

    // Reaction updates
    newSocket.on('new-reaction', ({ messageId, emoji, userId }: { messageId: string, emoji: string, userId: string }) => {
      setMessages(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(threadId => {
          updated[threadId] = updated[threadId].map(message => {
            if (message.id === messageId) {
              const reactions = [...message.reactions]
              const existingReaction = reactions.find(r => r.emoji === emoji)
              if (existingReaction) {
                if (!existingReaction.users.includes(userId)) {
                  existingReaction.count++
                  existingReaction.users.push(userId)
                }
              } else {
                reactions.push({ emoji, count: 1, users: [userId] })
              }
              return { ...message, reactions }
            }
            return message
          })
        })
        return updated
      })
    })

    setSocket(newSocket)

    // Also try to load data immediately via HTTP API (don't wait for socket)
    setTimeout(() => {
      console.log('⚡ Loading chat data immediately via HTTP API...')
      initializeChat().then(() => loadThreads())
    }, 1000)

    // And try again after another delay for double safety
    setTimeout(() => {
      console.log('🔄 Second attempt to load chat data...')
      loadThreads()
    }, 3000)

    return () => {
      newSocket.disconnect()
    }
  }, [isAuthenticated, token, user])

  // Initialize chat with default threads and data
  const initializeChat = async () => {
    if (!token) return
    
    try {
      const response = await fetch('http://localhost:3003/api/chat/init', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        console.log('✅ Chat initialized successfully')
      } else {
        console.warn('⚠️ Chat initialization failed, but continuing...')
      }
    } catch (error) {
      console.error('Error initializing chat:', error)
    }
  }

  // Load chat threads from API
  const loadThreads = async () => {
    console.log('🔄 loadThreads called, token:', !!token)
    if (!token) {
      console.log('❌ No token available, skipping loadThreads')
      return
    }
    
    console.log('📡 Making API call to load threads...')
    setIsLoadingThreads(true)
    try {
      const response = await fetch('http://localhost:3003/api/chat/threads', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📡 API response status:', response.status, response.statusText)
      
      if (response.ok) {
        const threadsData = await response.json()
        console.log('✅ Threads loaded successfully:', threadsData.length, 'threads')
        console.log('📋 Thread names:', threadsData.map(t => t.name))
        setThreads(threadsData)
        
        // Set first thread as active if none selected
        if (!activeThread && threadsData.length > 0) {
          console.log('🎯 Setting active thread to:', threadsData[0].name)
          setActiveThread(threadsData[0])
        }
      } else {
        console.error('❌ API response not OK:', response.status, await response.text())
      }
    } catch (error) {
      console.error('❌ Error loading threads:', error)
    } finally {
      setIsLoadingThreads(false)
      console.log('✅ loadThreads finished')
    }
  }

  // Load messages for a thread
  const loadMessages = async (threadId: string) => {
    if (!token) return
    
    setIsLoadingMessages(prev => ({ ...prev, [threadId]: true }))
    try {
      const response = await fetch(`http://localhost:3003/api/chat/threads/${threadId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const messagesData = await response.json()
        setMessages(prev => ({ ...prev, [threadId]: messagesData }))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoadingMessages(prev => ({ ...prev, [threadId]: false }))
    }
  }

  // Send message
  const sendMessage = async (threadId: string, content: string, type: string = 'text') => {
    if (!token || !content.trim()) return
    
    try {
      const response = await fetch(`http://localhost:3003/api/chat/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, type })
      })
      
      if (!response.ok) {
        console.error('Failed to send message')
      }
      // Message will be added via socket event
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Socket event handlers
  const joinThread = (threadId: string) => {
    if (socket) {
      socket.emit('join-thread', threadId)
      loadMessages(threadId)
    }
  }

  const leaveThread = (threadId: string) => {
    if (socket) {
      socket.emit('leave-thread', threadId)
    }
  }

  const startTyping = (threadId: string) => {
    if (socket) {
      socket.emit('typing-start', threadId)
    }
  }

  const stopTyping = (threadId: string) => {
    if (socket) {
      socket.emit('typing-stop', threadId)
    }
  }

  const addReaction = async (messageId: string, emoji: string) => {
    if (!token) return
    
    try {
      const response = await fetch(`http://localhost:3003/api/chat/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji })
      })
      
      if (!response.ok) {
        console.error('Failed to add reaction')
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  const updateUserStatus = (status: 'online' | 'away' | 'busy') => {
    if (socket) {
      socket.emit('status-change', status)
    }
  }

  // Handle active thread changes
  useEffect(() => {
    if (activeThread && socket) {
      joinThread(activeThread.id)
      
      return () => {
        leaveThread(activeThread.id)
      }
    }
  }, [activeThread, socket])

  const contextValue: ChatContextType = {
    // Connection state
    isConnected,
    socket,
    
    // Chat data
    threads,
    messages,
    activeThread,
    
    // User presence
    userPresence,
    typingUsers,
    
    // Actions
    setActiveThread,
    sendMessage,
    joinThread,
    leaveThread,
    startTyping,
    stopTyping,
    addReaction,
    updateUserStatus,
    
    // Loading states
    isLoadingThreads,
    isLoadingMessages
  }

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  )
}