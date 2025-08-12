import { useState, useEffect } from 'react'
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
  FileText,
  RefreshCw,
  AlertCircle,
  Save,
  X,
  Brain,
  Upload,
  Loader,
  CheckCircle,
  Zap
} from 'lucide-react'
import { 
  getCandidates, 
  createCandidate, 
  updateCandidate, 
  deleteCandidate,
  CandidateData,
  CandidatesResponse 
} from '../services/api'
import { parseResume, parseResumeWithAI, ParsedResumeData } from '../services/aiService'
// Note: We'll use an inline form instead of the complex CandidateForm component

const CandidatesListAPI = () => {
  const [candidates, setCandidates] = useState<CandidateData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    status: 'new',
    summary: '',
    skills: [] as string[]
  })
  
  // AI Resume Parsing State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isParsingAI, setIsParsingAI] = useState(false)
  const [parseResult, setParseResult] = useState<ParsedResumeData | null>(null)
  const [showAISection, setShowAISection] = useState(false)

  // Load candidates from API
  const loadCandidates = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(true)
      setError(null)
      
      const params: any = { page, limit: 20 }
      if (search) params.search = search
      if (status !== 'all') params.status = status
      
      const response: CandidatesResponse = await getCandidates(params)
      
      setCandidates(response.candidates)
      setTotalPages(response.pagination.pages)
      setCurrentPage(response.pagination.page)
    } catch (err: any) {
      console.error('Failed to load candidates:', err)
      setError(err.message || 'Failed to load candidates')
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }

  // Load candidates on component mount and when filters change
  useEffect(() => {
    loadCandidates(currentPage, searchTerm, selectedStatus)
  }, [currentPage, searchTerm, selectedStatus])

  // Handle search with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        loadCandidates(1, searchTerm, selectedStatus)
      } else {
        setCurrentPage(1) // This will trigger loadCandidates via the other useEffect
      }
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  // Handle status filter change
  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  // Handle candidate deletion
  const handleDeleteCandidate = async (candidateId: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return
    
    try {
      await deleteCandidate(candidateId)
      await loadCandidates(currentPage, searchTerm, selectedStatus)
    } catch (err: any) {
      setError(err.message || 'Failed to delete candidate')
    }
  }

  // Handle adding a new candidate
  const handleAddCandidate = async () => {
    try {
      await createCandidate(formData)
      await loadCandidates(currentPage, searchTerm, selectedStatus)
      setShowAddForm(false)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        status: 'new',
        summary: '',
        skills: []
      })
      // Reset AI state
      setUploadedFile(null)
      setParseResult(null)
      setShowAISection(false)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to create candidate')
    }
  }

  // Handle file upload for AI parsing
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file type
      const validTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF, DOC, DOCX, or TXT file')
        return
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      
      setUploadedFile(file)
      setShowAISection(true)
      setError(null)
    }
  }

  // Handle AI parsing
  const handleParseWithAI = async () => {
    if (!uploadedFile) return
    
    setIsParsingAI(true)
    setError(null)
    
    try {
      // For demo, use mock parsing. In production, use real AI
      const result = await parseResume(uploadedFile)
      setParseResult(result)
    } catch (err: any) {
      setError(err.message || 'Failed to parse resume with AI')
    } finally {
      setIsParsingAI(false)
    }
  }

  // Apply AI parsed data to form
  const applyParsedData = () => {
    if (!parseResult) return
    
    setFormData({
      firstName: parseResult.firstName || '',
      lastName: parseResult.lastName || '',
      email: parseResult.email || '',
      phone: parseResult.phone || '',
      location: parseResult.location || '',
      status: 'new',
      summary: parseResult.summary || '',
      skills: parseResult.skills || []
    })
  }

  // Handle bulk selection
  const handleSelectCandidate = (candidateId: string) => {
    const newSelected = new Set(selectedCandidates)
    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId)
    } else {
      newSelected.add(candidateId)
    }
    setSelectedCandidates(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedCandidates.size === candidates.length) {
      setSelectedCandidates(new Set())
    } else {
      setSelectedCandidates(new Set(candidates.map(c => c.id!)))
    }
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      screening: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      interview: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      offer: 'bg-green-500/20 text-green-400 border-green-500/30',
      hired: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      withdrawn: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return colors[status as keyof typeof colors] || colors.new
  }

  // Render loading state
  if (loading && candidates.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Loading Candidates</h3>
              <p className="text-gray-400">Fetching candidate data from the database...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-dark-800/80 backdrop-blur-xl border-b border-dark-600 shadow-premium sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-neon-blue to-primary-500 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Candidates</h1>
                <p className="text-dark-200">
                  {loading ? 'Loading...' : `${candidates.length} candidates found`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => loadCandidates(currentPage, searchTerm, selectedStatus)}
                className="flex items-center space-x-2 bg-dark-600 hover:bg-dark-500 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-neon-blue to-primary-600 text-white px-4 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
                <span>Add Candidate</span>
              </motion.button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-dark-400" />
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedCandidates.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-dark-300">
                  {selectedCandidates.size} selected
                </span>
                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-300 hover:text-red-100"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Candidates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {candidates.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-dark-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-200 mb-2">No Candidates Found</h3>
            <p className="text-dark-400 mb-6">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first candidate'
              }
            </p>
            <button className="bg-gradient-to-r from-neon-blue to-primary-600 text-white px-6 py-3 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300">
              Add First Candidate
            </button>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center space-x-2 mb-6">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 text-dark-300 hover:text-white transition-colors"
              >
                {selectedCandidates.size === candidates.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span className="text-sm">Select All</span>
              </button>
            </div>

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl shadow-premium border border-dark-600 hover:border-neon-blue/50 hover:shadow-glow backdrop-blur-sm p-6 relative group"
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-4 left-4">
                    <button
                      onClick={() => handleSelectCandidate(candidate.id!)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {selectedCandidates.has(candidate.id!) ? (
                        <CheckSquare className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Square className="h-4 w-4 text-dark-400" />
                      )}
                    </button>
                  </div>

                  {/* Actions Menu */}
                  <div className="absolute top-4 right-4">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-dark-600 rounded-lg">
                      <MoreVertical className="h-4 w-4 text-dark-400" />
                    </button>
                  </div>

                  {/* Candidate Info */}
                  <div className="mt-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {candidate.firstName} {candidate.lastName}
                        </h3>
                        <div className="flex items-center space-x-2 text-dark-300 mb-2">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{candidate.email}</span>
                        </div>
                        {candidate.phone && (
                          <div className="flex items-center space-x-2 text-dark-300 mb-2">
                            <Phone className="h-4 w-4" />
                            <span className="text-sm">{candidate.phone}</span>
                          </div>
                        )}
                        {candidate.location && (
                          <div className="flex items-center space-x-2 text-dark-300">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{candidate.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status || 'new')}`}>
                        {(candidate.status || 'new').charAt(0).toUpperCase() + (candidate.status || 'new').slice(1)}
                      </span>
                    </div>

                    {/* Summary */}
                    {candidate.summary && (
                      <p className="text-dark-200 text-sm mb-4 line-clamp-2">
                        {candidate.summary}
                      </p>
                    )}

                    {/* Skills */}
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-2 py-1 bg-neon-blue/20 text-neon-blue text-xs rounded-full border border-neon-blue/30"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span className="px-2 py-1 bg-dark-600 text-dark-300 text-xs rounded-full">
                              +{candidate.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-dark-600">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-dark-400 hover:text-neon-blue hover:bg-neon-blue/10 rounded-lg transition-all duration-200"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-dark-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-dark-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-all duration-200"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteCandidate(candidate.id!)}
                          className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                      {candidate.createdAt && (
                        <div className="flex items-center space-x-1 text-dark-500 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(candidate.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-dark-700 border border-dark-600 text-white hover:bg-dark-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Loading Overlay for Actions */}
      {loading && candidates.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-white">Loading...</span>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl border border-dark-600 shadow-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-600">
              <h2 className="text-xl font-bold text-white">Add New Candidate</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* AI Resume Parsing Section */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Brain className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">AI Resume Parser</h3>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">BETA</span>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  Upload a resume and let our AI extract candidate information automatically
                </p>
                
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="h-8 w-8 text-purple-400" />
                      <span className="text-white font-medium">Upload Resume</span>
                      <span className="text-sm text-gray-400">PDF, DOC, DOCX, or TXT (max 5MB)</span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-400">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null)
                          setParseResult(null)
                          setShowAISection(false)
                        }}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {!parseResult ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleParseWithAI}
                        disabled={isParsingAI}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3 rounded-lg disabled:opacity-50 transition-all duration-300"
                      >
                        {isParsingAI ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            <span>Parsing with AI...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            <span>Parse with AI</span>
                          </>
                        )}
                      </motion.button>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <span className="text-green-400 font-medium">
                              Parsing Complete ({Math.round(parseResult.confidence * 100)}% confidence)
                            </span>
                          </div>
                          <div className="text-sm text-gray-300">
                            <p><strong>Name:</strong> {parseResult.firstName} {parseResult.lastName}</p>
                            <p><strong>Email:</strong> {parseResult.email}</p>
                            <p><strong>Phone:</strong> {parseResult.phone}</p>
                            <p><strong>Location:</strong> {parseResult.location}</p>
                            <p><strong>Skills:</strong> {parseResult.skills.join(', ')}</p>
                          </div>
                        </div>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={applyParsedData}
                          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-300"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Apply to Form</span>
                        </motion.button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddCandidate(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Smith"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="john.smith@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="screening">Screening</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Summary</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the candidate's background and skills..."
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 bg-gradient-to-r from-neon-blue to-primary-600 text-white px-6 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Candidate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex items-center space-x-2 bg-dark-600 hover:bg-dark-500 text-white px-6 py-2 rounded-lg transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CandidatesListAPI