import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Command, Search, Zap, Calendar, User, Briefcase, Building2,
  MessageSquare, FileText, BarChart3, Settings, Plus, ArrowRight,
  Clock, Target, Lightbulb, Bot, Workflow, TrendingUp, Users,
  Mail, Phone, Video, Star, AlertCircle, CheckCircle, X
} from 'lucide-react'

interface WorkflowCommand {
  id: string
  title: string
  description: string
  category: 'candidate' | 'job' | 'client' | 'ai' | 'communication' | 'analytics' | 'system'
  icon: React.ElementType
  shortcut?: string
  action: () => void
  params?: string[]
}

interface WorkflowShortcutsProps {
  isOpen: boolean
  onClose: () => void
  onNavigate?: (section: string) => void
  onTriggerAI?: (type: string) => void
}

const WorkflowShortcuts: React.FC<WorkflowShortcutsProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onTriggerAI
}) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: WorkflowCommand[] = [
    // Candidate Commands
    {
      id: 'add-candidate',
      title: 'Add New Candidate',
      description: 'Create a new candidate profile',
      category: 'candidate',
      icon: User,
      shortcut: '⌘+N',
      action: () => console.log('Add candidate')
    },
    {
      id: 'search-candidates',
      title: 'Search Candidates',
      description: 'Find candidates by name, skills, or location',
      category: 'candidate',
      icon: Search,
      shortcut: '⌘+F',
      action: () => console.log('Search candidates')
    },
    {
      id: 'ai-screen-candidates',
      title: 'AI Screen Candidates',
      description: 'Use AI to automatically screen new applications',
      category: 'ai',
      icon: Bot,
      shortcut: '⌘+A',
      action: () => onTriggerAI?.('candidate-screening')
    },
    {
      id: 'bulk-email-candidates',
      title: 'Bulk Email Candidates',
      description: 'Send personalized emails to multiple candidates',
      category: 'communication',
      icon: Mail,
      action: () => console.log('Bulk email')
    },

    // Job Commands
    {
      id: 'create-job',
      title: 'Create New Job',
      description: 'Post a new job opening',
      category: 'job',
      icon: Briefcase,
      shortcut: '⌘+J',
      action: () => console.log('Create job')
    },
    {
      id: 'ai-job-description',
      title: 'AI Generate Job Description',
      description: 'Let AI create optimized job descriptions',
      category: 'ai',
      icon: Lightbulb,
      action: () => onTriggerAI?.('job-description')
    },
    {
      id: 'copy-job',
      title: 'Duplicate Job Posting',
      description: 'Create a copy of an existing job',
      category: 'job',
      icon: Plus,
      action: () => console.log('Copy job')
    },

    // Client Commands
    {
      id: 'add-client',
      title: 'Add New Client',
      description: 'Create a new client company profile',
      category: 'client',
      icon: Building2,
      shortcut: '⌘+C',
      action: () => console.log('Add client')
    },
    {
      id: 'schedule-client-meeting',
      title: 'Schedule Client Meeting',
      description: 'Set up a meeting with client',
      category: 'communication',
      icon: Calendar,
      action: () => console.log('Schedule meeting')
    },
    {
      id: 'client-report',
      title: 'Generate Client Report',
      description: 'Create progress report for client',
      category: 'analytics',
      icon: BarChart3,
      action: () => console.log('Generate report')
    },

    // AI & Analytics Commands
    {
      id: 'ai-insights',
      title: 'Get AI Insights',
      description: 'View AI-powered recommendations and insights',
      category: 'ai',
      icon: Zap,
      shortcut: '⌘+I',
      action: () => onTriggerAI?.('insights')
    },
    {
      id: 'ai-candidate-match',
      title: 'AI Candidate Matching',
      description: 'Find best candidate matches for open positions',
      category: 'ai',
      icon: Target,
      action: () => onTriggerAI?.('candidate-matching')
    },
    {
      id: 'workflow-automation',
      title: 'Setup Automation',
      description: 'Configure automated workflows',
      category: 'system',
      icon: Workflow,
      action: () => onNavigate?.('automation')
    },
    {
      id: 'analytics-dashboard',
      title: 'View Analytics',
      description: 'Open comprehensive analytics dashboard',
      category: 'analytics',
      icon: TrendingUp,
      shortcut: '⌘+D',
      action: () => onNavigate?.('analytics')
    },

    // Communication Commands
    {
      id: 'start-video-call',
      title: 'Start Video Interview',
      description: 'Begin video interview with candidate',
      category: 'communication',
      icon: Video,
      action: () => console.log('Start video call')
    },
    {
      id: 'send-offer-letter',
      title: 'Send Offer Letter',
      description: 'Generate and send job offer',
      category: 'communication',
      icon: FileText,
      action: () => console.log('Send offer')
    },
    {
      id: 'follow-up-reminder',
      title: 'Set Follow-up Reminder',
      description: 'Schedule reminder for candidate follow-up',
      category: 'communication',
      icon: Clock,
      action: () => console.log('Set reminder')
    },

    // System Commands
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Export candidates, jobs, or reports',
      category: 'system',
      icon: FileText,
      action: () => console.log('Export data')
    },
    {
      id: 'system-settings',
      title: 'Open Settings',
      description: 'Configure system preferences',
      category: 'system',
      icon: Settings,
      shortcut: '⌘+,',
      action: () => onNavigate?.('settings')
    },
    {
      id: 'team-chat',
      title: 'Open Teams Chat',
      description: 'Go to team collaboration platform',
      category: 'communication',
      icon: MessageSquare,
      shortcut: '⌘+T',
      action: () => onNavigate?.('teams')
    }
  ]

  const categories = {
    candidate: { icon: User, label: 'Candidates', color: 'text-blue-400' },
    job: { icon: Briefcase, label: 'Jobs', color: 'text-green-400' },
    client: { icon: Building2, label: 'Clients', color: 'text-purple-400' },
    ai: { icon: Bot, label: 'AI Tools', color: 'text-orange-400' },
    communication: { icon: MessageSquare, label: 'Communication', color: 'text-cyan-400' },
    analytics: { icon: BarChart3, label: 'Analytics', color: 'text-pink-400' },
    system: { icon: Settings, label: 'System', color: 'text-gray-400' }
  }

  const filteredCommands = commands.filter(command => {
    const matchesQuery = query === '' || 
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase()) ||
      command.category.toLowerCase().includes(query.toLowerCase())
    
    const matchesCategory = !activeCategory || command.category === activeCategory
    
    return matchesQuery && matchesCategory
  })

  const executeCommand = (command: WorkflowCommand) => {
    command.action()
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      if (activeCategory) {
        setActiveCategory(null)
      } else {
        onClose()
      }
    }
  }

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query, activeCategory])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-600/50 shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center p-4 border-b border-slate-700/50">
          <Command className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none text-lg"
          />
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded font-mono">
              Esc
            </kbd>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories */}
        {!query && !activeCategory && (
          <div className="p-4 border-b border-slate-700/50">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
              Categories
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(categories).map(([key, category]) => {
                const Icon = category.icon
                return (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveCategory(key)}
                    className="flex flex-col items-center p-3 rounded-lg border border-slate-700/50 hover:border-slate-600 hover:bg-slate-700/30 transition-all"
                  >
                    <Icon className={`w-5 h-5 mb-2 ${category.color}`} />
                    <span className="text-xs text-slate-300">{category.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence mode="wait">
            {filteredCommands.length > 0 ? (
              <div className="p-2">
                {activeCategory && (
                  <div className="flex items-center px-3 py-2 mb-2">
                    <button
                      onClick={() => setActiveCategory(null)}
                      className="flex items-center text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      ← Back to all categories
                    </button>
                  </div>
                )}
                {filteredCommands.map((command, index) => {
                  const Icon = command.icon
                  const isSelected = index === selectedIndex
                  
                  return (
                    <motion.div
                      key={command.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => executeCommand(command)}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-500/20 border border-blue-500/30' 
                          : 'hover:bg-slate-700/30'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                        isSelected ? 'bg-blue-500/30' : 'bg-slate-700/50'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isSelected ? 'text-blue-400' : categories[command.category]?.color || 'text-slate-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-medium ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {command.title}
                          </h3>
                          {command.shortcut && (
                            <kbd className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded font-mono">
                              {command.shortcut}
                            </kbd>
                          )}
                        </div>
                        <p className={`text-sm ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                          {command.description}
                        </p>
                      </div>
                      {isSelected && (
                        <ArrowRight className="w-4 h-4 text-blue-400 ml-2" />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-slate-400"
              >
                <Search className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium mb-1">No commands found</p>
                <p className="text-sm">Try a different search term</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <div className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">Enter</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default WorkflowShortcuts