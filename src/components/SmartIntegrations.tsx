import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Activity,
  Globe,
  Smartphone,
  Mail,
  Calendar,
  Users,
  Target,
  MessageCircle,
  Database,
  BarChart3,
  Clock,
  TrendingUp,
  Link,
  Wifi,
  WifiOff,
  ChevronRight
} from 'lucide-react'
import { mockIntegrationDashboard } from '../data/mockIntegrations'
import { IntegrationDashboard as IntegrationDashboardType, IntegrationType } from '../types/integrations'

interface SmartIntegrationsProps {
  data?: IntegrationDashboardType
}

const SmartIntegrations = ({ data = mockIntegrationDashboard }: SmartIntegrationsProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType | null>(null)

  const { summary, integrations, recentActivity, usage, health } = data

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'email': return Mail
      case 'calendar': return Calendar
      case 'social': return Users
      case 'job-board': return Target
      case 'communication': return MessageCircle
      case 'ats': return Database
      case 'crm': return BarChart3
      default: return Globe
    }
  }

  const getStatusColor = (status: string, isConnected: boolean) => {
    if (!isConnected) return 'text-gray-400'
    switch (status) {
      case 'success': return 'text-green-400'
      case 'syncing': return 'text-blue-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string, isConnected: boolean) => {
    if (!isConnected) return WifiOff
    switch (status) {
      case 'success': return CheckCircle
      case 'syncing': return RefreshCw
      case 'error': return XCircle
      default: return AlertCircle
    }
  }

  const categories = [
    { id: 'all', name: 'All', icon: Globe },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'job-board', name: 'Job Boards', icon: Target },
    { id: 'communication', name: 'Communication', icon: MessageCircle },
    { id: 'ats', name: 'ATS', icon: Database },
    { id: 'crm', name: 'CRM', icon: BarChart3 }
  ]

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory)

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
                <h1 className="text-2xl font-bold text-white">Smart Integrations</h1>
                <p className="text-white/70">Connect your recruitment workflow with external tools</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                health.systemStatus === 'operational' ? 'bg-green-500/20 text-green-400' :
                health.systemStatus === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium capitalize">{health.systemStatus}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
                <span>Add Integration</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div
            variants={itemVariants}
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Link className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">{summary.connectedIntegrations}/{summary.totalIntegrations}</span>
            </div>
            <p className="text-white/90 font-medium">Connected</p>
            <p className="text-white/70 text-sm">Active integrations</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-white">{usage.emailsSynced + usage.calendarEventsSynced}</span>
            </div>
            <p className="text-white/90 font-medium">Records Synced</p>
            <p className="text-white/70 text-sm">This month</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white">{usage.jobPostings}</span>
            </div>
            <p className="text-white/90 font-medium">Jobs Posted</p>
            <p className="text-white/70 text-sm">Across all boards</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-400" />
              </div>
              <span className={`text-2xl font-bold ${
                summary.syncStatus === 'healthy' ? 'text-green-400' :
                summary.syncStatus === 'issues' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {summary.syncStatus === 'healthy' ? '✓' : summary.syncStatus === 'issues' ? '!' : '✗'}
              </span>
            </div>
            <p className="text-white/90 font-medium">System Health</p>
            <p className="text-white/70 text-sm capitalize">{summary.syncStatus}</p>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Categories & Integrations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Filter */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-black/20"
            >
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  const isSelected = selectedCategory === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-purple-500 text-white shadow-glow'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>

            {/* Integrations Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {filteredIntegrations.map((integration) => {
                const CategoryIcon = getCategoryIcon(integration.category)
                const StatusIcon = getStatusIcon(integration.syncStatus, integration.isConnected)
                const statusColor = getStatusColor(integration.syncStatus, integration.isConnected)
                
                return (
                  <motion.div
                    key={integration.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                    onClick={() => setSelectedIntegration(integration)}
                    className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20 hover:shadow-glow cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{integration.icon}</div>
                        <div>
                          <h3 className="text-white font-semibold">{integration.name}</h3>
                          <p className="text-white/70 text-sm">{integration.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`h-5 w-5 ${statusColor} ${
                          integration.syncStatus === 'syncing' ? 'animate-spin' : ''
                        }`} />
                        <ChevronRight className="h-4 w-4 text-white/50" />
                      </div>
                    </div>
                    
                    <p className="text-white/80 text-sm mb-4">{integration.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="h-4 w-4 text-white/50" />
                        <span className="text-white/70 text-xs capitalize">{integration.category}</span>
                      </div>
                      <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                        integration.isConnected 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {integration.isConnected ? 'Connected' : 'Not Connected'}
                      </div>
                    </div>

                    {integration.lastSync && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-center space-x-2 text-white/50 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>Last sync: {new Date(integration.lastSync).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          </div>

          {/* Right Column - Activity & Health */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-black/20 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                <p className="text-white/70 text-sm">Latest integration events</p>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === 'success' ? 'bg-green-500/20' :
                      activity.status === 'error' ? 'bg-red-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : activity.status === 'error' ? (
                        <XCircle className="h-4 w-4 text-red-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/90 text-sm">{activity.message}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-white/50 text-xs">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                        {activity.recordsProcessed && (
                          <p className="text-white/50 text-xs">
                            {activity.recordsProcessed} records
                          </p>
                        )}
                        {activity.duration && (
                          <p className="text-white/50 text-xs">
                            {Math.round(activity.duration / 1000)}s
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* API Health */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">API Health</h3>
                <Activity className="h-5 w-5 text-green-400" />
              </div>
              <div className="space-y-4">
                {health.apiHealth.map((api) => (
                  <div key={api.provider} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        api.status === 'healthy' ? 'bg-green-400' :
                        api.status === 'degraded' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`} />
                      <span className="text-white/90 capitalize">{api.provider}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-sm">{api.responseTime}ms</p>
                      <p className={`text-xs ${
                        api.status === 'healthy' ? 'text-green-400' :
                        api.status === 'degraded' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {api.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Rate Limits */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Rate Limits</h3>
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <div className="space-y-4">
                {health.rateLimits.map((limit) => {
                  const percentage = (limit.usage / limit.limit) * 100
                  return (
                    <div key={limit.provider}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/90 capitalize">{limit.provider}</span>
                        <span className="text-white/70 text-sm">
                          {limit.usage} / {limit.limit}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            percentage > 80 ? 'bg-red-400' :
                            percentage > 60 ? 'bg-yellow-400' :
                            'bg-green-400'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Integration Details Modal - placeholder for future enhancement */}
      {selectedIntegration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIntegration(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-8 max-w-2xl w-full shadow-black/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{selectedIntegration.icon}</div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedIntegration.name}</h3>
                  <p className="text-white/70">{selectedIntegration.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedIntegration(null)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/70 text-sm">Status</p>
                  <p className={`font-semibold ${
                    selectedIntegration.isConnected ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {selectedIntegration.isConnected ? 'Connected' : 'Not Connected'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/70 text-sm">Provider</p>
                  <p className="text-white font-semibold capitalize">{selectedIntegration.provider}</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/70 text-sm mb-3">Features</p>
                <div className="flex flex-wrap gap-2">
                  {selectedIntegration.features.map((feature, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    selectedIntegration.isConnected
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-glow hover:shadow-xl'
                  }`}
                >
                  {selectedIntegration.isConnected ? 'Disconnect' : 'Connect'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default SmartIntegrations