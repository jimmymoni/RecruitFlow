import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTimeBasedTheme } from './hooks/useTimeBasedTheme'
import { 
  Users, 
  Briefcase, 
  Building2, 
  BarChart3, 
  Search,
  Plus,
  Bell,
  Settings,
  TrendingUp,
  Calendar,
  DollarSign,
  Home,
  FileText,
  MessageSquare,
  Zap,
  MoreHorizontal,
  ChevronDown,
  Brain,
  X,
  Mail,
  Phone,
  Globe,
  MapPin,
  Star,
  Eye,
  Edit
} from 'lucide-react'
import CandidatesList from './components/CandidatesList'
import CandidatesListAPI from './components/CandidatesListAPI'
import CandidateForm from './components/CandidateForm'
import JobsList from './components/JobsList'
import JobForm from './components/JobForm'
import ClientsList from './components/ClientsList'
import ClientForm from './components/ClientForm'
import TeamsChat from './components/TeamsChat'
import WorkingDiscordStyle from './components/WorkingDiscordStyle'
import TeamsSimple from './components/TeamsSimple'
import AICandidateReview from './components/AICandidateReview'
import WorkflowShortcuts from './components/WorkflowShortcuts'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import SmartIntegrations from './components/SmartIntegrations'
import AIDashboard from './components/AIDashboard'
import AIToolsTester from './components/AIToolsTester'
import WorkflowAutomation from './components/WorkflowAutomation'
import FileUpload from './components/FileUpload'
import DocumentViewer from './components/DocumentViewer'
import BackendStatus from './components/BackendStatus'
import AuthHeader from './components/AuthHeader'
import AuthSystem from './components/AuthSystem'
import ProtectedRoute from './components/ProtectedRoute'
import SearchOverlay from './components/SearchOverlay'
import { useUser } from './contexts/UserContext'
import { Candidate, CandidateFormData } from './types/candidate'
import { Job, JobFormData } from './types/job'
import { Client, ClientFormData } from './types/client'
import { Document, DocumentUpload } from './types/document'
import { mockCandidates } from './data/mockCandidates'
import { mockJobs } from './data/mockJobs'
import { mockClients, mockClientInteractions } from './data/mockClients'
import { mockDocuments } from './data/mockDocuments'
import { useDashboardStats } from './hooks/useDashboardStats'

// Mock data
const mockStats = {
  activeCandidates: 127,
  openJobs: 18,
  clientsMeeting: 3,
  monthlyPlacements: 12,
  revenue: 48500,
  avgTimeToFill: 21
}

const recentActivity = [
  { id: 1, type: 'candidate', message: 'Sarah Johnson applied for Senior Developer', time: '2 hours ago' },
  { id: 2, type: 'job', message: 'New job posted: Marketing Manager at TechCorp', time: '4 hours ago' },
  { id: 3, type: 'placement', message: 'Placement confirmed: John Doe → Frontend Lead', time: '1 day ago' },
  { id: 4, type: 'meeting', message: 'Client meeting scheduled with StartupXYZ', time: '2 days ago' },
]

function App() {
  const { theme, timePeriod } = useTimeBasedTheme()
  const dashboardStats = useDashboardStats()
  const { user, isLoading } = useUser()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showCandidateForm, setShowCandidateForm] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | undefined>()
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates)
  const [jobs, setJobs] = useState<Job[]>(mockJobs)
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | undefined>()
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [showClientForm, setShowClientForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | undefined>()
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)
  const [showSearchOverlay, setShowSearchOverlay] = useState(false)
  const [showWorkflowShortcuts, setShowWorkflowShortcuts] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside and handle keyboard shortcuts
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMoreDropdown(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Command/Ctrl + K for workflow shortcuts
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setShowWorkflowShortcuts(true)
      }
      // Command/Ctrl + / for search
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault()
        setShowSearchOverlay(true)
      }
      // Escape to close any open overlays
      if (event.key === 'Escape') {
        setShowWorkflowShortcuts(false)
        setShowSearchOverlay(false)
        setShowMoreDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSaveCandidate = (data: CandidateFormData) => {
    if (editingCandidate) {
      // Update existing candidate
      setCandidates(prev => prev.map(c => 
        c.id === editingCandidate.id 
          ? { ...data, id: editingCandidate.id, createdAt: editingCandidate.createdAt, updatedAt: new Date() }
          : c
      ))
    } else {
      // Add new candidate
      const newCandidate: Candidate = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setCandidates(prev => [newCandidate, ...prev])
    }
    setShowCandidateForm(false)
    setEditingCandidate(undefined)
  }

  const handleCancelForm = () => {
    setShowCandidateForm(false)
    setEditingCandidate(undefined)
  }

  const handleSaveJob = (data: JobFormData) => {
    if (editingJob) {
      setJobs(prev => prev.map(j => 
        j.id === editingJob.id 
          ? { 
              ...data, 
              id: editingJob.id, 
              postedAt: editingJob.postedAt, 
              updatedAt: new Date(),
              applicationsCount: editingJob.applicationsCount,
              viewsCount: editingJob.viewsCount,
              status: editingJob.status,
              createdBy: editingJob.createdBy
            }
          : j
      ))
    } else {
      const newJob: Job = {
        ...data,
        id: Date.now().toString(),
        postedAt: new Date(),
        updatedAt: new Date(),
        applicationsCount: 0,
        viewsCount: 0,
        status: 'draft',
        createdBy: 'John Recruiter'
      }
      setJobs(prev => [newJob, ...prev])
    }
    setShowJobForm(false)
    setEditingJob(undefined)
  }

  const handleCancelJobForm = () => {
    setShowJobForm(false)
    setEditingJob(undefined)
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setShowJobForm(true)
  }

  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId))
  }

  const handleSaveClient = (data: ClientFormData) => {
    if (editingClient) {
      setClients(prev => prev.map(c => 
        c.id === editingClient.id 
          ? { 
              ...data, 
              id: editingClient.id, 
              createdAt: editingClient.createdAt, 
              updatedAt: new Date(),
              status: editingClient.status,
              totalJobsPosted: editingClient.totalJobsPosted,
              totalPlacements: editingClient.totalPlacements,
              satisfactionRating: editingClient.satisfactionRating,
              createdBy: editingClient.createdBy
            }
          : c
      ))
    } else {
      const newClient: Client = {
        ...data,
        id: Date.now().toString(),
        status: 'prospective',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalJobsPosted: 0,
        totalPlacements: 0,
        createdBy: 'John Recruiter'
      }
      setClients(prev => [newClient, ...prev])
    }
    setShowClientForm(false)
    setEditingClient(undefined)
  }

  const handleCancelClientForm = () => {
    setShowClientForm(false)
    setEditingClient(undefined)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setShowClientForm(true)
  }

  const handleDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId))
  }

  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
  }

  // Document upload handlers
  const handleDocumentUpload = (uploads: DocumentUpload[]) => {
    const newDocuments: Document[] = uploads.map(upload => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      fileName: upload.file.name,
      originalName: upload.file.name,
      fileType: upload.file.name.split('.').pop()?.toLowerCase() as Document['fileType'],
      fileSize: upload.file.size,
      url: URL.createObjectURL(upload.file), // Temporary URL for demo
      uploadedAt: new Date(),
      uploadedBy: 'John Recruiter',
      associatedWith: upload.associatedWith || {},
      category: upload.category || 'other',
      tags: upload.tags || [],
      isPublic: upload.isPublic || false,
      description: upload.description,
      version: 1,
      status: 'ready'
    }))
    
    setDocuments(prev => [...newDocuments, ...prev])
  }

  // Primary navigation - most used items
  const primaryNavigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'teams', label: 'Teams', icon: MessageSquare },
  ]

  // Secondary navigation - tools and utilities
  const secondaryNavigation = [
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'ai', label: 'AI Tools', icon: Brain },
    { id: 'ai-review', label: 'AI Review', icon: Zap },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
  ]


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

  // Dashboard content
  const renderDashboard = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className={`text-3xl font-bold ${theme.textPrimary} mb-2 transition-colors duration-[5000ms] ease-in-out`}>
          Good {timePeriod === 'morning' || timePeriod === 'dawn' ? 'morning' : 
                timePeriod === 'afternoon' ? 'afternoon' : 
                timePeriod === 'evening' ? 'evening' : 'evening'}! 👋
        </h2>
        <p className={`${theme.textSecondary} text-lg transition-colors duration-[5000ms] ease-in-out`}>
          Here's what's happening with your recruitment pipeline today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`${theme.cardBackground} p-6 rounded-xl ${theme.glow} ${theme.border} hover:border-blue-400/50 backdrop-blur-sm cursor-pointer transition-all duration-[5000ms] ease-in-out`}
          onClick={() => setActiveTab('candidates')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme.textSecondary} transition-colors duration-[5000ms] ease-in-out`}>Active Candidates</p>
              <p className={`text-3xl font-bold ${theme.textPrimary} mt-2 transition-colors duration-[5000ms] ease-in-out`}>
                {dashboardStats.loading ? '...' : dashboardStats.activeCandidates}
              </p>
              <p className="text-sm mt-1 transition-colors duration-[5000ms] ease-in-out">
                {dashboardStats.error ? (
                  <span className="text-red-400">API Error</span>
                ) : dashboardStats.loading ? (
                  <span className="text-blue-400">Loading...</span>
                ) : (
                  <span className="text-green-600">Live Data</span>
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-neon-blue/20 to-primary-600/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Users className="h-6 w-6 text-neon-blue" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`${theme.cardBackground} p-6 rounded-xl ${theme.glow} ${theme.border} hover:border-orange-400/50 backdrop-blur-sm cursor-pointer transition-all duration-[5000ms] ease-in-out`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme.textSecondary} transition-colors duration-[5000ms] ease-in-out`}>Open Jobs</p>
              <p className={`text-3xl font-bold ${theme.textPrimary} mt-2 transition-colors duration-[5000ms] ease-in-out`}>{mockStats.openJobs}</p>
              <p className="text-sm text-orange-600 mt-1 transition-colors duration-[5000ms] ease-in-out">3 urgent</p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-accent-500/20 to-accent-600/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Briefcase className="h-6 w-6 text-accent-500" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`${theme.cardBackground} p-6 rounded-xl ${theme.glow} ${theme.border} hover:border-green-400/50 backdrop-blur-sm transition-all duration-[5000ms] ease-in-out`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme.textSecondary} transition-colors duration-[5000ms] ease-in-out`}>This Month</p>
              <p className={`text-3xl font-bold ${theme.textPrimary} mt-2 transition-colors duration-[5000ms] ease-in-out`}>{mockStats.monthlyPlacements}</p>
              <p className="text-sm text-green-600 mt-1 transition-colors duration-[5000ms] ease-in-out">placements</p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-neon-green/20 to-green-600/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="h-6 w-6 text-neon-green" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`${theme.cardBackground} p-6 rounded-xl ${theme.glow} ${theme.border} hover:border-purple-400/50 backdrop-blur-sm transition-all duration-[5000ms] ease-in-out`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme.textSecondary} transition-colors duration-[5000ms] ease-in-out`}>Revenue</p>
              <p className={`text-3xl font-bold ${theme.textPrimary} mt-2 transition-colors duration-[5000ms] ease-in-out`}>${mockStats.revenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1 transition-colors duration-[5000ms] ease-in-out">+8% from last month</p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-neon-purple/20 to-purple-600/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <DollarSign className="h-6 w-6 text-neon-purple" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Quick Actions */}
          <motion.div 
            whileHover={{ y: -2 }}
            className={`${theme.cardBackground} rounded-xl ${theme.glow} ${theme.border} p-6 mb-6 backdrop-blur-sm transition-all duration-[5000ms] ease-in-out`}
          >
            <h3 className={`text-lg font-semibold ${theme.textPrimary} mb-4 transition-colors duration-[5000ms] ease-in-out`}>Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCandidateForm(true)}
                className="flex flex-col items-center p-4 border-2 border-dashed border-dark-500 rounded-lg hover:border-neon-blue hover:bg-dark-600/50 hover:shadow-glow transition-all duration-300"
              >
                <Plus className="h-6 w-6 text-dark-300 mb-2" />
                <span className="text-sm font-medium text-dark-100">Add Candidate</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowJobForm(true)}
                className="flex flex-col items-center p-4 border-2 border-dashed border-dark-500 rounded-lg hover:border-accent-500 hover:bg-dark-600/50 hover:shadow-accent-glow transition-all duration-300"
              >
                <Briefcase className="h-6 w-6 text-dark-300 mb-2" />
                <span className="text-sm font-medium text-dark-100">Post Job</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowClientForm(true)}
                className="flex flex-col items-center p-4 border-2 border-dashed border-dark-500 rounded-lg hover:border-neon-green hover:bg-dark-600/50 hover:shadow-glow transition-all duration-300"
              >
                <Building2 className="h-6 w-6 text-dark-300 mb-2" />
                <span className="text-sm font-medium text-dark-100">Add Client</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('reports')}
                className="flex flex-col items-center p-4 border-2 border-dashed border-dark-500 rounded-lg hover:border-neon-purple hover:bg-dark-600/50 hover:shadow-glow transition-all duration-300"
              >
                <BarChart3 className="h-6 w-6 text-dark-300 mb-2" />
                <span className="text-sm font-medium text-dark-100">View Reports</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Pipeline Overview */}
          <motion.div 
            whileHover={{ y: -2 }}
            className={`${theme.cardBackground} rounded-xl ${theme.glow} ${theme.border} p-6 backdrop-blur-sm transition-all duration-[5000ms] ease-in-out`}
          >
            <h3 className={`text-lg font-semibold ${theme.textPrimary} mb-4 transition-colors duration-[5000ms] ease-in-out`}>Pipeline Overview</h3>
            <div className="space-y-4">
              <motion.div 
                whileHover={{ x: 5, scale: 1.01 }}
                className="flex items-center justify-between p-4 bg-dark-600/30 rounded-lg border border-dark-500 hover:border-yellow-500/50 transition-all duration-300"
              >
                <div>
                  <h4 className="font-medium text-white">Senior Developer - TechCorp</h4>
                  <p className="text-sm text-dark-200">5 candidates • Posted 3 days ago</p>
                </div>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/30">
                  In Review
                </span>
              </motion.div>
              <motion.div 
                whileHover={{ x: 5, scale: 1.01 }}
                className="flex items-center justify-between p-4 bg-dark-600/30 rounded-lg border border-dark-500 hover:border-neon-green/50 transition-all duration-300"
              >
                <div>
                  <h4 className="font-medium text-white">Marketing Manager - StartupXYZ</h4>
                  <p className="text-sm text-dark-200">12 candidates • Posted 1 week ago</p>
                </div>
                <span className="px-3 py-1 bg-neon-green/20 text-neon-green text-xs font-medium rounded-full border border-neon-green/30">
                  Interviewing
                </span>
              </motion.div>
              <motion.div 
                whileHover={{ x: 5, scale: 1.01 }}
                className="flex items-center justify-between p-4 bg-dark-600/30 rounded-lg border border-dark-500 hover:border-neon-blue/50 transition-all duration-300"
              >
                <div>
                  <h4 className="font-medium text-white">UX Designer - CreativeAgency</h4>
                  <p className="text-sm text-dark-200">3 candidates • Posted 2 weeks ago</p>
                </div>
                <span className="px-3 py-1 bg-neon-blue/20 text-neon-blue text-xs font-medium rounded-full border border-neon-blue/30">
                  Final Round
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div 
            whileHover={{ y: -2 }}
            variants={itemVariants}
            className={`${theme.cardBackground} rounded-xl ${theme.glow} ${theme.border} p-6 mb-6 backdrop-blur-sm transition-all duration-[5000ms] ease-in-out`}
          >
            <BackendStatus />
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <motion.div 
            whileHover={{ y: -2 }}
            variants={itemVariants}
            className={`${theme.cardBackground} rounded-xl ${theme.glow} ${theme.border} p-6 backdrop-blur-sm transition-all duration-[5000ms] ease-in-out`}
          >
            <h3 className={`text-lg font-semibold ${theme.textPrimary} mb-4 transition-colors duration-[5000ms] ease-in-out`}>Today's Schedule</h3>
            <div className="space-y-3">
              <motion.div 
                whileHover={{ x: 3 }}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-dark-600/30 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <Calendar className="h-5 w-5 text-neon-blue mt-0.5" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme.textPrimary} transition-colors duration-[5000ms] ease-in-out`}>Client Meeting</p>
                  <p className={`text-xs ${theme.textSecondary} transition-colors duration-[5000ms] ease-in-out`}>StartupXYZ • 10:00 AM</p>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ x: 3 }}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-dark-600/30 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <Calendar className="h-5 w-5 text-accent-500 mt-0.5" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme.textPrimary} transition-colors duration-[5000ms] ease-in-out`}>Interview</p>
                  <p className={`text-xs ${theme.textSecondary} transition-colors duration-[5000ms] ease-in-out`}>John Doe • 2:00 PM</p>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ x: 3 }}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-dark-600/30 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <Calendar className="h-5 w-5 text-neon-green mt-0.5" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme.textPrimary} transition-colors duration-[5000ms] ease-in-out`}>Follow-up Call</p>
                  <p className={`text-xs ${theme.textSecondary} transition-colors duration-[5000ms] ease-in-out`}>Sarah Johnson • 4:30 PM</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div 
            whileHover={{ y: -2 }}
            variants={itemVariants}
            className={`${theme.cardBackground} rounded-xl ${theme.glow} ${theme.border} p-6 backdrop-blur-sm transition-all duration-[5000ms] ease-in-out`}
          >
            <h3 className={`text-lg font-semibold ${theme.textPrimary} mb-4 transition-colors duration-[5000ms] ease-in-out`}>Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div 
                  key={activity.id}
                  whileHover={{ x: 3 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-2 rounded-lg hover:bg-dark-600/30 transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-2 h-2 bg-neon-blue rounded-full mt-2"></div>
                  <div>
                    <p className={`text-sm ${theme.textPrimary} transition-colors duration-[5000ms] ease-in-out`}>{activity.message}</p>
                    <p className={`text-xs ${theme.textSecondary} transition-colors duration-[5000ms] ease-in-out`}>{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </motion.div>
  )

  // Simple documents view for testing
  const renderDocuments = () => (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-dark-800/80 backdrop-blur-xl border-b border-dark-600 shadow-premium"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-neon-blue to-primary-500 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Documents</h1>
                <p className="text-dark-200">Manage files and attachments</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFileUpload(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-neon-blue to-primary-600 text-white px-4 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Documents</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Documents Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => setSelectedDocument(doc)}
              className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl shadow-premium border border-dark-600 hover:border-neon-blue/50 hover:shadow-glow backdrop-blur-sm p-4 cursor-pointer"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">{doc.fileType === 'pdf' ? '📄' : doc.fileType === 'jpg' || doc.fileType === 'png' ? '🖼️' : '📝'}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{doc.originalName}</h3>
                  <p className="text-dark-300 text-sm">{(doc.fileSize / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doc.category === 'resume' ? 'bg-neon-blue/20 text-neon-blue' :
                    doc.category === 'portfolio' ? 'bg-neon-purple/20 text-neon-purple' :
                    doc.category === 'contract' ? 'bg-neon-green/20 text-neon-green' :
                    'bg-dark-600 text-dark-200'
                  }`}>
                    {doc.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-dark-400">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-dark-600/50 text-dark-300 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  // Render different views based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'teams':
        return <TeamsSimple />
      case 'candidates':
        return <CandidatesListAPI />
      case 'jobs':
        return (
          <JobsList 
            jobs={jobs}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
            onCreateJob={() => setShowJobForm(true)}
          />
        )
      case 'clients':
        return (
          <ClientsList 
            clients={clients}
            interactions={mockClientInteractions}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
            onCreateClient={() => setShowClientForm(true)}
            onViewClient={handleViewClient}
          />
        )
      case 'documents':
        return renderDocuments()
      case 'ai':
        return <AIToolsTester />
      case 'ai-review':
        return <AICandidateReview />
      case 'reports':
        return <AnalyticsDashboard />
      case 'dashboard':
      default:
        return renderDashboard()
    }
  }

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show AuthSystem
  if (!user) {
    return <AuthSystem />
  }

  return (
    <div className={`min-h-screen transition-all duration-[5000ms] ease-in-out ${theme.background} ${theme.textPrimary}`}>
      {/* Header */}
      <header 
        className={`${theme.cardBackground} backdrop-blur-xl border-b ${theme.border} ${theme.glow} transition-all duration-[5000ms] ease-in-out sticky top-0 z-[9998]`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 w-full">
        {/* Logo & Navigation */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-8 w-8 bg-gradient-to-r from-neon-blue to-accent-500 rounded-lg flex items-center justify-center shadow-glow"
              >
                <span className="text-white font-bold text-sm">RF</span>
              </motion.div>
            </div>
            <div className="ml-3">
              <h1 className={`text-xl font-semibold ${theme.textPrimary} transition-colors duration-[5000ms] ease-in-out`}>RecruitFlow</h1>
            </div>
          </div>

          {/* Primary Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {primaryNavigation.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-[5000ms] ease-in-out ${
                    isActive
                      ? `${theme.accent} bg-gradient-to-r from-blue-500/20 to-cyan-500/20 ${theme.glow}`
                      : `${theme.textSecondary} hover:${theme.textPrimary} hover:bg-gray-100/10`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              )
            })}
            
            {/* More Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-[5000ms] ease-in-out ${
                  secondaryNavigation.some(item => activeTab === item.id)
                    ? `${theme.accent} bg-gradient-to-r from-blue-500/20 to-cyan-500/20 ${theme.glow}`
                    : `${theme.textSecondary} hover:${theme.textPrimary} hover:bg-gray-100/10`
                }`}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="text-sm font-medium">More</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showMoreDropdown ? 'rotate-180' : ''}`} />
              </motion.button>
              
              {/* Dropdown Menu */}
              {showMoreDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute top-full left-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-[9999] overflow-hidden"
                  style={{ 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                  }}
                >
                  <div className="py-2">
                    {secondaryNavigation.map((item) => {
                      const Icon = item.icon
                      const isActive = activeTab === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id)
                            setShowMoreDropdown(false)
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 shadow-glow'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </nav>
        </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Search Icon Button - replaces full search bar */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearchOverlay(true)}
                className={`p-2 ${theme.textSecondary} hover:${theme.textPrimary} hover:bg-white/10 rounded-lg transition-colors duration-300 group`}
                title="Search candidates, jobs, clients..."
              >
                <Search className="h-5 w-5 group-hover:text-blue-400 transition-colors duration-300" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 ${theme.textSecondary} hover:${theme.textPrimary} hover:bg-white/10 rounded-lg transition-colors`}
              >
                <Bell className="h-5 w-5" />
              </motion.button>
              
              {/* Authentication System */}
              <AuthSystem />
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 ${theme.textSecondary} hover:${theme.textPrimary} hover:bg-white/10 rounded-lg transition-colors`}
              >
                <Settings className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Conditionally Rendered */}
      {renderContent()}

      {/* Candidate Form Modal */}
      <CandidateForm
        candidate={editingCandidate}
        onSave={handleSaveCandidate}
        onCancel={handleCancelForm}
        isOpen={showCandidateForm}
      />

      {/* Job Form Modal */}
      <JobForm
        job={editingJob}
        onSave={handleSaveJob}
        onCancel={handleCancelJobForm}
        isOpen={showJobForm}
      />

      {/* Client Form Modal */}
      <ClientForm
        client={editingClient}
        onSave={handleSaveClient}
        onCancel={handleCancelClientForm}
        isOpen={showClientForm}
      />

      {/* File Upload Modal */}
      <FileUpload
        onUpload={handleDocumentUpload}
        onClose={() => setShowFileUpload(false)}
        isOpen={showFileUpload}
        allowMultiple={true}
        maxFiles={10}
        maxFileSize={10}
      />

      {/* Document Viewer Modal */}
      <DocumentViewer
        document={selectedDocument!}
        documents={documents}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        onNext={() => {
          if (selectedDocument) {
            const currentIndex = documents.findIndex(d => d.id === selectedDocument.id)
            const nextIndex = (currentIndex + 1) % documents.length
            setSelectedDocument(documents[nextIndex])
          }
        }}
        onPrevious={() => {
          if (selectedDocument) {
            const currentIndex = documents.findIndex(d => d.id === selectedDocument.id)
            const prevIndex = currentIndex === 0 ? documents.length - 1 : currentIndex - 1
            setSelectedDocument(documents[prevIndex])
          }
        }}
      />

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={showSearchOverlay}
        onClose={() => setShowSearchOverlay(false)}
        onSelect={(result) => {
          console.log('Selected search result:', result)
          // Handle search result selection - navigate to appropriate tab/view
          switch (result.type) {
            case 'candidate':
              setActiveTab('candidates')
              break
            case 'job':
              setActiveTab('jobs')
              break
            case 'client':
              setActiveTab('clients')
              break
          }
        }}
      />

      {/* Client Detail Modal */}
      {selectedClient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedClient(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl border border-dark-600 shadow-premium max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-600">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-r from-neon-blue to-primary-500 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedClient.companyName}</h2>
                  <p className="text-dark-300">{selectedClient.industry}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Client Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-dark-200">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">Industry:</span>
                          <span>{selectedClient.industry}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-dark-200">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">Size:</span>
                          <span>{selectedClient.companySize}</span>
                        </div>
                        {selectedClient.website && (
                          <div className="flex items-center space-x-2 text-dark-200">
                            <Globe className="h-4 w-4" />
                            <a 
                              href={selectedClient.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-neon-blue hover:text-blue-300 underline"
                            >
                              {selectedClient.website}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2 text-dark-200">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <div>
                            <p className="font-medium">Address:</p>
                            <p className="text-sm">
                              {selectedClient.address.street}<br />
                              {selectedClient.address.city}, {selectedClient.address.state} {selectedClient.address.zipCode}<br />
                              {selectedClient.address.country}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Contact */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Primary Contact</h3>
                    <div className="bg-dark-700/50 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-white">{selectedClient.primaryContact.name}</h4>
                      <p className="text-dark-300">{selectedClient.primaryContact.title}</p>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2 text-dark-200">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${selectedClient.primaryContact.email}`} className="text-neon-blue hover:text-blue-300">
                            {selectedClient.primaryContact.email}
                          </a>
                        </div>
                        <div className="flex items-center space-x-2 text-dark-200">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${selectedClient.primaryContact.phone}`} className="text-neon-blue hover:text-blue-300">
                            {selectedClient.primaryContact.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {mockClientInteractions
                        .filter(interaction => interaction.clientId === selectedClient.id)
                        .slice(0, 5)
                        .map((interaction, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-dark-700/30 rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            interaction.type === 'meeting' ? 'bg-green-400' :
                            interaction.type === 'email' ? 'bg-blue-400' :
                            interaction.type === 'call' ? 'bg-yellow-400' : 'bg-gray-400'
                          }`} />
                          <div>
                            <p className="text-white font-medium">{interaction.subject}</p>
                            <p className="text-dark-300 text-sm">{interaction.notes}</p>
                            <p className="text-dark-500 text-xs mt-1">
                              {new Date(interaction.date).toLocaleDateString()} - {interaction.type}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Analytics & Stats */}
                <div className="space-y-6">
                  {/* Client Status */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
                          selectedClient.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          selectedClient.status === 'inactive' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                          selectedClient.status === 'prospective' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        }`}>
                          {selectedClient.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          selectedClient.tier === 'bronze' ? 'bg-amber-600/20 text-amber-400' :
                          selectedClient.tier === 'silver' ? 'bg-gray-400/20 text-gray-300' :
                          selectedClient.tier === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {selectedClient.tier === 'bronze' ? '🥉' :
                           selectedClient.tier === 'silver' ? '🥈' :
                           selectedClient.tier === 'gold' ? '🥇' : '💎'} {selectedClient.tier}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-dark-200">{selectedClient.satisfactionRating}/5 satisfaction</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
                    <div className="space-y-4">
                      <div className="bg-dark-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-dark-300">Total Revenue</span>
                          <span className="text-white font-semibold">${selectedClient.totalRevenue?.toLocaleString() || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="bg-dark-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-dark-300">Active Jobs</span>
                          <span className="text-white font-semibold">{selectedClient.activeJobsCount || 0}</span>
                        </div>
                      </div>
                      <div className="bg-dark-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-dark-300">Placements</span>
                          <span className="text-white font-semibold">{selectedClient.placementsCount || 0}</span>
                        </div>
                      </div>
                      <div className="bg-dark-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-dark-300">Interactions</span>
                          <span className="text-white font-semibold">
                            {mockClientInteractions.filter(i => i.clientId === selectedClient.id).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleEditClient(selectedClient)
                        setSelectedClient(null)
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-neon-blue to-primary-600 text-white px-4 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Client</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full flex items-center justify-center space-x-2 bg-dark-600 hover:bg-dark-500 text-white px-4 py-2 rounded-lg transition-all duration-300"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Contact Client</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full flex items-center justify-center space-x-2 bg-dark-600 hover:bg-dark-500 text-white px-4 py-2 rounded-lg transition-all duration-300"
                    >
                      <Briefcase className="h-4 w-4" />
                      <span>View Jobs</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Workflow Shortcuts */}
      <WorkflowShortcuts
        isOpen={showWorkflowShortcuts}
        onClose={() => setShowWorkflowShortcuts(false)}
        onNavigate={(section) => {
          setActiveTab(section)
          setShowWorkflowShortcuts(false)
        }}
        onTriggerAI={(type) => {
          console.log('Trigger AI:', type)
          // You can add specific AI triggers here
          setShowWorkflowShortcuts(false)
        }}
      />

    </div>
  )
}

export default App