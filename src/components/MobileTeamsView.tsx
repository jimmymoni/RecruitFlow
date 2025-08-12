import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import {
  ArrowLeft, Menu, Search, Plus, Send, Smile, Paperclip, Mic,
  MoreVertical, Users, Hash, Bot, Zap, Bell, Settings, Phone,
  Video, Star, CheckCircle, AlertCircle, Clock, TrendingUp,
  MessageSquare, X, ChevronDown, Sparkles, Activity
} from 'lucide-react'
import { useSwipeGestures, useLongPress, usePullToRefresh, useDeviceDetection } from '../hooks/useSwipeGestures'

interface ChatThread {
  id: string
  name: string
  type: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  ai_enabled?: boolean
  last_activity?: string
  unread_count?: number
  chat_messages: Array<{
    id: string
    content: string
    sender_name: string
    sender_role: string
    created_at: string
    message_type?: 'text' | 'ai_insight' | 'workflow' | 'system'
    ai_data?: any
  }>
}

interface TeamMember {
  id: string
  name: string
  role: string
  status: 'online' | 'away' | 'busy' | 'offline'
  avatar?: string
  current_activity?: string
}

type MobileView = 'threads' | 'chat' | 'members' | 'profile'

const MobileTeamsView: React.FC = () => {
  const [currentView, setCurrentView] = useState<MobileView>('threads')
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null)
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)

  const deviceInfo = useDeviceDetection()

  // Pull to refresh functionality
  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Reload threads or messages
    loadChatData()
  }

  const { pullToRefreshHandlers, isPulling, pullDistance, isRefreshing, shouldShowRefresh } = 
    usePullToRefresh({
      onRefresh: handleRefresh,
      threshold: 80,
      distanceToRefresh: 120
    })

  // Swipe navigation between views
  const { swipeHandlers } = useSwipeGestures({
    onSwipeLeft: () => {
      if (currentView === 'threads') setCurrentView('chat')
      else if (currentView === 'chat') setCurrentView('members')
    },
    onSwipeRight: () => {
      if (currentView === 'members') setCurrentView('chat')
      else if (currentView === 'chat') setCurrentView('threads')
    },
    threshold: 50
  })

  // Long press for message options
  const { longPressHandlers } = useLongPress({
    onLongPress: () => {
      // Show message context menu
      console.log('Long press detected')
    },
    duration: 400
  })

  const loadChatData = async () => {
    // Mock data for mobile demo
    const mockThreads: ChatThread[] = [
      {
        id: '1',
        name: 'AI-Hiring-Pipeline',
        type: 'ai_workflow',
        description: 'AI-powered candidate screening',
        priority: 'high',
        ai_enabled: true,
        last_activity: new Date().toISOString(),
        unread_count: 5,
        chat_messages: [
          {
            id: '1',
            content: '🤖 AI found 3 perfect candidates for Senior Developer role with 95%+ match score.',
            sender_name: 'RecruitFlow AI',
            sender_role: 'ai',
            created_at: new Date(Date.now() - 300000).toISOString(),
            message_type: 'ai_insight'
          },
          {
            id: '2',
            content: 'Excellent! Let\'s review them in our next meeting.',
            sender_name: 'Sarah Johnson',
            sender_role: 'manager',
            created_at: new Date(Date.now() - 120000).toISOString(),
            message_type: 'text'
          }
        ]
      },
      {
        id: '2',
        name: 'urgent-hiring',
        type: 'urgent',
        description: 'Immediate hiring needs',
        priority: 'urgent',
        ai_enabled: false,
        last_activity: new Date(Date.now() - 1800000).toISOString(),
        unread_count: 2,
        chat_messages: [
          {
            id: '3',
            content: '🚨 Client needs Frontend Developer ASAP. Deadline: This Friday!',
            sender_name: 'Mike Davis',
            sender_role: 'recruiter',
            created_at: new Date(Date.now() - 1800000).toISOString(),
            message_type: 'text'
          }
        ]
      }
    ]

    const mockMembers: TeamMember[] = [
      {
        id: '1',
        name: 'You',
        role: 'Admin',
        status: 'online',
        current_activity: 'Reviewing candidates'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        role: 'Senior Recruiter',
        status: 'online',
        current_activity: 'Client call'
      },
      {
        id: '3',
        name: 'Mike Davis',
        role: 'Recruiter',
        status: 'away',
        current_activity: 'Interview'
      },
      {
        id: '4',
        name: 'RecruitFlow AI',
        role: 'AI Assistant',
        status: 'online',
        current_activity: 'Processing applications'
      }
    ]

    setThreads(mockThreads)
    setTeamMembers(mockMembers)
    if (!activeThread && mockThreads.length > 0) {
      setActiveThread(mockThreads[0])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadChatData()
  }, [])

  const sendMessage = () => {
    if (!newMessage.trim() || !activeThread) return
    
    const message = {
      id: Date.now().toString(),
      content: newMessage,
      sender_name: 'You',
      sender_role: 'admin',
      created_at: new Date().toISOString(),
      message_type: 'text' as const
    }

    setThreads(prev => prev.map(thread =>
      thread.id === activeThread.id
        ? { ...thread, chat_messages: [...thread.chat_messages, message] }
        : thread
    ))

    setActiveThread(prev => prev ? {
      ...prev,
      chat_messages: [...prev.chat_messages, message]
    } : null)

    setNewMessage('')
  }

  const handleThreadSelect = (thread: ChatThread) => {
    setActiveThread(thread)
    setCurrentView('chat')
  }

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      case 'offline': return 'bg-gray-500'
    }
  }

  const renderThreadsList = () => (
    <motion.div 
      initial={{ x: 0 }}
      animate={{ x: 0 }}
      className="h-full bg-gradient-to-b from-slate-800 to-slate-900"
      {...swipeHandlers}
      {...pullToRefreshHandlers}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Teams</h1>
            <p className="text-sm text-slate-400">{threads.length} conversations</p>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Pull to Refresh Indicator */}
      <AnimatePresence>
        {isPulling && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: pullDistance - 60 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center py-2"
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
              className={`w-6 h-6 ${shouldShowRefresh ? 'text-blue-400' : 'text-slate-500'}`}
            >
              <TrendingUp className="w-6 h-6" />
            </motion.div>
            <span className={`ml-2 text-sm ${shouldShowRefresh ? 'text-blue-400' : 'text-slate-500'}`}>
              {shouldShowRefresh ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto px-2 pb-20">
        {threads.map((thread) => (
          <motion.div
            key={thread.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleThreadSelect(thread)}
            className="p-4 mb-2 rounded-xl bg-slate-700/30 border border-slate-600/30 active:bg-slate-600/50 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {thread.ai_enabled ? (
                  <Bot className="w-5 h-5 text-green-400" />
                ) : thread.priority === 'urgent' ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <Hash className="w-5 h-5 text-slate-400" />
                )}
                <h3 className="font-semibold text-white">{thread.name}</h3>
              </div>
              {thread.unread_count && thread.unread_count > 0 && (
                <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center">
                  {thread.unread_count}
                </span>
              )}
            </div>
            
            {thread.description && (
              <p className="text-sm text-slate-400 mb-2">{thread.description}</p>
            )}
            
            {thread.chat_messages.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300 truncate flex-1 mr-2">
                  {thread.chat_messages[thread.chat_messages.length - 1].content}
                </p>
                <span className="text-xs text-slate-500">
                  {new Date(thread.last_activity || '').toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  const renderChatView = () => (
    <motion.div
      initial={{ x: deviceInfo.screenSize.width }}
      animate={{ x: 0 }}
      className="h-full bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col"
      {...swipeHandlers}
    >
      {/* Chat Header */}
      <div className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentView('threads')}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            {activeThread?.ai_enabled ? (
              <Bot className="w-6 h-6 text-green-400" />
            ) : (
              <Hash className="w-6 h-6 text-slate-400" />
            )}
            <div>
              <h2 className="font-semibold text-white">{activeThread?.name}</h2>
              {isTyping && (
                <p className="text-xs text-slate-400">AI is typing...</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <Phone className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <Video className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentView('members')}
              className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <Users className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
        {activeThread?.chat_messages.map((message, index) => {
          const isAI = message.sender_role === 'ai'
          const isOwn = message.sender_name === 'You'
          
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              {...longPressHandlers}
            >
              <div className={`max-w-[85%] ${
                isOwn 
                  ? 'bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl rounded-br-md' 
                  : isAI
                    ? 'bg-green-500/20 border border-green-500/30 text-green-100 rounded-r-2xl rounded-tl-2xl rounded-bl-md'
                    : 'bg-slate-700 text-white rounded-r-2xl rounded-tl-2xl rounded-bl-md'
              } p-3 shadow-lg`}>
                {!isOwn && (
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-xs font-medium opacity-75">{message.sender_name}</span>
                    {isAI && <Sparkles className="w-3 h-3" />}
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <span className="text-xs opacity-50">
                    {new Date(message.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {isOwn && <CheckCircle className="w-3 h-3 text-blue-300" />}
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 px-4"
            >
              <div className="flex space-x-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  className="w-2 h-2 bg-slate-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-2 h-2 bg-slate-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-2 h-2 bg-slate-400 rounded-full"
                />
              </div>
              <span className="text-xs text-slate-400">RecruitFlow AI is typing...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )

  const renderMembersView = () => (
    <motion.div
      initial={{ x: deviceInfo.screenSize.width }}
      animate={{ x: 0 }}
      className="h-full bg-gradient-to-b from-slate-800 to-slate-900"
      {...swipeHandlers}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentView('chat')}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h2 className="font-semibold text-white">Team Members</h2>
              <p className="text-sm text-slate-400">{teamMembers.filter(m => m.status === 'online').length} online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {teamMembers.map((member) => (
          <motion.div
            key={member.id}
            whileTap={{ scale: 0.98 }}
            className="flex items-center p-3 rounded-xl bg-slate-700/30 border border-slate-600/30 active:bg-slate-600/50 transition-all"
          >
            <div className="relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                member.role === 'AI Assistant' ? 'bg-green-600' :
                member.role === 'Admin' ? 'bg-blue-600' :
                member.role === 'Senior Recruiter' ? 'bg-purple-600' :
                'bg-orange-600'
              }`}>
                {member.role === 'AI Assistant' ? (
                  <Bot className="w-6 h-6" />
                ) : (
                  member.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-slate-800`} />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="font-semibold text-white">{member.name}</h3>
              <p className="text-sm text-slate-400">{member.role}</p>
              {member.current_activity && (
                <p className="text-xs text-slate-500 flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  {member.current_activity}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  const renderMessageInput = () => {
    if (currentView !== 'chat') return null

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50 p-4 safe-area-pb">
        <div className="flex items-center space-x-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="w-full bg-slate-700 border border-slate-600 rounded-full px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
            >
              <Smile className="w-5 h-5" />
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full transition-all ${
              newMessage.trim() 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-900 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {currentView === 'threads' && renderThreadsList()}
        {currentView === 'chat' && renderChatView()}
        {currentView === 'members' && renderMembersView()}
      </AnimatePresence>
      
      {renderMessageInput()}
    </div>
  )
}

export default MobileTeamsView