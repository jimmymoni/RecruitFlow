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
  ChevronDown
} from 'lucide-react'
import CandidatesList from './components/CandidatesList'
import CandidateForm from './components/CandidateForm'
import JobsList from './components/JobsList'
import JobForm from './components/JobForm'
import ClientsList from './components/ClientsList'
import ClientForm from './components/ClientForm'
import TeamsChat from './components/TeamsChat'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import SmartIntegrations from './components/SmartIntegrations'
import FileUpload from './components/FileUpload'
import DocumentViewer from './components/DocumentViewer'
import { Candidate, CandidateFormData } from './types/candidate'
import { Job, JobFormData } from './types/job'
import { Client, ClientFormData } from './types/client'
import { Document, DocumentUpload, UploadProgress } from './types/document'
import { mockCandidates } from './data/mockCandidates'
import { mockJobs } from './data/mockJobs'
import { mockClients, mockClientInteractions } from './data/mockClients'
import { mockDocuments } from './data/mockDocuments'

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
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMoreDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
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
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ]

  // All navigation items for compatibility
  const navigationItems = [...primaryNavigation, ...secondaryNavigation]

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
              <p className={`text-3xl font-bold ${theme.textPrimary} mt-2 transition-colors duration-[5000ms] ease-in-out`}>{mockStats.activeCandidates}</p>
              <p className="text-sm text-green-600 mt-1 transition-colors duration-[5000ms] ease-in-out">+12% from last month</p>
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
        return <TeamsChat currentUserId="user-1" />
      case 'candidates':
        return <CandidatesList />
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
      case 'integrations':
        return <SmartIntegrations />
      case 'reports':
        return <AnalyticsDashboard />
      case 'dashboard':
      default:
        return renderDashboard()
    }
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
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="relative hidden lg:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className={`block w-48 xl:w-56 pl-10 pr-3 py-2 ${theme.border} rounded-lg leading-5 ${theme.cardBackground} backdrop-blur-sm placeholder-gray-400 ${theme.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-[5000ms] ease-in-out`}
                  placeholder="Search candidates, jobs..."
                />
              </div>
              
              {/* Mobile search button */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`lg:hidden p-2 ${theme.textSecondary} hover:${theme.textPrimary} hover:bg-white/10 rounded-lg transition-colors`}
              >
                <Search className="h-5 w-5" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 ${theme.textSecondary} hover:${theme.textPrimary} hover:bg-white/10 rounded-lg transition-colors`}
              >
                <Bell className="h-5 w-5" />
              </motion.button>
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

      {/* Main Content */}
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
    </div>
  )
}

export default App