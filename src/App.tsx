import { useState } from 'react'
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
  FileText
} from 'lucide-react'
import CandidatesList from './components/CandidatesList'
import CandidateForm from './components/CandidateForm'
import JobsList from './components/JobsList'
import JobForm from './components/JobForm'
import FileUpload from './components/FileUpload'
import DocumentViewer from './components/DocumentViewer'
import { Candidate, CandidateFormData } from './types/candidate'
import { Job, JobFormData } from './types/job'
import { Document, DocumentUpload, UploadProgress } from './types/document'
import { mockCandidates } from './data/mockCandidates'
import { mockJobs } from './data/mockJobs'
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
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

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

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
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
      case 'documents':
        return renderDocuments()
      case 'dashboard':
      default:
        return renderDashboard()
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-[5000ms] ease-in-out ${theme.background} ${theme.textPrimary}`}>
      {/* Header */}
      <header 
        className={`${theme.cardBackground} backdrop-blur-xl border-b ${theme.border} ${theme.glow} transition-all duration-[5000ms] ease-in-out`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-[5000ms] ease-in-out ${
                    activeTab === item.id
                      ? `${theme.accent} bg-gradient-to-r from-blue-500/20 to-cyan-500/20 ${theme.glow}`
                      : `${theme.textSecondary} hover:${theme.textPrimary} hover:bg-gray-100/10`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              )
            })}
          </nav>
        </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-dark-300" />
                </div>
                <input
                  type="text"
                  className={`block w-64 pl-10 pr-3 py-2 ${theme.border} rounded-lg leading-5 ${theme.cardBackground} backdrop-blur-sm placeholder-gray-400 ${theme.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-[5000ms] ease-in-out`}
                  placeholder="Search candidates, jobs..."
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-dark-300 hover:text-neon-blue hover:bg-dark-700 rounded-lg transition-all duration-300"
              >
                <Bell className="h-5 w-5" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-dark-300 hover:text-neon-blue hover:bg-dark-700 rounded-lg transition-all duration-300"
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