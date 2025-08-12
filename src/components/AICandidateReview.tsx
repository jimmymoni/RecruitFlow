import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Sparkles, TrendingUp, AlertCircle, CheckCircle, Clock, Star,
  User, Briefcase, GraduationCap, MapPin, Calendar, Award, Target,
  Zap, Eye, ThumbsUp, ThumbsDown, MessageSquare, Send, Filter,
  BarChart3, Lightbulb, Workflow, Brain, Search, X, ChevronDown,
  FileText, Video, Phone, Mail, Globe, Github, Linkedin
} from 'lucide-react'

interface CandidateProfile {
  id: string
  name: string
  email: string
  phone: string
  location: string
  title: string
  experience_years: number
  education: string
  skills: string[]
  resume_url?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  applied_at: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'interviewed'
  ai_analysis?: AIAnalysis
}

interface AIAnalysis {
  fit_score: number
  confidence: number
  strengths: string[]
  concerns: string[]
  recommendations: string[]
  skill_match: {
    required: string[]
    matched: string[]
    missing: string[]
    bonus: string[]
  }
  experience_relevance: number
  culture_fit_score: number
  growth_potential: number
  interview_questions: string[]
  next_steps: string[]
  comparison_rank?: number
  red_flags?: string[]
  green_flags?: string[]
}

interface JobRequirement {
  id: string
  title: string
  required_skills: string[]
  experience_min: number
  location: string
  type: 'full-time' | 'part-time' | 'contract'
  priority: 'urgent' | 'high' | 'medium' | 'low'
}

const AICandidateReview: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null)
  const [activeJob, setActiveJob] = useState<JobRequirement | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiProcessing, setAIProcessing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'high-fit' | 'requires-review'>('all')
  const [reviewNote, setReviewNote] = useState('')
  const [showInsights, setShowInsights] = useState(true)

  useEffect(() => {
    loadCandidatesAndJob()
  }, [])

  const loadCandidatesAndJob = async () => {
    // Mock data for demonstration
    const mockJob: JobRequirement = {
      id: '1',
      title: 'Senior React Developer',
      required_skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
      experience_min: 5,
      location: 'San Francisco, CA',
      type: 'full-time',
      priority: 'high'
    }

    const mockCandidates: CandidateProfile[] = [
      {
        id: '1',
        name: 'Alex Chen',
        email: 'alex.chen@email.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        title: 'Senior Frontend Developer',
        experience_years: 6,
        education: 'BS Computer Science - Stanford University',
        skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Python', 'Docker'],
        linkedin_url: 'https://linkedin.com/in/alexchen',
        github_url: 'https://github.com/alexchen',
        applied_at: new Date(Date.now() - 86400000).toISOString(),
        status: 'pending',
        ai_analysis: {
          fit_score: 94,
          confidence: 92,
          strengths: [
            'Perfect technical skill match with 6 years React experience',
            'Strong TypeScript and Node.js background',
            'AWS certified with production deployment experience',
            'Stanford CS degree with excellent academic foundation',
            'Active GitHub with high-quality open source contributions'
          ],
          concerns: [
            'Currently in San Francisco - may require relocation discussion',
            'No explicit GraphQL experience mentioned in recent projects'
          ],
          recommendations: [
            'Fast-track to technical interview - top 5% candidate',
            'Discuss remote work options given location match',
            'Focus interview on GraphQL and system design',
            'Consider for senior or lead role given experience'
          ],
          skill_match: {
            required: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
            matched: ['React', 'TypeScript', 'Node.js', 'AWS'],
            missing: ['GraphQL'],
            bonus: ['Python', 'Docker']
          },
          experience_relevance: 95,
          culture_fit_score: 88,
          growth_potential: 91,
          interview_questions: [
            'Describe your experience building scalable React applications',
            'How do you approach TypeScript in large codebases?',
            'Tell us about a challenging AWS deployment you\'ve handled',
            'What\'s your experience with GraphQL vs REST APIs?'
          ],
          next_steps: [
            'Schedule technical interview within 48 hours',
            'Send technical challenge focused on React/TypeScript',
            'Arrange culture fit call with team lead',
            'Prepare offer package if technical interview passes'
          ],
          comparison_rank: 1,
          green_flags: [
            'Top university education',
            'Active open source contributor',
            'AWS certified',
            'Located in target market'
          ]
        }
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+1 (555) 987-6543',
        location: 'Austin, TX',
        title: 'Full Stack Developer',
        experience_years: 4,
        education: 'BS Software Engineering - UT Austin',
        skills: ['React', 'JavaScript', 'Node.js', 'PostgreSQL', 'Docker'],
        linkedin_url: 'https://linkedin.com/in/sarahjohnson',
        applied_at: new Date(Date.now() - 172800000).toISOString(),
        status: 'reviewing',
        ai_analysis: {
          fit_score: 76,
          confidence: 84,
          strengths: [
            'Solid React and Node.js foundation',
            'Full-stack experience with database management',
            'Strong problem-solving skills demonstrated in portfolio'
          ],
          concerns: [
            'No TypeScript experience - major skill gap',
            'Missing AWS/cloud experience',
            'Below minimum 5 years experience requirement'
          ],
          recommendations: [
            'Consider for mid-level position instead',
            'Assess TypeScript learning ability during interview',
            'Evaluate potential for rapid skill development'
          ],
          skill_match: {
            required: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
            matched: ['React', 'Node.js'],
            missing: ['TypeScript', 'GraphQL', 'AWS'],
            bonus: ['PostgreSQL', 'Docker']
          },
          experience_relevance: 72,
          culture_fit_score: 85,
          growth_potential: 89,
          interview_questions: [
            'How do you approach learning new technologies like TypeScript?',
            'Describe your experience with React state management',
            'What interests you about cloud technologies?'
          ],
          next_steps: [
            'Phone screening to assess learning mindset',
            'Consider for junior/mid-level role',
            'Evaluate training program fit'
          ],
          comparison_rank: 3,
          red_flags: [
            'Below experience requirement',
            'Missing core TypeScript skill'
          ]
        }
      },
      {
        id: '3',
        name: 'Marcus Rodriguez',
        email: 'marcus.r@email.com',
        phone: '+1 (555) 456-7890',
        location: 'Remote',
        title: 'React Specialist',
        experience_years: 8,
        education: 'MS Computer Science - MIT',
        skills: ['React', 'TypeScript', 'GraphQL', 'Redux', 'Jest', 'Cypress'],
        github_url: 'https://github.com/marcusr',
        portfolio_url: 'https://marcusrodriguez.dev',
        applied_at: new Date(Date.now() - 259200000).toISOString(),
        status: 'approved',
        ai_analysis: {
          fit_score: 87,
          confidence: 89,
          strengths: [
            'Extensive React expertise with 8 years experience',
            'Strong TypeScript and GraphQL skills',
            'MIT education with advanced CS knowledge',
            'Remote work experience - fits distributed team'
          ],
          concerns: [
            'Limited Node.js backend experience',
            'No AWS experience mentioned',
            'Heavy focus on frontend - may lack full-stack depth'
          ],
          recommendations: [
            'Excellent for frontend-focused senior role',
            'Pair with strong backend engineer',
            'Assess backend learning interest'
          ],
          skill_match: {
            required: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
            matched: ['React', 'TypeScript', 'GraphQL'],
            missing: ['Node.js', 'AWS'],
            bonus: ['Redux', 'Jest', 'Cypress']
          },
          experience_relevance: 90,
          culture_fit_score: 82,
          growth_potential: 78,
          interview_questions: [
            'How do you approach complex React application architecture?',
            'Describe your experience with GraphQL implementation',
            'What\'s your interest in expanding to backend technologies?'
          ],
          next_steps: [
            'Schedule technical interview',
            'Focus on React architecture discussion',
            'Assess full-stack potential'
          ],
          comparison_rank: 2,
          green_flags: [
            'MIT education',
            'Remote work ready',
            'Strong testing background'
          ]
        }
      }
    ]

    setActiveJob(mockJob)
    setCandidates(mockCandidates)
    setSelectedCandidate(mockCandidates[0])
    setLoading(false)
  }

  const triggerAIAnalysis = async (candidateId: string) => {
    setAIProcessing(true)
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update candidate with new AI insights
    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId 
        ? { ...candidate, status: 'reviewing' as const }
        : candidate
    ))
    setAIProcessing(false)
  }

  const updateCandidateStatus = (candidateId: string, newStatus: CandidateProfile['status']) => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId 
        ? { ...candidate, status: newStatus }
        : candidate
    ))
  }

  const getFilteredCandidates = () => {
    return candidates.filter(candidate => {
      switch (filter) {
        case 'pending': return candidate.status === 'pending'
        case 'high-fit': return candidate.ai_analysis && candidate.ai_analysis.fit_score >= 85
        case 'requires-review': return candidate.status === 'reviewing'
        default: return true
      }
    })
  }

  const getFitScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30'
    if (score >= 80) return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    if (score >= 70) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    return 'text-red-400 bg-red-500/20 border-red-500/30'
  }

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Loading AI Candidate Review...</div>
          <div className="text-gray-400 text-sm mt-2">Analyzing candidate profiles with AI</div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex">
      {/* Candidates Sidebar */}
      <motion.div 
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">AI Review</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => triggerAIAnalysis('all')}
              disabled={aiProcessing}
              className="flex items-center space-x-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-2 py-1 rounded text-xs transition-colors border border-purple-500/30"
            >
              {aiProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full"
                />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              <span>Analyze All</span>
            </motion.button>
          </div>

          {/* Job Context */}
          {activeJob && (
            <div className="bg-slate-700/50 rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium text-sm">{activeJob.title}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  activeJob.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                  activeJob.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {activeJob.priority}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {activeJob.experience_min}+ years • {activeJob.location}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {activeJob.required_skills.slice(0, 3).map(skill => (
                  <span key={skill} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                    {skill}
                  </span>
                ))}
                {activeJob.required_skills.length > 3 && (
                  <span className="px-1.5 py-0.5 bg-slate-600/50 text-slate-400 text-xs rounded">
                    +{activeJob.required_skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'All', count: candidates.length },
              { key: 'pending', label: 'Pending', count: candidates.filter(c => c.status === 'pending').length },
              { key: 'high-fit', label: 'High Fit', count: candidates.filter(c => c.ai_analysis && c.ai_analysis.fit_score >= 85).length },
              { key: 'requires-review', label: 'Review', count: candidates.filter(c => c.status === 'reviewing').length }
            ].map(filterOption => (
              <motion.button
                key={filterOption.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(filterOption.key as any)}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-all ${
                  filter === filterOption.key
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span>{filterOption.label}</span>
                <span className="bg-slate-600 text-white px-1 rounded text-xs">
                  {filterOption.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {getFilteredCandidates().map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedCandidate(candidate)}
                className={`p-4 border-b border-slate-700/50 cursor-pointer transition-all ${
                  selectedCandidate?.id === candidate.id 
                    ? 'bg-purple-500/10 border-l-2 border-l-purple-500' 
                    : 'hover:bg-slate-700/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm">{candidate.name}</h3>
                    <p className="text-slate-400 text-xs">{candidate.title}</p>
                  </div>
                  {candidate.ai_analysis && (
                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getFitScoreColor(candidate.ai_analysis.fit_score)}`}>
                      {candidate.ai_analysis.fit_score}%
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(candidate.applied_at).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{candidate.location}</span>
                    </span>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                    candidate.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    candidate.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    candidate.status === 'reviewing' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {candidate.status}
                  </div>
                </div>

                {candidate.ai_analysis && (
                  <div className="mt-2 flex items-center space-x-2">
                    {candidate.ai_analysis.comparison_rank && (
                      <span className="flex items-center space-x-1 text-xs text-purple-400">
                        <Star className="w-3 h-3" />
                        <span>Rank #{candidate.ai_analysis.comparison_rank}</span>
                      </span>
                    )}
                    {candidate.ai_analysis.green_flags && candidate.ai_analysis.green_flags.length > 0 && (
                      <span className="flex items-center space-x-1 text-xs text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        <span>{candidate.ai_analysis.green_flags.length} strengths</span>
                      </span>
                    )}
                    {candidate.ai_analysis.red_flags && candidate.ai_analysis.red_flags.length > 0 && (
                      <span className="flex items-center space-x-1 text-xs text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        <span>{candidate.ai_analysis.red_flags.length} concerns</span>
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedCandidate ? (
          <>
            {/* Header */}
            <motion.div 
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium shadow-lg">
                    {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{selectedCandidate.name}</h1>
                    <p className="text-slate-400">{selectedCandidate.title} • {selectedCandidate.experience_years} years exp</p>
                  </div>
                  {selectedCandidate.ai_analysis && (
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-lg font-medium border ${getFitScoreColor(selectedCandidate.ai_analysis.fit_score)}`}>
                        {selectedCandidate.ai_analysis.fit_score}% Fit
                      </div>
                      <div className="flex items-center space-x-1 text-slate-400 text-sm">
                        <Brain className="w-4 h-4" />
                        <span>{selectedCandidate.ai_analysis.confidence}% confidence</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {[
                    { icon: Mail, color: 'hover:text-blue-400', action: () => window.open(`mailto:${selectedCandidate.email}`) },
                    { icon: Phone, color: 'hover:text-green-400', action: () => window.open(`tel:${selectedCandidate.phone}`) },
                    { icon: Linkedin, color: 'hover:text-blue-600', action: () => selectedCandidate.linkedin_url && window.open(selectedCandidate.linkedin_url) },
                    { icon: Github, color: 'hover:text-gray-400', action: () => selectedCandidate.github_url && window.open(selectedCandidate.github_url) }
                  ].map(({ icon: Icon, color, action }, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={action}
                      className={`p-2 text-slate-400 ${color} hover:bg-slate-700/50 rounded transition-all`}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.button>
                  ))}
                  
                  <div className="flex space-x-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateCandidateStatus(selectedCandidate.id, 'approved')}
                      className="flex items-center space-x-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded transition-colors border border-green-500/30"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Approve</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateCandidateStatus(selectedCandidate.id, 'rejected')}
                      className="flex items-center space-x-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded transition-colors border border-red-500/30"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Reject</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedCandidate.ai_analysis ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* AI Analysis */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Fit Analysis */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"
                    >
                      <div className="flex items-center space-x-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        <h2 className="text-lg font-semibold text-white">AI Fit Analysis</h2>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                          { label: 'Overall Fit', value: selectedCandidate.ai_analysis.fit_score, color: 'purple' },
                          { label: 'Experience', value: selectedCandidate.ai_analysis.experience_relevance, color: 'blue' },
                          { label: 'Culture Fit', value: selectedCandidate.ai_analysis.culture_fit_score, color: 'green' }
                        ].map(({ label, value, color }) => (
                          <div key={label} className="text-center">
                            <div className={`w-16 h-16 mx-auto mb-2 rounded-full border-4 border-${color}-500/30 flex items-center justify-center bg-${color}-500/10`}>
                              <span className={`text-${color}-400 font-bold text-lg`}>{value}%</span>
                            </div>
                            <div className="text-slate-400 text-sm">{label}</div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-green-400 font-medium mb-2 flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>Strengths</span>
                          </h3>
                          <ul className="space-y-1">
                            {selectedCandidate.ai_analysis.strengths.map((strength, index) => (
                              <li key={index} className="text-slate-300 text-sm flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-yellow-400 font-medium mb-2 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>Concerns</span>
                          </h3>
                          <ul className="space-y-1">
                            {selectedCandidate.ai_analysis.concerns.map((concern, index) => (
                              <li key={index} className="text-slate-300 text-sm flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                                <span>{concern}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>

                    {/* Skill Analysis */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"
                    >
                      <div className="flex items-center space-x-2 mb-4">
                        <Target className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">Skill Match Analysis</h2>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-green-400 font-medium mb-2">Matched Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedCandidate.ai_analysis.skill_match.matched.map(skill => (
                              <span key={skill} className="px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded border border-green-500/30">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-red-400 font-medium mb-2">Missing Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedCandidate.ai_analysis.skill_match.missing.map(skill => (
                              <span key={skill} className="px-2 py-1 bg-red-500/20 text-red-400 text-sm rounded border border-red-500/30">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-purple-400 font-medium mb-2">Bonus Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedCandidate.ai_analysis.skill_match.bonus.map(skill => (
                              <span key={skill} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-sm rounded border border-purple-500/30">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Interview Questions */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"
                    >
                      <div className="flex items-center space-x-2 mb-4">
                        <MessageSquare className="w-5 h-5 text-orange-400" />
                        <h2 className="text-lg font-semibold text-white">AI-Generated Interview Questions</h2>
                      </div>

                      <div className="space-y-3">
                        {selectedCandidate.ai_analysis.interview_questions.map((question, index) => (
                          <div key={index} className="p-3 bg-slate-700/30 rounded-lg border-l-2 border-orange-500/50">
                            <p className="text-slate-200">{question}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"
                    >
                      <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span>Quick Actions</span>
                      </h3>

                      <div className="space-y-2">
                        {[
                          { label: 'Schedule Interview', icon: Calendar, color: 'blue' },
                          { label: 'Send Assessment', icon: FileText, color: 'purple' },
                          { label: 'Video Call', icon: Video, color: 'green' },
                          { label: 'Add to Pipeline', icon: Workflow, color: 'orange' }
                        ].map(({ label, icon: Icon, color }) => (
                          <motion.button
                            key={label}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-all text-${color}-400 hover:bg-${color}-500/10 border border-transparent hover:border-${color}-500/30`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Next Steps */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"
                    >
                      <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <span>AI Recommendations</span>
                      </h3>

                      <div className="space-y-3">
                        {selectedCandidate.ai_analysis.next_steps.map((step, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-purple-400 text-xs font-medium">{index + 1}</span>
                            </div>
                            <p className="text-slate-300 text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Review Notes */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"
                    >
                      <h3 className="text-white font-semibold mb-4">Review Notes</h3>
                      <textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Add your review notes..."
                        className="w-full h-24 bg-slate-700/50 border border-slate-600/50 rounded-lg p-3 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full mt-3 flex items-center justify-center space-x-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 py-2 rounded-lg transition-colors border border-purple-500/30"
                      >
                        <Send className="w-4 h-4" />
                        <span>Save Notes</span>
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex items-center justify-center"
                >
                  <div className="text-center">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <h3 className="text-xl font-semibold mb-2 text-white">AI Analysis Pending</h3>
                    <p className="text-slate-400 mb-6">This candidate hasn't been analyzed yet.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => triggerAIAnalysis(selectedCandidate.id)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg mx-auto hover:shadow-lg transition-all"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Run AI Analysis</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center text-slate-400">
              <Users className="w-20 h-20 mx-auto mb-4 text-slate-500" />
              <h3 className="text-2xl font-bold mb-2 text-white">Select a Candidate</h3>
              <p>Choose a candidate from the sidebar to view AI analysis and insights.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AICandidateReview