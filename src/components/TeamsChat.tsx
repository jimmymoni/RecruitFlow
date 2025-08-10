import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Hash, 
  Users, 
  Search,
  Phone,
  Video,
  MoreVertical,
  Pin,
  Star,
  Reply,
  Edit,
  Trash2
} from 'lucide-react'
import { ChatMessage, ChatThread, TeamMember, SlashCommand } from '../types/team'
import { mockChatMessages, mockChatThreads, mockTeamMembers, mockSlashCommands } from '../data/mockTeam'

interface TeamsChatProps {
  currentUserId: string
}

const TeamsChat = ({ currentUserId }: TeamsChatProps) => {
  const [activeThread, setActiveThread] = useState<ChatThread>(mockChatThreads[0])
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showCommands, setShowCommands] = useState(false)
  const [commandFilter, setCommandFilter] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentUser = mockTeamMembers.find(m => m.id === currentUserId) || mockTeamMembers[0]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const isCommand = newMessage.startsWith('/')
    const messageType = isCommand ? 'command' : 'text'

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content: newMessage,
      type: messageType,
      timestamp: new Date(),
      reactions: []
    }

    // Handle slash commands
    if (isCommand) {
      const [command, ...args] = newMessage.slice(1).split(' ')
      const commandDef = mockSlashCommands.find(c => c.command === `/${command}`)
      
      if (commandDef) {
        // Simulate command execution
        message.commandResult = {
          success: true,
          message: `Command /${command} executed successfully`
        }
        
        // Add system response
        setTimeout(() => {
          const systemMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            senderId: 'system',
            senderName: 'RecruitFlow Bot',
            senderRole: 'admin',
            content: `✅ ${commandDef.description} completed`,
            type: 'system',
            timestamp: new Date(),
            reactions: []
          }
          setMessages(prev => [...prev, systemMessage])
        }, 500)
      }
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    setShowCommands(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)
    
    // Show command suggestions
    if (value.startsWith('/')) {
      setShowCommands(true)
      setCommandFilter(value.slice(1))
    } else {
      setShowCommands(false)
    }
  }

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'online': return 'bg-green-400'
      case 'away': return 'bg-yellow-400'
      case 'busy': return 'bg-red-400'
      case 'offline': return 'bg-gray-400'
    }
  }

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin': return 'text-purple-400'
      case 'senior_recruiter': return 'text-blue-400'
      case 'recruiter': return 'text-green-400'
      case 'coordinator': return 'text-orange-400'
      case 'sourcer': return 'text-cyan-400'
      case 'client_manager': return 'text-pink-400'
    }
  }

  const filteredCommands = mockSlashCommands.filter(cmd =>
    cmd.command.toLowerCase().includes(commandFilter.toLowerCase()) &&
    cmd.permissions.includes(currentUser.role)
  )

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-slate-900 to-gray-900 text-white flex">
      {/* Sidebar - Threads */}
      <div className="w-80 bg-black/30 backdrop-blur-xl border-r border-white/10 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-gradient-to-r from-neon-blue to-primary-500 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Teams</h1>
              <p className="text-white/70 text-sm">RecruitFlow Agency</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
              placeholder="Search conversations..."
            />
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {mockChatThreads.map((thread) => (
            <motion.div
              key={thread.id}
              whileHover={{ x: 4 }}
              onClick={() => setActiveThread(thread)}
              className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-200 ${
                activeThread.id === thread.id ? 'bg-white/10 border-l-2 border-l-neon-blue' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {thread.type === 'main' ? (
                    <Hash className="h-5 w-5 text-neon-blue" />
                  ) : thread.type === 'group' ? (
                    <Users className="h-5 w-5 text-green-400" />
                  ) : (
                    <div className="h-5 w-5 bg-purple-500 rounded-full" />
                  )}
                  {thread.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{thread.unreadCount}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium truncate">{thread.name}</p>
                    {thread.isPinned && <Pin className="h-3 w-3 text-yellow-400" />}
                  </div>
                  <p className="text-white/60 text-xs">
                    {thread.participants.length} members • {formatTime(thread.lastActivity)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Members */}
        <div className="p-4 border-t border-white/10">
          <h3 className="text-white/90 font-medium mb-3 text-sm">Team Members</h3>
          <div className="space-y-2">
            {mockTeamMembers.slice(0, 3).map((member) => (
              <div key={member.id} className="flex items-center space-x-2">
                <div className="relative">
                  <div className="h-6 w-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-xs">
                    {member.avatar}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${getStatusColor(member.status)} rounded-full border border-dark-800`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-xs font-medium truncate">{member.name}</p>
                  <p className={`text-xs ${getRoleColor(member.role)}`}>
                    {member.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ))}
            <button className="text-white/50 text-xs hover:text-white/70 transition-colors">
              +{mockTeamMembers.length - 3} more
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-black/30 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Hash className="h-5 w-5 text-neon-blue" />
              <div>
                <h2 className="text-white font-semibold">{activeThread.name}</h2>
                <p className="text-white/70 text-sm">{activeThread.participants.length} members</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Phone className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Video className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start space-x-3 group"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="h-8 w-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-sm">
                    {mockTeamMembers.find(m => m.id === message.senderId)?.avatar || '👤'}
                  </div>
                  {message.senderId !== 'system' && (
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${getStatusColor(mockTeamMembers.find(m => m.id === message.senderId)?.status || 'offline')} rounded-full border border-dark-800`} />
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-medium text-sm">{message.senderName}</span>
                    <span className={`text-xs ${getRoleColor(message.senderRole)}`}>
                      {message.senderRole.replace('_', ' ')}
                    </span>
                    <span className="text-white/50 text-xs">{formatTime(message.timestamp)}</span>
                  </div>

                  {/* Message Body */}
                  <div className={`${
                    message.type === 'system' 
                      ? 'bg-blue-500/10 border border-blue-500/20 rounded-lg p-3'
                      : message.type === 'command'
                      ? 'bg-purple-500/10 border border-purple-500/20 rounded-lg p-3'
                      : ''
                  }`}>
                    <p className={`text-white/90 ${message.type === 'system' ? 'text-sm' : ''}`}>
                      {message.content}
                    </p>

                    {/* Rich Preview */}
                    {message.richPreview && (
                      <div className="mt-3 bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="h-6 w-6 bg-neon-blue/20 rounded flex items-center justify-center">
                            <Users className="h-3 w-3 text-neon-blue" />
                          </div>
                          <span className="text-white/90 font-medium text-sm">
                            {message.richPreview.data.name}
                          </span>
                        </div>
                        <p className="text-white/70 text-xs">Senior React Developer • 6 years experience</p>
                        <div className="flex space-x-1 mt-2">
                          {['React', 'TypeScript', 'Node.js'].map(skill => (
                            <span key={skill} className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Command Result */}
                    {message.commandResult && (
                      <div className={`mt-2 text-xs ${
                        message.commandResult.success ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {message.commandResult.message}
                      </div>
                    )}
                  </div>

                  {/* Reactions */}
                  {message.reactions.length > 0 && (
                    <div className="flex space-x-1 mt-2">
                      {message.reactions.map((reaction) => (
                        <button
                          key={reaction.emoji}
                          className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 rounded-full px-2 py-1 transition-colors"
                        >
                          <span className="text-sm">{reaction.emoji}</span>
                          <span className="text-xs text-white/70">{reaction.users.length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                  <button className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                    <Reply className="h-3 w-3" />
                  </button>
                  <button className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                    <Smile className="h-3 w-3" />
                  </button>
                  {message.senderId === currentUser.id && (
                    <>
                      <button className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <Edit className="h-3 w-3" />
                      </button>
                      <button className="p-1 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Command Suggestions */}
        <AnimatePresence>
          {showCommands && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mx-4 mb-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-2 max-h-40 overflow-y-auto"
            >
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.command}
                  onClick={() => {
                    setNewMessage(cmd.command + ' ')
                    setShowCommands(false)
                    inputRef.current?.focus()
                  }}
                  className="w-full text-left p-2 hover:bg-white/10 rounded transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 font-medium text-sm">{cmd.command}</span>
                    <span className="text-white/50 text-xs">{cmd.category}</span>
                  </div>
                  <p className="text-white/70 text-xs">{cmd.description}</p>
                  <p className="text-white/50 text-xs font-mono">{cmd.usage}</p>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Input */}
        <div className="p-4 border-t border-white/10">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full pl-4 pr-24 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
              placeholder={`Message ${activeThread.name}... (Try typing /)`}
            />
            <div className="absolute right-2 top-2 flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Paperclip className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Smile className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-neon-blue hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send className="h-4 w-4 text-white" />
              </motion.button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-white/50 text-xs">Quick:</span>
            <button 
              onClick={() => setNewMessage('/assign-candidate ')}
              className="text-xs text-neon-blue hover:text-white transition-colors"
            >
              Assign
            </button>
            <button 
              onClick={() => setNewMessage('/schedule-interview ')}
              className="text-xs text-green-400 hover:text-white transition-colors"
            >
              Schedule
            </button>
            <button 
              onClick={() => setNewMessage('/update-status ')}
              className="text-xs text-orange-400 hover:text-white transition-colors"
            >
              Update
            </button>
            <button 
              onClick={() => setNewMessage('/share-candidate ')}
              className="text-xs text-purple-400 hover:text-white transition-colors"
            >
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Context Info */}
      <div className="w-80 bg-black/20 backdrop-blur-xl border-l border-white/10 p-4">
        <h3 className="text-white font-semibold mb-4">Thread Info</h3>
        
        {/* Thread Participants */}
        <div className="mb-6">
          <h4 className="text-white/80 text-sm font-medium mb-3">Participants ({activeThread.participants.length})</h4>
          <div className="space-y-2">
            {activeThread.participants.map((participantId) => {
              const member = mockTeamMembers.find(m => m.id === participantId)
              if (!member) return null
              
              return (
                <div key={participantId} className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <div className="relative">
                    <div className="h-8 w-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                      {member.avatar}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${getStatusColor(member.status)} rounded-full border border-dark-800`} />
                  </div>
                  <div>
                    <p className="text-white/90 text-sm font-medium">{member.name}</p>
                    <p className={`text-xs ${getRoleColor(member.role)}`}>
                      {member.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Available Commands */}
        <div>
          <h4 className="text-white/80 text-sm font-medium mb-3">Available Commands</h4>
          <div className="space-y-2">
            {mockSlashCommands
              .filter(cmd => cmd.permissions.includes(currentUser.role))
              .slice(0, 4)
              .map((cmd) => (
                <button
                  key={cmd.command}
                  onClick={() => setNewMessage(cmd.command + ' ')}
                  className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <p className="text-white/90 text-sm font-medium">{cmd.command}</p>
                  <p className="text-white/60 text-xs">{cmd.description}</p>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamsChat