import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  MessageSquare,
  Plus,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  ArrowRight,
  Paperclip,
  X
} from 'lucide-react'
import { Communication, CommunicationTypeLabels } from '../types/communication'

interface CommunicationLogProps {
  candidateId: string
  candidateName: string
  communications: Communication[]
  onAddCommunication: () => void
  onClose?: () => void
}

const CommunicationLog = ({ 
  candidateId, 
  candidateName, 
  communications, 
  onAddCommunication,
  onClose 
}: CommunicationLogProps) => {
  const [filter, setFilter] = useState<'all' | Communication['type']>('all')

  const getTypeIcon = (type: Communication['type']) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'call': return <Phone className="h-4 w-4" />
      case 'meeting': return <Calendar className="h-4 w-4" />
      case 'note': return <FileText className="h-4 w-4" />
      case 'linkedin': return <MessageSquare className="h-4 w-4" />
      case 'text': return <MessageSquare className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getOutcomeIcon = (outcome: Communication['outcome']) => {
    switch (outcome) {
      case 'positive': return <TrendingUp className="h-3 w-3 text-neon-green" />
      case 'negative': return <TrendingDown className="h-3 w-3 text-red-400" />
      case 'follow-up-needed': return <Clock className="h-3 w-3 text-yellow-400" />
      default: return <Minus className="h-3 w-3 text-dark-300" />
    }
  }

  const getTypeColor = (type: Communication['type']) => {
    switch (type) {
      case 'email': return 'text-blue-400 bg-blue-400/20 border-blue-400/30'
      case 'call': return 'text-neon-green bg-neon-green/20 border-neon-green/30'
      case 'meeting': return 'text-neon-purple bg-neon-purple/20 border-neon-purple/30'
      case 'note': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
      case 'linkedin': return 'text-neon-blue bg-neon-blue/20 border-neon-blue/30'
      case 'text': return 'text-accent-500 bg-accent-500/20 border-accent-500/30'
      default: return 'text-dark-300 bg-dark-500/20 border-dark-400/30'
    }
  }

  const filteredCommunications = communications
    .filter(comm => filter === 'all' || comm.type === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return `${days} days ago`
    } else {
      return new Date(date).toLocaleDateString()
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl shadow-premium border border-dark-600 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-dark-600">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-r from-neon-blue to-primary-500 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Communication Log</h3>
            <p className="text-dark-200">{candidateName} • {communications.length} interactions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddCommunication}
            className="flex items-center space-x-2 bg-gradient-to-r from-neon-blue to-primary-600 text-white px-4 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            <span>Add Communication</span>
          </motion.button>
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 text-dark-300 hover:text-white hover:bg-dark-600 rounded-lg transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-dark-600">
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('all')}
            className={
              filter === 'all'
                ? 'px-3 py-1 rounded-full text-sm font-medium border transition-all duration-300 bg-neon-blue text-white border-neon-blue shadow-glow'
                : 'px-3 py-1 rounded-full text-sm font-medium border transition-all duration-300 bg-dark-600 text-dark-200 border-dark-500 hover:border-neon-blue hover:text-neon-blue'
            }
          >
            All ({communications.length})
          </motion.button>
          {Object.entries(CommunicationTypeLabels).map(([type, label]) => {
            const count = communications.filter(c => c.type === type).length
            if (count === 0) return null

            return (
              <motion.button
                key={type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter(type as Communication['type'])}
                className={
                  filter === type
                    ? `px-3 py-1 rounded-full text-sm font-medium border transition-all duration-300 ${getTypeColor(type as Communication['type'])}`
                    : 'px-3 py-1 rounded-full text-sm font-medium border transition-all duration-300 bg-dark-600 text-dark-200 border-dark-500 hover:border-neon-blue hover:text-neon-blue'
                }
              >
                {label} ({count})
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Communications Timeline */}
      <div className="max-h-96 overflow-y-auto p-6">
        {filteredCommunications.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-dark-400 mx-auto mb-3" />
            <p className="text-dark-300">No communications found</p>
            <p className="text-sm text-dark-400 mt-1">
              {filter !== 'all' ? `No ${CommunicationTypeLabels[filter as keyof typeof CommunicationTypeLabels]} communications` : 'Start by adding your first interaction'}
            </p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredCommunications.map((comm, index) => (
              <motion.div
                key={comm.id}
                variants={itemVariants}
                className="relative"
              >
                {/* Timeline Line */}
                {index < filteredCommunications.length - 1 && (
                  <div className="absolute left-6 top-12 w-px h-16 bg-dark-600"></div>
                )}

                {/* Communication Item */}
                <div className="flex items-start space-x-4">
                  {/* Type Icon */}
                  <div className={`flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center border ${getTypeColor(comm.type)}`}>
                    {getTypeIcon(comm.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-white">
                          {comm.subject || CommunicationTypeLabels[comm.type]}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {comm.direction === 'outbound' ? (
                            <ArrowRight className="h-3 w-3 text-accent-500" />
                          ) : (
                            <ArrowLeft className="h-3 w-3 text-neon-blue" />
                          )}
                          {comm.outcome && getOutcomeIcon(comm.outcome)}
                        </div>
                      </div>
                      <div className="text-xs text-dark-300 flex items-center space-x-2">
                        <span>{formatDate(comm.date)}</span>
                        {comm.duration && (
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{comm.duration}min</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-dark-200 text-sm mb-3 leading-relaxed">
                      {comm.content}
                    </p>

                    {/* Tags and Attachments */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {comm.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-dark-600 text-dark-200 text-xs rounded border border-dark-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {comm.attachments && comm.attachments.length > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-dark-300">
                          <Paperclip className="h-3 w-3" />
                          <span>{comm.attachments.length} attachment{comm.attachments.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CommunicationLog