import React, { useState, useEffect } from 'react'
import { Hash, Users, Settings, Mic, Headphones, Plus, Search, Bell, Pin, UserPlus, Inbox, HelpCircle } from 'lucide-react'

interface ChatThread {
  id: string
  name: string
  type: string
  description?: string
  chat_messages: Array<{
    id: string
    content: string
    sender_name: string
    sender_role: string
    created_at: string
  }>
}

const WorkingDiscordStyle: React.FC = () => {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadChatData()
  }, [])

  const loadChatData = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const response = await fetch('http://localhost:3003/api/chat/threads', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Chat data loaded:', data)
        setThreads(data)
        if (data.length > 0) {
          setActiveThread(data[0])
        }
      }
    } catch (error) {
      console.error('❌ Error loading chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeThread || sending) return
    
    setSending(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const response = await fetch(`http://localhost:3003/api/chat/threads/${activeThread.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage,
          type: 'text'
        })
      })

      if (response.ok) {
        const messageData = await response.json()
        console.log('✅ Message sent:', messageData)
        
        // Add the new message to the current thread
        setThreads(prevThreads => 
          prevThreads.map(thread => 
            thread.id === activeThread.id 
              ? {
                  ...thread,
                  chat_messages: [...(thread.chat_messages || []), messageData.message]
                }
              : thread
          )
        )
        
        // Update active thread as well
        setActiveThread(prev => prev ? {
          ...prev,
          chat_messages: [...(prev.chat_messages || []), messageData.message]
        } : null)
        
        setNewMessage('')
      } else {
        console.error('❌ Failed to send message')
      }
    } catch (error) {
      console.error('❌ Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading Discord-style Chat...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-800 flex">
      {/* Discord Server List (Left) */}
      <div className="w-[72px] bg-gray-900 flex flex-col items-center py-3 space-y-2">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg hover:rounded-xl transition-all duration-200 cursor-pointer">
          RF
        </div>
        <div className="w-8 h-[2px] bg-gray-600 rounded-full"></div>
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white hover:rounded-xl transition-all duration-200 cursor-pointer">
          <Plus className="w-6 h-6" />
        </div>
      </div>

      {/* Discord Channels Sidebar */}
      <div className="w-60 bg-gray-700 flex flex-col">
        {/* Server Header */}
        <div className="h-12 border-b border-gray-800 flex items-center px-4 text-white font-semibold shadow-md hover:bg-gray-600 cursor-pointer">
          <span className="flex-1">RecruitFlow Teams</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Channels Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-2 py-4">
            <div className="flex items-center px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span>Text Channels</span>
            </div>
            
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setActiveThread(thread)}
                className={`w-full flex items-center px-2 py-1 mb-0.5 rounded text-left group transition-colors cursor-pointer ${
                  activeThread?.id === thread.id 
                    ? 'bg-gray-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-600 hover:text-gray-100'
                }`}
              >
                <Hash className="w-5 h-5 mr-1.5 text-gray-400" />
                <span className="flex-1 truncate">{thread.name.toLowerCase()}</span>
                {thread.chat_messages?.length > 0 && (
                  <span className="bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 ml-auto">
                    {thread.chat_messages.length}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Voice Channels */}
          <div className="px-2 py-2">
            <div className="flex items-center px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span>Voice Channels</span>
            </div>
            <div className="w-full flex items-center px-2 py-1 mb-0.5 rounded text-left text-gray-300 hover:bg-gray-600 hover:text-gray-100 cursor-pointer">
              <svg className="w-5 h-5 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776L4.616 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.616l3.767-3.776z" clipRule="evenodd" />
                <path d="M14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.414A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
              </svg>
              <span className="flex-1 truncate">General</span>
            </div>
          </div>
        </div>

        {/* User Panel */}
        <div className="h-[52px] bg-gray-800 flex items-center px-2">
          <div className="flex items-center flex-1">
            <div className="relative">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                TU
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
            <div className="ml-2 flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">Test User</div>
              <div className="text-gray-400 text-xs truncate">Online</div>
            </div>
          </div>
          <div className="flex space-x-1">
            <button className="text-gray-400 hover:text-gray-200 p-1">
              <Mic className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-gray-200 p-1">
              <Headphones className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-gray-200 p-1">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-600">
        {activeThread ? (
          <>
            {/* Chat Header */}
            <div className="h-12 border-b border-gray-800 flex items-center px-4 bg-gray-700 shadow-sm">
              <Hash className="w-6 h-6 text-gray-400 mr-2" />
              <span className="text-white font-semibold">{activeThread.name.toLowerCase()}</span>
              {activeThread.description && (
                <>
                  <div className="w-px h-6 bg-gray-600 mx-2"></div>
                  <span className="text-gray-300 text-sm">{activeThread.description}</span>
                </>
              )}
              <div className="ml-auto flex items-center space-x-4">
                <Bell className="w-5 h-5 text-gray-400 hover:text-gray-200 cursor-pointer" />
                <Pin className="w-5 h-5 text-gray-400 hover:text-gray-200 cursor-pointer" />
                <UserPlus className="w-5 h-5 text-gray-400 hover:text-gray-200 cursor-pointer" />
                <Search className="w-5 h-5 text-gray-400 hover:text-gray-200 cursor-pointer" />
                <Inbox className="w-5 h-5 text-gray-400 hover:text-gray-200 cursor-pointer" />
                <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-200 cursor-pointer" />
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeThread.chat_messages && activeThread.chat_messages.length > 0 ? (
                activeThread.chat_messages.map((message, index) => {
                  const isFirstFromSender = index === 0 || 
                    activeThread.chat_messages[index - 1].sender_name !== message.sender_name
                  
                  return (
                    <div key={message.id} className={`group hover:bg-gray-700/30 px-4 py-0.5 -mx-4 rounded ${isFirstFromSender ? 'mt-4' : 'mt-0'}`}>
                      <div className="flex items-start space-x-4">
                        {isFirstFromSender ? (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${
                            message.sender_role === 'admin' ? 'bg-red-600' :
                            message.sender_role === 'manager' ? 'bg-purple-600' :
                            'bg-blue-600'
                          }`}>
                            {message.sender_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center">
                            <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100">
                              {new Date(message.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {isFirstFromSender && (
                            <div className="flex items-baseline space-x-2 mb-1">
                              <span className="font-semibold text-white hover:underline cursor-pointer">
                                {message.sender_name}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded text-white ${
                                message.sender_role === 'admin' ? 'bg-red-600' :
                                message.sender_role === 'manager' ? 'bg-purple-600' :
                                'bg-blue-600'
                              }`}>
                                {message.sender_role}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.created_at).toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div className="text-gray-100 leading-relaxed break-words">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Hash className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-xl font-semibold mb-2">Welcome to #{activeThread.name.toLowerCase()}!</h3>
                    <p>This is the start of the #{activeThread.name.toLowerCase()} channel.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4">
              <div className="bg-gray-500 rounded-lg">
                <div className="flex items-center px-4 py-3">
                  <button className="text-gray-400 hover:text-gray-200 mr-3">
                    <Plus className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message #${activeThread.name.toLowerCase()}`}
                    className="flex-1 bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none"
                    disabled={sending}
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="ml-3 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold mb-2">Welcome to RecruitFlow Teams!</h3>
              <p>Select a channel to start collaborating with your team.</p>
            </div>
          </div>
        )}
      </div>

      {/* Members Sidebar */}
      <div className="w-60 bg-gray-700 border-l border-gray-800">
        <div className="p-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Online — 4
          </h3>
          <div className="space-y-1">
            {['Test User', 'Sarah Johnson', 'Mike Davis', 'Admin User'].map((name, index) => (
              <div key={index} className="flex items-center px-2 py-1 rounded hover:bg-gray-600 cursor-pointer group">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    index === 0 ? 'bg-blue-600' : 
                    index === 1 ? 'bg-purple-600' : 
                    index === 2 ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-700"></div>
                </div>
                <span className="ml-3 text-gray-300 text-sm group-hover:text-white">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkingDiscordStyle