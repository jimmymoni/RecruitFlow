import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Calendar,
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Folder,
  Filter,
  Search,
  Clock,
  User,
  Tag,
  AlertCircle,
  Download,
  Upload
} from 'lucide-react'
import { EmailIntegration as EmailIntegrationType, EmailFolder } from '../types/integrations'
import { mockEmailIntegration } from '../data/mockIntegrations'

interface EmailIntegrationProps {
  data?: EmailIntegrationType
}

const EmailIntegration = ({ data = mockEmailIntegration }: EmailIntegrationProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'folders' | 'settings' | 'activity'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolderForm, setShowNewFolderForm] = useState(false)

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

  const mockEmails = [
    {
      id: '1',
      subject: 'RE: Software Engineer Position - John Doe',
      sender: 'john.doe@example.com',
      timestamp: new Date('2024-08-10T09:30:00Z'),
      folder: 'Candidates',
      isRead: false,
      hasAttachment: true,
      candidateId: 'candidate-1'
    },
    {
      id: '2',
      subject: 'Interview Confirmation - Technical Role',
      sender: 'hr@techcorp.com',
      timestamp: new Date('2024-08-10T08:15:00Z'),
      folder: 'Clients',
      isRead: true,
      hasAttachment: false,
      clientId: 'client-1'
    },
    {
      id: '3',
      subject: 'Resume - Senior Developer Position',
      sender: 'sarah.smith@email.com',
      timestamp: new Date('2024-08-09T16:45:00Z'),
      folder: 'Candidates',
      isRead: true,
      hasAttachment: true,
      candidateId: 'candidate-2'
    },
    {
      id: '4',
      subject: 'Meeting Request - Q3 Hiring Plans',
      sender: 'ceo@startup.io',
      timestamp: new Date('2024-08-09T14:20:00Z'),
      folder: 'Clients',
      isRead: false,
      hasAttachment: false,
      clientId: 'client-2'
    }
  ]

  const renderOverview = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Connection Status */}
      <motion.div
        variants={itemVariants}
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Connection Status</h3>
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            data.isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {data.isConnected ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {data.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">Email Account</p>
            <p className="text-white font-semibold">{data.email}</p>
            <p className="text-white/50 text-xs">{data.displayName}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">Provider</p>
            <p className="text-white font-semibold capitalize">{data.provider}</p>
            <p className="text-white/50 text-xs">Google Workspace</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">Last Sync</p>
            <p className="text-white font-semibold">
              {new Date(data.lastSync).toLocaleTimeString()}
            </p>
            <p className="text-white/50 text-xs">
              {new Date(data.lastSync).toLocaleDateString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-400" />
            </div>
            <RefreshCw className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">{data.syncedEmails}</p>
            <p className="text-white/70 text-sm">Emails Synced</p>
            <p className="text-blue-400 text-xs mt-2">Last 30 days</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Folder className="h-6 w-6 text-green-400" />
            </div>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">{data.folders.length}</p>
            <p className="text-white/70 text-sm">Auto-file Folders</p>
            <p className="text-green-400 text-xs mt-2">Active & configured</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-400" />
            </div>
            <Settings className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">{data.syncFrequency}</p>
            <p className="text-white/70 text-sm">Sync Frequency</p>
            <p className="text-purple-400 text-xs mt-2">Minutes interval</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Tag className="h-6 w-6 text-orange-400" />
            </div>
            <AlertCircle className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">
              {data.settings.candidateKeywords.length + data.settings.clientKeywords.length}
            </p>
            <p className="text-white/70 text-sm">Smart Keywords</p>
            <p className="text-orange-400 text-xs mt-2">Auto-classification</p>
          </div>
        </motion.div>
      </div>

      {/* Recent Emails */}
      <motion.div
        variants={itemVariants}
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-black/20 overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Recent Emails</h3>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Search className="h-4 w-4 text-white/70" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Filter className="h-4 w-4 text-white/70" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <RefreshCw className="h-4 w-4 text-white/70" />
              </button>
            </div>
          </div>
        </div>
        <div className="divide-y divide-white/10">
          {mockEmails.map((email, index) => (
            <motion.div
              key={email.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 hover:bg-white/5 transition-colors cursor-pointer ${
                !email.isRead ? 'bg-blue-500/5' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  !email.isRead ? 'bg-blue-400' : 'bg-transparent border-2 border-white/20'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        !email.isRead ? 'text-white' : 'text-white/80'
                      }`}>
                        {email.subject}
                      </h4>
                      <p className="text-white/60 text-sm mt-1">{email.sender}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-white/50 text-xs">
                        {new Date(email.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {email.hasAttachment && (
                          <div className="w-4 h-4 bg-orange-500/20 rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-orange-400 rounded-sm" />
                          </div>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          email.folder === 'Candidates' ? 'bg-blue-500/20 text-blue-400' :
                          email.folder === 'Clients' ? 'bg-green-500/20 text-green-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {email.folder}
                        </span>
                      </div>
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

  const renderFolders = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Auto-file Folders</h3>
          <button
            onClick={() => setShowNewFolderForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            <span>Add Folder</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.folders.map((folder) => (
            <motion.div
              key={folder.id}
              variants={itemVariants}
              className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    folder.type === 'candidates' ? 'bg-blue-500/20' :
                    folder.type === 'clients' ? 'bg-green-500/20' :
                    folder.type === 'jobs' ? 'bg-purple-500/20' :
                    'bg-orange-500/20'
                  }`}>
                    <Folder className={`h-6 w-6 ${
                      folder.type === 'candidates' ? 'text-blue-400' :
                      folder.type === 'clients' ? 'text-green-400' :
                      folder.type === 'jobs' ? 'text-purple-400' :
                      'text-orange-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{folder.name}</h4>
                    <p className="text-white/70 text-sm capitalize">{folder.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                    folder.autoFile ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {folder.autoFile ? 'Auto' : 'Manual'}
                  </div>
                  <button className="p-1 hover:bg-white/20 rounded transition-colors">
                    <Edit3 className="h-4 w-4 text-white/70" />
                  </button>
                  <button className="p-1 hover:bg-red-500/20 rounded transition-colors">
                    <Trash2 className="h-4 w-4 text-red-400/70" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-white/70 text-sm mb-2">Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {folder.keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded">
                        {keyword}
                      </span>
                    ))}
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
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Email Integration</h1>
                <p className="text-white/70">Smart email sync and auto-filing</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Sync Now</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-1 bg-black/20 backdrop-blur-xl border border-white/10 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'folders', label: 'Folders', icon: Folder },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'activity', label: 'Activity', icon: Clock }
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
        {activeTab === 'folders' && renderFolders()}
        {activeTab !== 'overview' && activeTab !== 'folders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-black/20 text-center"
          >
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Mail className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white/70 mb-2">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h3>
                <p className="text-white/50">
                  {activeTab} configuration coming soon...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default EmailIntegration