import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Star,
  StarOff,
  Check,
  Square,
  CheckSquare,
  Trash2,
  UserCheck,
  UserX,
  MoreVertical,
  MessageSquare,
  Clock,
  FileText
} from 'lucide-react'
import { Candidate } from '../types/candidate'
import { Communication, CommunicationFormData } from '../types/communication'
import { mockCandidates } from '../data/mockCandidates'
import { mockCommunications } from '../data/mockCommunications'
import CommunicationLog from './CommunicationLog'
import AddCommunicationForm from './AddCommunicationForm'

const CandidatesList = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates)
  const [communications, setCommunications] = useState<Communication[]>(mockCommunications)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedCandidateForComm, setSelectedCandidateForComm] = useState<Candidate | null>(null)
  const [showCommunicationForm, setShowCommunicationForm] = useState(false)

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = selectedStatus === 'all' || candidate.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Bulk action handlers
  const toggleCandidateSelection = (candidateId: string) => {
    const newSelected = new Set(selectedCandidates)
    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId)
    } else {
      newSelected.add(candidateId)
    }
    setSelectedCandidates(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const selectAllCandidates = () => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set())
      setShowBulkActions(false)
    } else {
      const allIds = new Set(filteredCandidates.map(c => c.id))
      setSelectedCandidates(allIds)
      setShowBulkActions(true)
    }
  }

  const bulkUpdateStatus = (newStatus: Candidate['status']) => {
    setCandidates(prev => prev.map(candidate => 
      selectedCandidates.has(candidate.id) 
        ? { ...candidate, status: newStatus, updatedAt: new Date() }
        : candidate
    ))
    setSelectedCandidates(new Set())
    setShowBulkActions(false)
  }

  const bulkDelete = () => {
    setCandidates(prev => prev.filter(candidate => !selectedCandidates.has(candidate.id)))
    setSelectedCandidates(new Set())
    setShowBulkActions(false)
  }

  const isAllSelected = selectedCandidates.size === filteredCandidates.length && filteredCandidates.length > 0
  const isPartiallySelected = selectedCandidates.size > 0 && selectedCandidates.size < filteredCandidates.length

  // Communication handlers
  const getCandidateCommunications = (candidateId: string) => {
    return communications.filter(comm => comm.candidateId === candidateId)
  }

  const getLastCommunication = (candidateId: string) => {
    const candidateComms = getCandidateCommunications(candidateId)
    return candidateComms.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  }

  const handleAddCommunication = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId)
    if (candidate) {
      setSelectedCandidateForComm(candidate)
      setShowCommunicationForm(true)
    }
  }

  const handleSaveCommunication = (data: CommunicationFormData) => {
    if (!selectedCandidateForComm) return

    const newCommunication: Communication = {
      ...data,
      id: Date.now().toString(),
      candidateId: selectedCandidateForComm.id,
      createdBy: 'John Recruiter',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setCommunications(prev => [newCommunication, ...prev])
    setShowCommunicationForm(false)
    setSelectedCandidateForComm(null)
  }

  const formatTimeSince = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      return hours === 0 ? 'Just now' : `${hours}h ago`
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 30) {
      return `${days}d ago`
    } else {
      return `${Math.floor(days / 30)}mo ago`
    }
  }

  const getStatusColor = (status: Candidate['status']) => {
    switch (status) {
      case 'active': return 'text-neon-green bg-neon-green/20 border-neon-green/30'
      case 'passive': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
      case 'placed': return 'text-neon-blue bg-neon-blue/20 border-neon-blue/30'
      case 'unavailable': return 'text-dark-300 bg-dark-500/20 border-dark-400/30'
    }
  }

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

  return (
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
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Candidates</h1>
                <p className="text-dark-200">Manage your talent pipeline</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-gradient-to-r from-neon-blue to-primary-600 text-white px-4 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              <span>Add Candidate</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Search and Filters */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl shadow-premium border border-dark-600 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Bulk Select All */}
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={selectAllCandidates}
                  className={`p-2 rounded-lg border transition-all duration-300 ${
                    isAllSelected
                      ? 'bg-neon-blue border-neon-blue text-white shadow-glow'
                      : isPartiallySelected
                      ? 'bg-neon-blue/20 border-neon-blue text-neon-blue'
                      : 'bg-dark-600 border-dark-500 text-dark-300 hover:border-neon-blue hover:text-neon-blue'
                  }`}
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : isPartiallySelected ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </motion.button>
                <span className="text-sm text-dark-200">
                  {selectedCandidates.size > 0 ? `${selectedCandidates.size} selected` : 'Select all'}
                </span>
              </div>

              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-300" />
                <input
                  type="text"
                  placeholder="Search candidates, skills, titles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="passive">Passive</option>
                <option value="placed">Placed</option>
                <option value="unavailable">Unavailable</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-neon-blue text-white shadow-glow'
                      : 'bg-dark-600 text-dark-300 hover:bg-dark-500'
                  }`}
                >
                  <div className="grid grid-cols-2 gap-1 w-4 h-4">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-neon-blue text-white shadow-glow'
                      : 'bg-dark-600 text-dark-300 hover:bg-dark-500'
                  }`}
                >
                  <div className="space-y-1 w-4 h-4">
                    <div className="bg-current h-1 rounded-sm"></div>
                    <div className="bg-current h-1 rounded-sm"></div>
                    <div className="bg-current h-1 rounded-sm"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-neon-blue/10 to-primary-500/10 border border-neon-blue/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-white font-medium">
                    {selectedCandidates.size} candidate{selectedCandidates.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => bulkUpdateStatus('active')}
                      className="flex items-center space-x-1 px-3 py-1 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 transition-all duration-300"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span className="text-sm">Mark Active</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => bulkUpdateStatus('passive')}
                      className="flex items-center space-x-1 px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-lg hover:bg-yellow-400/30 transition-all duration-300"
                    >
                      <UserX className="h-4 w-4" />
                      <span className="text-sm">Mark Passive</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => bulkUpdateStatus('placed')}
                      className="flex items-center space-x-1 px-3 py-1 bg-neon-blue/20 text-neon-blue rounded-lg hover:bg-neon-blue/30 transition-all duration-300"
                    >
                      <Check className="h-4 w-4" />
                      <span className="text-sm">Mark Placed</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={bulkDelete}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm">Delete</span>
                    </motion.button>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedCandidates(new Set())
                    setShowBulkActions(false)
                  }}
                  className="p-1 text-dark-300 hover:text-white transition-colors"
                >
                  ✕
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Summary */}
        <motion.div variants={itemVariants} className="mb-6">
          <p className="text-dark-200">
            Showing <span className="text-white font-medium">{filteredCandidates.length}</span> of{' '}
            <span className="text-white font-medium">{candidates.length}</span> candidates
          </p>
        </motion.div>

        {/* Candidates Grid/List */}
        {viewMode === 'grid' ? (
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCandidates.map((candidate) => (
              <motion.div
                key={candidate.id}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl shadow-premium border border-dark-600 hover:border-neon-blue/50 hover:shadow-glow backdrop-blur-sm p-6 cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCandidateSelection(candidate.id)
                      }}
                      className={`p-1 rounded border transition-all duration-300 ${
                        selectedCandidates.has(candidate.id)
                          ? 'bg-neon-blue border-neon-blue text-white shadow-glow'
                          : 'bg-dark-600 border-dark-500 text-dark-300 hover:border-neon-blue'
                      }`}
                    >
                      {selectedCandidates.has(candidate.id) ? (
                        <CheckSquare className="h-3 w-3" />
                      ) : (
                        <Square className="h-3 w-3" />
                      )}
                    </motion.button>
                    <div className="h-12 w-12 bg-gradient-to-r from-neon-blue to-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {candidate.firstName[0]}{candidate.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-neon-blue transition-colors">
                        {candidate.firstName} {candidate.lastName}
                      </h3>
                      <p className="text-sm text-dark-200">{candidate.title}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
                    {candidate.status}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-dark-200">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-dark-200">
                    <Phone className="h-4 w-4" />
                    <span>{candidate.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-dark-200">
                    <MapPin className="h-4 w-4" />
                    <span>{candidate.location.city}, {candidate.location.state}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-dark-600/50 text-xs text-dark-200 rounded border border-dark-500">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="px-2 py-1 bg-dark-600/50 text-xs text-dark-200 rounded border border-dark-500">
                        +{candidate.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Communication Summary */}
                <div className="mb-4 p-3 bg-dark-600/20 rounded-lg border border-dark-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-dark-300">Last Contact</span>
                    <span className="text-xs text-dark-200">
                      {getCandidateCommunications(candidate.id).length} interactions
                    </span>
                  </div>
                  {(() => {
                    const lastComm = getLastCommunication(candidate.id)
                    return lastComm ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-xs">
                          {lastComm.type === 'email' && <Mail className="h-3 w-3 text-blue-400" />}
                          {lastComm.type === 'call' && <Phone className="h-3 w-3 text-neon-green" />}
                          {lastComm.type === 'meeting' && <Calendar className="h-3 w-3 text-neon-purple" />}
                          {lastComm.type === 'note' && <FileText className="h-3 w-3 text-yellow-400" />}
                          {(lastComm.type === 'linkedin' || lastComm.type === 'text') && <MessageSquare className="h-3 w-3 text-neon-blue" />}
                          <span className="text-dark-200">{formatTimeSince(lastComm.date)}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-dark-400">No communications yet</span>
                    )
                  })()
                  }
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-dark-600">
                  <div className="flex items-center space-x-2 text-sm text-dark-200">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      {candidate.salary.expected 
                        ? `$${candidate.salary.expected.toLocaleString()}`
                        : 'Not disclosed'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCandidateForComm(candidate)
                      }}
                      className="p-1 text-dark-300 hover:text-neon-blue transition-colors"
                      title="View communications"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddCommunication(candidate.id)
                      }}
                      className="p-1 text-dark-300 hover:text-accent-500 transition-colors"
                      title="Add communication"
                    >
                      <Plus className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 text-dark-300 hover:text-yellow-400 transition-colors"
                      title="View profile"
                    >
                      <Eye className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* List View */
          <motion.div variants={itemVariants} className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <motion.div
                key={candidate.id}
                whileHover={{ x: 5 }}
                className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl shadow-premium border border-dark-600 hover:border-neon-blue/50 hover:shadow-glow backdrop-blur-sm p-6 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCandidateSelection(candidate.id)
                      }}
                      className={`p-1 rounded border transition-all duration-300 ${
                        selectedCandidates.has(candidate.id)
                          ? 'bg-neon-blue border-neon-blue text-white shadow-glow'
                          : 'bg-dark-600 border-dark-500 text-dark-300 hover:border-neon-blue'
                      }`}
                    >
                      {selectedCandidates.has(candidate.id) ? (
                        <CheckSquare className="h-3 w-3" />
                      ) : (
                        <Square className="h-3 w-3" />
                      )}
                    </motion.button>
                    <div className="h-12 w-12 bg-gradient-to-r from-neon-blue to-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {candidate.firstName[0]}{candidate.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {candidate.firstName} {candidate.lastName}
                      </h3>
                      <p className="text-dark-200">{candidate.title}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-dark-200">
                      <span>{candidate.location.city}, {candidate.location.state}</span>
                      <span>{candidate.experience} years exp</span>
                      <span>
                        {candidate.salary.expected 
                          ? `$${candidate.salary.expected.toLocaleString()}`
                          : 'Salary not disclosed'
                        }
                      </span>
                      {(() => {
                        const lastComm = getLastCommunication(candidate.id)
                        return lastComm ? (
                          <div className="flex items-center space-x-1 text-xs">
                            {lastComm.type === 'email' && <Mail className="h-3 w-3 text-blue-400" />}
                            {lastComm.type === 'call' && <Phone className="h-3 w-3 text-neon-green" />}
                            {lastComm.type === 'meeting' && <Calendar className="h-3 w-3 text-neon-purple" />}
                            {lastComm.type === 'note' && <FileText className="h-3 w-3 text-yellow-400" />}
                            {(lastComm.type === 'linkedin' || lastComm.type === 'text') && <MessageSquare className="h-3 w-3 text-neon-blue" />}
                            <span>{formatTimeSince(lastComm.date)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-dark-400">No contact</span>
                        )
                      })()
                      }
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
                      {candidate.status}
                    </span>
                    <span className="text-xs text-dark-300">
                      {getCandidateCommunications(candidate.id).length} interactions
                    </span>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCandidateForComm(candidate)
                        }}
                        className="p-2 text-dark-300 hover:text-neon-blue transition-colors"
                        title="View communications"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddCommunication(candidate.id)
                        }}
                        className="p-2 text-dark-300 hover:text-accent-500 transition-colors"
                        title="Add communication"
                      >
                        <Plus className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Communication Log Modal */}
      {selectedCandidateForComm && !showCommunicationForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CommunicationLog
              candidateId={selectedCandidateForComm.id}
              candidateName={`${selectedCandidateForComm.firstName} ${selectedCandidateForComm.lastName}`}
              communications={getCandidateCommunications(selectedCandidateForComm.id)}
              onAddCommunication={() => setShowCommunicationForm(true)}
              onClose={() => setSelectedCandidateForComm(null)}
            />
          </div>
        </div>
      )}

      {/* Add Communication Form */}
      <AddCommunicationForm
        candidateName={selectedCandidateForComm ? `${selectedCandidateForComm.firstName} ${selectedCandidateForComm.lastName}` : ''}
        onSave={handleSaveCommunication}
        onCancel={() => {
          setShowCommunicationForm(false)
          if (!selectedCandidateForComm || showCommunicationForm) {
            setSelectedCandidateForComm(null)
          }
        }}
        isOpen={showCommunicationForm}
      />
    </div>
  )
}

export default CandidatesList