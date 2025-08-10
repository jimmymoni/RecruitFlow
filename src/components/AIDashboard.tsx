import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  Zap,
  CheckCircle,
  AlertTriangle,
  Filter,
  BarChart3,
  FileText,
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  Shield,
  Clock,
  Award,
  TrendingUp,
  TrendingDown,
  UserCheck
} from 'lucide-react'
import { 
  mockAIUsageMetrics, 
  mockSmartInsights, 
  mockResumeParsingResults 
} from '../data/mockAI'

const AIDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'parsing' | 'screening' | 'insights'>('overview')

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

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`

  const renderOverview = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* AI Performance Hero */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 shadow-black/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI-Powered Recruitment</h2>
              <p className="text-purple-400 font-medium">Intelligent automation for faster hiring</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-purple-400">
              {mockAIUsageMetrics.features.resumeParsing.timesSaved + mockAIUsageMetrics.features.screening.timesSaved}h
            </p>
            <p className="text-white/70 text-sm">time saved this month</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">Resumes Processed</p>
            <p className="text-2xl font-bold text-white">{mockAIUsageMetrics.features.resumeParsing.requests}</p>
            <p className="text-blue-400 text-xs">This month</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">Screening Accuracy</p>
            <p className="text-2xl font-bold text-white">{formatPercentage(mockAIUsageMetrics.features.screening.accuracy)}</p>
            <p className="text-green-400 text-xs">High precision</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">AI Insights</p>
            <p className="text-2xl font-bold text-white">{mockAIUsageMetrics.features.insights.requests}</p>
            <p className="text-purple-400 text-xs">Generated</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">Automation Success</p>
            <p className="text-2xl font-bold text-white">{formatPercentage(mockAIUsageMetrics.features.automation.accuracy)}</p>
            <p className="text-orange-400 text-xs">Reliable workflows</p>
          </div>
        </div>
      </motion.div>

      {/* AI Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(mockAIUsageMetrics.features).map(([feature, usage]) => (
          <motion.div
            key={feature}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20 hover:shadow-glow transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                feature === 'resumeParsing' ? 'bg-blue-500/20' :
                feature === 'screening' ? 'bg-green-500/20' :
                feature === 'insights' ? 'bg-purple-500/20' :
                'bg-orange-500/20'
              }`}>
                {feature === 'resumeParsing' ? <FileText className="h-6 w-6 text-blue-400" /> :
                 feature === 'screening' ? <UserCheck className="h-6 w-6 text-green-400" /> :
                 feature === 'insights' ? <Lightbulb className="h-6 w-6 text-purple-400" /> :
                 <Zap className="h-6 w-6 text-orange-400" />}
              </div>
              <div className="text-right">
                <Award className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
            
            <h3 className="text-white font-semibold mb-2 capitalize">
              {feature.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Processed</span>
                <span className="text-white font-medium">{usage.requests}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Accuracy</span>
                <span className="text-blue-400 font-medium">{formatPercentage(usage.accuracy)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Time Saved</span>
                <span className="text-purple-400 font-medium">{usage.timesSaved}h</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Smart Insights */}
      <motion.div
        variants={itemVariants}
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-black/20 overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">AI-Powered Insights</h3>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">Live Analysis</span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-white/10">
          {mockSmartInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      insight.priority === 'high' ? 'bg-red-500/20' :
                      insight.priority === 'medium' ? 'bg-yellow-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      {insight.type === 'trend_alert' ? <TrendingDown className="h-4 w-4 text-red-400" /> :
                       insight.type === 'recommendation' ? <Lightbulb className="h-4 w-4 text-yellow-400" /> :
                       <BarChart3 className="h-4 w-4 text-blue-400" />}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{insight.title}</h4>
                      <p className="text-white/80 text-sm">{insight.description}</p>
                    </div>
                  </div>
                  {insight.actions && (
                    <div className="flex items-center space-x-3 mt-3">
                      {insight.actions.map((action, i) => (
                        <button
                          key={i}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full hover:bg-blue-500/30 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${
                      insight.trend === 'up' ? 'text-green-400' :
                      insight.trend === 'down' ? 'text-red-400' :
                      'text-white'
                    }`}>
                      {insight.value}
                    </span>
                    {insight.trend && (
                      insight.trend === 'up' ? <ArrowUp className="h-4 w-4 text-green-400" /> :
                      <ArrowDown className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <p className="text-white/50 text-xs">
                    {new Date(insight.generatedAt).toLocaleDateString()}
                  </p>
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
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI-Powered Recruitment</h1>
                <p className="text-white/70">Intelligent automation for smarter hiring decisions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg">
                <span className="text-sm font-medium">Advanced AI Features Active</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-1 bg-black/20 backdrop-blur-xl border border-white/10 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'parsing', label: 'Resume Parsing', icon: FileText },
            { id: 'screening', label: 'Auto Screening', icon: Filter },
            { id: 'insights', label: 'Smart Insights', icon: Lightbulb }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-glow'
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
        {activeTab === 'parsing' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Resume Upload & Processing */}
            <motion.div
              variants={itemVariants}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Resume Parsing</h3>
                  <p className="text-white/70">AI-powered resume analysis and data extraction</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm">Processing Engine Active</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <FileText className="h-8 w-8 text-blue-400" />
                    <span className="text-2xl font-bold text-white">{mockAIUsageMetrics.features.resumeParsing.requests}</span>
                  </div>
                  <h4 className="text-white font-medium mb-1">Resumes Processed</h4>
                  <p className="text-white/60 text-sm">This month</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Target className="h-8 w-8 text-green-400" />
                    <span className="text-2xl font-bold text-white">{formatPercentage(mockAIUsageMetrics.features.resumeParsing.accuracy)}</span>
                  </div>
                  <h4 className="text-white font-medium mb-1">Extraction Accuracy</h4>
                  <p className="text-white/60 text-sm">Data points captured</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Clock className="h-8 w-8 text-purple-400" />
                    <span className="text-2xl font-bold text-white">1.2s</span>
                  </div>
                  <h4 className="text-white font-medium mb-1">Avg Processing Time</h4>
                  <p className="text-white/60 text-sm">Per resume</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Brain className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h5 className="text-white font-medium mb-1">Smart Extraction Features</h5>
                    <p className="text-white/70 text-sm mb-2">AI automatically extracts and structures key information:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        'Contact Details', 'Work Experience', 'Skills & Technologies', 'Education History',
                        'Certifications', 'Languages', 'Salary Expectations', 'Quality Scoring'
                      ].map(feature => (
                        <div key={feature} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span className="text-white/70 text-xs">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Recent Parsing Results */}
            <motion.div
              variants={itemVariants}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-black/20 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white">Recent Processing Results</h3>
                <p className="text-white/70">Latest AI-parsed resume data</p>
              </div>
              <div className="divide-y divide-white/10">
                {mockResumeParsingResults.map((result) => (
                  <div key={result.id} className="p-6 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{result.extractedData.personalInfo.name}</h4>
                          <p className="text-white/70 text-sm">{result.extractedData.personalInfo.email}</p>
                          <p className="text-white/60 text-xs">{result.extractedData.personalInfo.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg font-bold text-green-400">{result.qualityScore}/10</span>
                          <Award className="h-4 w-4 text-yellow-400" />
                        </div>
                        <p className="text-white/60 text-xs">Quality Score</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-white/70 text-xs mb-1">Experience</p>
                        <p className="text-white text-sm font-medium">{result.extractedData.experience[0]?.duration || 'N/A'}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-white/70 text-xs mb-1">Top Skill</p>
                        <p className="text-white text-sm font-medium">{result.extractedData.skills[0]?.name || 'N/A'}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-white/70 text-xs mb-1">Education</p>
                        <p className="text-white text-sm font-medium">{result.extractedData.education[0]?.degree || 'N/A'}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-white/70 text-xs mb-1">Confidence</p>
                        <p className="text-white text-sm font-medium">{formatPercentage(result.confidence)}</p>
                      </div>
                    </div>
                    
                    {result.aiInsights && (
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-purple-400 mt-0.5" />
                          <div>
                            <p className="text-white/80 text-sm font-medium mb-1">AI Insights</p>
                            <p className="text-white/70 text-xs mb-2">{result.extractedData.summary}</p>
                            <div className="flex flex-wrap gap-2">
                              {result.aiInsights.strengths.slice(0, 2).map((strength, i) => (
                                <span key={i} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                  {strength}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {activeTab === 'screening' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Auto-Screening Dashboard */}
            <motion.div
              variants={itemVariants}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Automated Screening</h3>
                  <p className="text-white/70">AI-powered candidate pre-screening and quality assessment</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 text-sm">Advanced Filters Active</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <UserCheck className="h-6 w-6 text-green-400" />
                    <span className="text-2xl font-bold text-white">{mockAIUsageMetrics.features.screening.requests}</span>
                  </div>
                  <h4 className="text-white font-medium mb-1">Candidates Screened</h4>
                  <p className="text-white/60 text-sm">This month</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="h-6 w-6 text-blue-400" />
                    <span className="text-2xl font-bold text-white">{formatPercentage(mockAIUsageMetrics.features.screening.accuracy)}</span>
                  </div>
                  <h4 className="text-white font-medium mb-1">Screening Accuracy</h4>
                  <p className="text-white/60 text-sm">Prediction quality</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="h-6 w-6 text-orange-400" />
                    <span className="text-2xl font-bold text-white">127</span>
                  </div>
                  <h4 className="text-white font-medium mb-1">AI-Generated Detected</h4>
                  <p className="text-white/60 text-sm">Auto-flagged resumes</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-6 w-6 text-purple-400" />
                    <span className="text-2xl font-bold text-white">{mockAIUsageMetrics.features.screening.timesSaved}h</span>
                  </div>
                  <h4 className="text-white font-medium mb-1">Time Saved</h4>
                  <p className="text-white/60 text-sm">Manual review avoided</p>
                </div>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h5 className="text-white font-medium mb-1">AI Detection Alert</h5>
                    <p className="text-white/70 text-sm mb-2">78% increase in AI-generated applications detected this week. Consider adjusting screening thresholds.</p>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded hover:bg-blue-500/30 transition-colors">
                        Adjust Filters
                      </button>
                      <button className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded hover:bg-yellow-500/30 transition-colors">
                        View Flagged
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {activeTab === 'insights' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Smart Insights Full View */}
            <motion.div
              variants={itemVariants}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-black/20 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">AI-Powered Insights</h3>
                    <p className="text-white/70">Real-time analysis and recommendations</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    <span className="text-purple-400 text-sm font-medium">Live Analysis</span>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-white/10">
                {mockSmartInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            insight.priority === 'high' ? 'bg-red-500/20' :
                            insight.priority === 'medium' ? 'bg-yellow-500/20' :
                            'bg-blue-500/20'
                          }`}>
                            {insight.type === 'trend_alert' ? <TrendingUp className="h-5 w-5 text-red-400" /> :
                             insight.type === 'recommendation' ? <Lightbulb className="h-5 w-5 text-yellow-400" /> :
                             <BarChart3 className="h-5 w-5 text-blue-400" />}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-lg">{insight.title}</h4>
                            <p className="text-white/80">{insight.description}</p>
                          </div>
                        </div>
                        
                        {insight.actions && (
                          <div className="flex items-center space-x-3 mt-4">
                            {insight.actions.map((action, i) => (
                              <button
                                key={i}
                                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="flex items-center space-x-2">
                          <span className={`text-2xl font-bold ${
                            insight.trend === 'up' ? 'text-green-400' :
                            insight.trend === 'down' ? 'text-red-400' :
                            'text-white'
                          }`}>
                            {insight.value}
                          </span>
                          {insight.trend && (
                            insight.trend === 'up' ? <ArrowUp className="h-5 w-5 text-green-400" /> :
                            <ArrowDown className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                        <p className="text-white/50 text-sm mt-1">
                          {new Date(insight.generatedAt).toLocaleDateString()}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                          insight.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {insight.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AIDashboard