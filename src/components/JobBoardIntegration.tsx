import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  Globe,
  TrendingUp,
  Settings,
  Plus,
  Eye,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Filter,
  Search,
  Edit3,
  Trash2,
  Upload,
  Download,
  Star,
  Zap
} from 'lucide-react'
import { JobBoardIntegration as JobBoardIntegrationType } from '../types/integrations'
import { mockJobBoardIntegrations } from '../data/mockIntegrations'

interface JobBoardIntegrationProps {
  data?: JobBoardIntegrationType[]
}

const JobBoardIntegration = ({ data = mockJobBoardIntegrations }: JobBoardIntegrationProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'publish' | 'analytics' | 'settings'>('overview')
  const [selectedBoard, setSelectedBoard] = useState<string>('all')

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

  const mockJobPostings = [
    {
      id: '1',
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      salary: '$120,000 - $160,000',
      type: 'Full-time',
      remote: true,
      postedDate: new Date('2024-08-08'),
      boards: ['indeed', 'linkedin-jobs'],
      status: 'active',
      views: 847,
      applications: 23,
      performance: {
        indeed: { views: 512, applications: 15, cost: 45 },
        'linkedin-jobs': { views: 335, applications: 8, cost: 89 }
      }
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'InnovateNow',
      location: 'New York, NY',
      salary: '$90,000 - $130,000',
      type: 'Full-time',
      remote: false,
      postedDate: new Date('2024-08-06'),
      boards: ['indeed', 'glassdoor'],
      status: 'active',
      views: 643,
      applications: 31,
      performance: {
        indeed: { views: 423, applications: 19, cost: 38 },
        glassdoor: { views: 220, applications: 12, cost: 67 }
      }
    },
    {
      id: '3',
      title: 'DevOps Engineer',
      company: 'CloudScale',
      location: 'Austin, TX',
      salary: '$100,000 - $140,000',
      type: 'Full-time',
      remote: true,
      postedDate: new Date('2024-08-04'),
      boards: ['linkedin-jobs'],
      status: 'paused',
      views: 298,
      applications: 8,
      performance: {
        'linkedin-jobs': { views: 298, applications: 8, cost: 156 }
      }
    }
  ]

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'indeed': return '🎯'
      case 'linkedin-jobs': return '💼'
      case 'glassdoor': return '🏢'
      case 'monster': return '👹'
      case 'ziprecruiter': return '📧'
      default: return '🌐'
    }
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'indeed': return 'from-blue-500 to-blue-700'
      case 'linkedin-jobs': return 'from-blue-600 to-blue-800'
      case 'glassdoor': return 'from-green-500 to-green-700'
      case 'monster': return 'from-purple-500 to-purple-700'
      case 'ziprecruiter': return 'from-orange-500 to-orange-700'
      default: return 'from-gray-500 to-gray-700'
    }
  }

  const renderOverview = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Job Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((board, index) => (
          <motion.div
            key={board.id}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20 hover:shadow-glow transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`h-12 w-12 bg-gradient-to-r ${getProviderColor(board.provider)} rounded-lg flex items-center justify-center text-2xl`}>
                  {getProviderIcon(board.provider)}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{board.name}</h3>
                  <p className="text-white/70 text-sm capitalize">{board.provider}</p>
                </div>
              </div>
              <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                board.isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {board.isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/70 text-xs">Active Jobs</p>
                  <p className="text-white font-semibold text-lg">{board.activeJobs}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/70 text-xs">Total Views</p>
                  <p className="text-white font-semibold text-lg">{board.totalViews.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70 text-xs">Posting Quota</p>
                  <p className="text-white/50 text-xs">
                    {board.postingQuota.used} / {board.postingQuota.limit}
                  </p>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      (board.postingQuota.used / board.postingQuota.limit) > 0.8 ? 'bg-red-400' :
                      (board.postingQuota.used / board.postingQuota.limit) > 0.6 ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`}
                    style={{ width: `${(board.postingQuota.used / board.postingQuota.limit) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-white/50 text-xs">
                  {board.totalApplications} applications
                </div>
                <div className={`px-2 py-1 text-xs rounded-full ${
                  board.autoPosting ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {board.autoPosting ? 'Auto' : 'Manual'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Summary */}
      <motion.div
        variants={itemVariants}
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="h-16 w-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="h-8 w-8 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {data.reduce((sum, board) => sum + board.activeJobs, 0)}
            </p>
            <p className="text-white/70 text-sm">Active Jobs</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Eye className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {data.reduce((sum, board) => sum + board.totalViews, 0).toLocaleString()}
            </p>
            <p className="text-white/70 text-sm">Total Views</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {data.reduce((sum, board) => sum + board.totalApplications, 0)}
            </p>
            <p className="text-white/70 text-sm">Applications</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {((data.reduce((sum, board) => sum + board.totalApplications, 0) / 
                 data.reduce((sum, board) => sum + board.totalViews, 0)) * 100).toFixed(1)}%
            </p>
            <p className="text-white/70 text-sm">Conversion Rate</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Job Postings */}
      <motion.div
        variants={itemVariants}
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-black/20 overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Active Job Postings</h3>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-white/70" />
              <Search className="h-4 w-4 text-white/70" />
            </div>
          </div>
        </div>
        <div className="divide-y divide-white/10">
          {mockJobPostings.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold">{job.title}</h4>
                      <p className="text-white/80 text-sm">{job.company}</p>
                      <div className="flex items-center space-x-4 mt-1 text-white/60 text-xs">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{job.location}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{job.salary}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Posted {job.postedDate.toLocaleDateString()}</span>
                        </span>
                        {job.remote && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                            Remote
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 text-xs font-medium rounded-full mb-2 ${
                        job.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        job.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {job.status}
                      </div>
                      <div className="text-white/50 text-xs">
                        {job.views} views • {job.applications} applications
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-white/70 text-sm">Published on:</span>
                      {job.boards.map(board => (
                        <span key={board} className="text-lg">
                          {getProviderIcon(board)}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">View</span>
                      </button>
                      <button className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors">
                        <Edit3 className="h-4 w-4" />
                        <span className="text-sm">Edit</span>
                      </button>
                      <button className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-sm">Analytics</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Performance breakdown */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(job.performance).map(([board, perf]) => (
                        <div key={board} className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{getProviderIcon(board)}</span>
                              <span className="text-white/70 text-xs capitalize">
                                {board.replace('-', ' ')}
                              </span>
                            </div>
                            <span className="text-white/50 text-xs">${perf.cost}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-blue-400">{perf.views} views</span>
                            <span className="text-green-400">{perf.applications} apps</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Job Board Publishing</h1>
                <p className="text-white/70">Multi-platform job posting and management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
                <span>Post New Job</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-1 bg-black/20 backdrop-blur-xl border border-white/10 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'publish', label: 'Publish Job', icon: Upload },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings }
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
        {activeTab !== 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-black/20 text-center"
          >
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Target className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white/70 mb-2">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h3>
                <p className="text-white/50">
                  {activeTab === 'publish' ? 'Job publishing wizard' : 
                   activeTab === 'analytics' ? 'Advanced analytics dashboard' :
                   'Job board settings'} coming soon...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default JobBoardIntegration