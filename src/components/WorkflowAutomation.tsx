import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Play,
  Pause,
  Settings,
  Plus,
  Brain,
  Filter,
  Mail,
  Calendar,
  FileText,
  UserCheck,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  Lightbulb,
  Activity,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { mockAIUsageMetrics } from '../data/mockAI'

interface WorkflowStep {
  id: string
  name: string
  type: 'trigger' | 'condition' | 'action'
  icon: any
  description: string
  config: Record<string, any>
  isActive: boolean
}

interface Workflow {
  id: string
  name: string
  description: string
  isActive: boolean
  steps: WorkflowStep[]
  stats: {
    triggered: number
    completed: number
    timesSaved: number
  }
  lastRun: Date
}

const WorkflowAutomation = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'templates'>('overview')
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  // Mock workflow data
  const workflows: Workflow[] = [
    {
      id: 'auto-screening',
      name: 'Smart Resume Screening',
      description: 'Automatically screen and score incoming resumes using AI',
      isActive: true,
      steps: [
        {
          id: 'trigger-1',
          name: 'New Resume Uploaded',
          type: 'trigger',
          icon: FileText,
          description: 'When a new resume is uploaded to any job posting',
          config: {},
          isActive: true
        },
        {
          id: 'action-1',
          name: 'AI Parse Resume',
          type: 'action',
          icon: Brain,
          description: 'Extract candidate information using AI',
          config: { model: 'qwen-plus', confidence_threshold: 0.85 },
          isActive: true
        },
        {
          id: 'condition-1',
          name: 'Check AI Quality Score',
          type: 'condition',
          icon: Target,
          description: 'If AI quality score > 7.0',
          config: { threshold: 7.0 },
          isActive: true
        },
        {
          id: 'action-2',
          name: 'Auto-Advance to Screening',
          type: 'action',
          icon: ArrowRight,
          description: 'Move candidate to screening stage',
          config: {},
          isActive: true
        }
      ],
      stats: {
        triggered: 892,
        completed: 847,
        timesSaved: 178
      },
      lastRun: new Date('2024-08-10T10:30:00Z')
    },
    {
      id: 'ai-outreach',
      name: 'Personalized Candidate Outreach',
      description: 'Generate personalized emails based on candidate profiles',
      isActive: true,
      steps: [
        {
          id: 'trigger-2',
          name: 'Candidate Moves to Outreach',
          type: 'trigger',
          icon: UserCheck,
          description: 'When candidate reaches outreach stage',
          config: {},
          isActive: true
        },
        {
          id: 'action-3',
          name: 'AI Generate Email',
          type: 'action',
          icon: Brain,
          description: 'Create personalized outreach email',
          config: { model: 'qwen-plus', tone: 'professional' },
          isActive: true
        },
        {
          id: 'action-4',
          name: 'Schedule Send',
          type: 'action',
          icon: Mail,
          description: 'Queue email for optimal delivery time',
          config: { delay_hours: 2 },
          isActive: true
        }
      ],
      stats: {
        triggered: 234,
        completed: 221,
        timesSaved: 47
      },
      lastRun: new Date('2024-08-10T09:45:00Z')
    },
    {
      id: 'interview-scheduling',
      name: 'Intelligent Interview Scheduling',
      description: 'Auto-schedule interviews based on availability and preferences',
      isActive: false,
      steps: [
        {
          id: 'trigger-3',
          name: 'Interview Request',
          type: 'trigger',
          icon: Calendar,
          description: 'When recruiter requests interview scheduling',
          config: {},
          isActive: true
        },
        {
          id: 'action-5',
          name: 'AI Analyze Availability',
          type: 'action',
          icon: Brain,
          description: 'Find optimal time slots using AI',
          config: { model: 'baichuan2-13b' },
          isActive: true
        },
        {
          id: 'action-6',
          name: 'Send Calendar Invite',
          type: 'action',
          icon: Calendar,
          description: 'Create and send calendar invitations',
          config: {},
          isActive: true
        }
      ],
      stats: {
        triggered: 67,
        completed: 58,
        timesSaved: 23
      },
      lastRun: new Date('2024-08-09T16:20:00Z')
    }
  ]

  const workflowTemplates = [
    {
      id: 'template-1',
      name: 'Junior Developer Pipeline',
      description: 'Automated workflow for junior developer positions',
      icon: FileText,
      steps: 4,
      estimatedSavings: '12 hours/week'
    },
    {
      id: 'template-2',
      name: 'Executive Search Process',
      description: 'High-touch automation for senior positions',
      icon: Target,
      steps: 6,
      estimatedSavings: '8 hours/week'
    },
    {
      id: 'template-3',
      name: 'Bulk Screening Workflow',
      description: 'Mass screening for high-volume positions',
      icon: Filter,
      steps: 3,
      estimatedSavings: '25 hours/week'
    },
    {
      id: 'template-4',
      name: 'Follow-up Automation',
      description: 'Automated candidate follow-up sequences',
      icon: Mail,
      steps: 5,
      estimatedSavings: '6 hours/week'
    }
  ]

  const renderOverview = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Workflow Performance */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6 shadow-black/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Workflow Automation</h2>
              <p className="text-blue-400 font-medium">Intelligent recruitment processes</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-400">
              {workflows.reduce((total, w) => total + w.stats.timesSaved, 0)}h
            </p>
            <p className="text-white/70 text-sm">time saved this month</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">Active Workflows</p>
            <p className="text-2xl font-bold text-white">{workflows.filter(w => w.isActive).length}</p>
            <p className="text-green-400 text-xs">Running automatically</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">Tasks Automated</p>
            <p className="text-2xl font-bold text-white">{workflows.reduce((total, w) => total + w.stats.completed, 0)}</p>
            <p className="text-blue-400 text-xs">This month</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">Success Rate</p>
            <p className="text-2xl font-bold text-white">94.7%</p>
            <p className="text-purple-400 text-xs">High reliability</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">AI Accuracy</p>
            <p className="text-2xl font-bold text-white">{Math.round(mockAIUsageMetrics.successRate * 100)}%</p>
            <p className="text-orange-400 text-xs">Intelligent decisions</p>
          </div>
        </div>
      </motion.div>

      {/* Active Workflows */}
      <motion.div
        variants={itemVariants}
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-black/20 overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Active Workflows</h3>
              <p className="text-white/70">AI-powered automation processes</p>
            </div>
            <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Workflow</span>
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-white/10">
          {workflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => setSelectedWorkflow(workflow.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      workflow.isActive ? 'bg-green-500/20' : 'bg-gray-500/20'
                    }`}>
                      <Zap className={`h-5 w-5 ${
                        workflow.isActive ? 'text-green-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg">{workflow.name}</h4>
                      <p className="text-white/70">{workflow.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Activity className="h-4 w-4 text-blue-400" />
                        <span className="text-white/80 text-sm">Triggered</span>
                      </div>
                      <p className="text-white font-semibold">{workflow.stats.triggered}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-white/80 text-sm">Completed</span>
                      </div>
                      <p className="text-white font-semibold">{workflow.stats.completed}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="h-4 w-4 text-purple-400" />
                        <span className="text-white/80 text-sm">Time Saved</span>
                      </div>
                      <p className="text-white font-semibold">{workflow.stats.timesSaved}h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {workflow.isActive ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center space-x-1">
                        <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                        Paused
                      </span>
                    )}
                    <span className="text-white/50 text-xs">
                      Last run: {workflow.lastRun.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-6">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    {workflow.isActive ? (
                      <Pause className="h-4 w-4 text-orange-400" />
                    ) : (
                      <Play className="h-4 w-4 text-green-400" />
                    )}
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Settings className="h-4 w-4 text-white/60" />
                  </button>
                </div>
              </div>
              
              {/* Workflow Steps Preview */}
              <div className="mt-4 flex items-center space-x-2 overflow-x-auto pb-2">
                {workflow.steps.map((step, i) => (
                  <div key={step.id} className="flex items-center space-x-2 flex-shrink-0">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      step.type === 'trigger' ? 'bg-blue-500/20' :
                      step.type === 'condition' ? 'bg-yellow-500/20' :
                      'bg-green-500/20'
                    }`}>
                      <step.icon className={`h-4 w-4 ${
                        step.type === 'trigger' ? 'text-blue-400' :
                        step.type === 'condition' ? 'text-yellow-400' :
                        'text-green-400'
                      }`} />
                    </div>
                    {i < workflow.steps.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-white/40" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )

  const renderTemplates = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Template Gallery */}
      <motion.div
        variants={itemVariants}
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Workflow Templates</h3>
            <p className="text-white/70">Pre-built automation workflows ready to use</p>
          </div>
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            <span className="text-yellow-400 text-sm">AI-Optimized</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20 hover:shadow-glow transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <template.icon className="h-6 w-6 text-purple-400" />
                </div>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  {template.steps} steps
                </span>
              </div>
              
              <h4 className="text-white font-semibold mb-2">{template.name}</h4>
              <p className="text-white/70 text-sm mb-4">{template.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">{template.estimatedSavings}</span>
                </div>
                <button className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded hover:bg-purple-500/30 transition-colors">
                  Use Template
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Benefits */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6"
      >
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Brain className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-lg mb-2">Powered by Advanced AI</h4>
            <p className="text-white/70 mb-4">
              Our workflow automation uses cutting-edge AI models to make intelligent decisions, 
              ensuring high accuracy and reliability in your recruitment processes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-white/80 text-sm">Smart decision making</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-white/80 text-sm">Natural language processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-white/80 text-sm">Continuous learning</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-slate-900 to-gray-900 text-white">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-black/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Workflow Automation</h1>
                <p className="text-white/70">AI-powered recruitment workflows</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg">
                <span className="text-sm font-medium">Smart AI Engine Active</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-1 bg-black/20 backdrop-blur-xl border border-white/10 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'builder', label: 'Builder', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-glow'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'builder' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-black/20 text-center"
          >
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Settings className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white/70 mb-2">
                  Visual Workflow Builder
                </h3>
                <p className="text-white/50 mb-4">
                  Drag-and-drop workflow builder coming soon...
                </p>
                <button className="px-6 py-3 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                  Request Early Access
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default WorkflowAutomation