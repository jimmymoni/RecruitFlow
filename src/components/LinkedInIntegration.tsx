import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  MessageCircle,
  Target,
  TrendingUp,
  Settings,
  Plus,
  Download,
  Upload,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  Filter,
  BarChart3,
  Zap,
  Crown,
  Globe
} from 'lucide-react'
import { LinkedInIntegration as LinkedInIntegrationType } from '../types/integrations'
import { mockLinkedInIntegration } from '../data/mockIntegrations'

interface LinkedInIntegrationProps {
  data?: LinkedInIntegrationType
}

const LinkedInIntegration = ({ data = mockLinkedInIntegration }: LinkedInIntegrationProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'templates' | 'analytics'>('overview')

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

  const mockCandidates = [
    {
      id: '1',
      name: 'Alex Rodriguez',
      title: 'Senior Full Stack Developer',
      company: 'TechStart Inc.',
      location: 'San Francisco, CA',
      connections: 847,
      profileUrl: 'https://linkedin.com/in/alex-rodriguez-dev',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      experience: '5+ years',
      lastActivity: '2 days ago',
      matchScore: 92,
      status: 'contacted'
    },
    {
      id: '2',
      name: 'Maria Chen',
      title: 'Product Manager',
      company: 'InnovateNow',
      location: 'New York, NY',
      connections: 1253,
      profileUrl: 'https://linkedin.com/in/maria-chen-pm',
      skills: ['Product Strategy', 'Agile', 'User Research', 'Analytics'],
      experience: '7+ years',
      lastActivity: '1 week ago',
      matchScore: 88,
      status: 'imported'
    },
    {
      id: '3',
      name: 'James Wilson',
      title: 'DevOps Engineer',
      company: 'CloudScale',
      location: 'Austin, TX',
      connections: 623,
      profileUrl: 'https://linkedin.com/in/james-wilson-devops',
      skills: ['Kubernetes', 'Docker', 'Terraform', 'Python'],
      experience: '4+ years',
      lastActivity: '3 days ago',
      matchScore: 85,
      status: 'pending'
    }
  ]

  const renderOverview = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Profile Status */}
      <motion.div
        variants={itemVariants}
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">LinkedIn Profile</h3>
          <div className="flex items-center space-x-2">
            {data.isPremium && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <Crown className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">Premium</span>
              </div>
            )}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              data.isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {data.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">Profile</p>
            <p className="text-white font-semibold">{data.displayName}</p>
            <p className="text-blue-400 text-xs hover:underline cursor-pointer">
              View LinkedIn Profile
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">Connections</p>
            <p className="text-white font-semibold">{data.connectionCount.toLocaleString()}</p>
            <p className="text-white/50 text-xs">Network size</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">Account Type</p>
            <p className="text-white font-semibold">
              {data.isPremium ? 'LinkedIn Premium' : 'Basic Account'}
            </p>
            <p className="text-white/50 text-xs">
              {data.isPremium ? 'Advanced features' : 'Standard features'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quota Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Search className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white">
              {data.quotaUsage.searches.used}/{data.quotaUsage.searches.limit}
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-white/90 font-medium">Searches</p>
              <p className="text-white/70 text-sm">Monthly quota</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(data.quotaUsage.searches.used / data.quotaUsage.searches.limit) * 100}%` }}
              />
            </div>
            <p className="text-white/50 text-xs">
              Resets {data.quotaUsage.searches.resetDate.toLocaleDateString()}
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-green-400" />
            </div>
            <span className="text-2xl font-bold text-white">
              {data.quotaUsage.messages.used}/{data.quotaUsage.messages.limit}
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-white/90 font-medium">Messages</p>
              <p className="text-white/70 text-sm">Monthly quota</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(data.quotaUsage.messages.used / data.quotaUsage.messages.limit) * 100}%` }}
              />
            </div>
            <p className="text-white/50 text-xs">
              Resets {data.quotaUsage.messages.resetDate.toLocaleDateString()}
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-white">
              {data.quotaUsage.profileViews.used}/{data.quotaUsage.profileViews.limit}
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-white/90 font-medium">Profile Views</p>
              <p className="text-white/70 text-sm">Monthly quota</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(data.quotaUsage.profileViews.used / data.quotaUsage.profileViews.limit) * 100}%` }}
              />
            </div>
            <p className="text-white/50 text-xs">
              Resets {data.quotaUsage.profileViews.resetDate.toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <motion.div
        variants={itemVariants}
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Available Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(data.features).map(([feature, enabled]) => (
            <div
              key={feature}
              className={`p-4 rounded-lg border ${
                enabled 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {enabled ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>
              <p className="text-xs mt-2 opacity-70">
                {enabled ? 'Available' : 'Requires premium'}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )

  const renderCandidates = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Search & Import */}
      <motion.div
        variants={itemVariants}
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Candidate Search & Import</h3>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors">
              <Search className="h-4 w-4" />
              <span>New Search</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300">
              <Download className="h-4 w-4" />
              <span>Bulk Import</span>
            </button>
          </div>
        </div>
        
        {/* Matching Criteria */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <h4 className="text-white font-medium mb-4">Current Matching Criteria</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-sm mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {data.settings.matchingCriteria.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-2">Locations</p>
              <div className="flex flex-wrap gap-2">
                {data.settings.matchingCriteria.location.map((loc, index) => (
                  <span key={index} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Candidate Results */}
      <motion.div
        variants={itemVariants}
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-black/20 overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Recent Candidates</h3>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-white/70" />
              <span className="text-white/70 text-sm">{mockCandidates.length} results</span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-white/10">
          {mockCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{candidate.name}</h4>
                      <p className="text-white/80 text-sm">{candidate.title}</p>
                      <p className="text-white/60 text-sm">{candidate.company} • {candidate.location}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-white/50 text-xs">
                          {candidate.connections} connections
                        </span>
                        <span className="text-white/50 text-xs">
                          {candidate.experience}
                        </span>
                        <span className="text-white/50 text-xs">
                          Active {candidate.lastActivity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`flex items-center space-x-1 ${
                          candidate.matchScore >= 90 ? 'text-green-400' :
                          candidate.matchScore >= 80 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          <Star className="h-4 w-4" />
                          <span className="text-sm font-semibold">{candidate.matchScore}%</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        candidate.status === 'contacted' ? 'bg-green-500/20 text-green-400' :
                        candidate.status === 'imported' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {candidate.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {candidate.skills.slice(0, 4).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 4 && (
                      <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded">
                        +{candidate.skills.length - 4} more
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-4">
                    <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">View Profile</span>
                    </button>
                    <button className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">Send Message</span>
                    </button>
                    <button className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors">
                      <Download className="h-4 w-4" />
                      <span className="text-sm">Import</span>
                    </button>
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
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">LinkedIn Integration</h1>
                <p className="text-white/70">Professional networking and candidate sourcing</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
              >
                <Zap className="h-4 w-4" />
                <span>Quick Search</span>
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
            { id: 'candidates', label: 'Candidates', icon: Users },
            { id: 'templates', label: 'Templates', icon: MessageCircle },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
        {activeTab === 'candidates' && renderCandidates()}
        {(activeTab === 'templates' || activeTab === 'analytics') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-black/20 text-center"
          >
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Users className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white/70 mb-2">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h3>
                <p className="text-white/50">
                  {activeTab} management coming soon...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default LinkedInIntegration