import { motion } from 'framer-motion'
import { 
  Brain, 
  Zap, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { mockSmartInsights, mockAIUsageMetrics } from '../data/mockAI'

interface QuickInsightsProps {
  onNavigateToAI?: () => void
}

const QuickInsights = ({ onNavigateToAI }: QuickInsightsProps) => {
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

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* AI Performance Highlight */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 shadow-black/20 cursor-pointer"
        onClick={onNavigateToAI}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">AI Performance</h3>
              <p className="text-purple-400 text-sm">Smart recruitment automation</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-white/50" />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">
              {mockAIUsageMetrics.features.resumeParsing.timesSaved + mockAIUsageMetrics.features.screening.timesSaved}h
            </p>
            <p className="text-white/70 text-xs">Time saved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {mockAIUsageMetrics.features.resumeParsing.requests}
            </p>
            <p className="text-white/70 text-xs">Resumes processed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {Math.round(mockAIUsageMetrics.features.screening.accuracy * 100)}%
            </p>
            <p className="text-white/70 text-xs">Screening accuracy</p>
          </div>
        </div>
      </motion.div>

      {/* Quick AI Insights */}
      <motion.div
        variants={itemVariants}
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-black/20 overflow-hidden"
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-400" />
              <h3 className="text-white font-medium">Smart Insights</h3>
            </div>
            <button 
              onClick={onNavigateToAI}
              className="text-purple-400 text-xs hover:text-purple-300 transition-colors"
            >
              View All
            </button>
          </div>
        </div>
        <div className="divide-y divide-white/10 max-h-64 overflow-y-auto">
          {mockSmartInsights.slice(0, 3).map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 h-6 w-6 rounded-lg flex items-center justify-center ${
                  insight.priority === 'high' ? 'bg-red-500/20' :
                  insight.priority === 'medium' ? 'bg-yellow-500/20' :
                  'bg-blue-500/20'
                }`}>
                  {insight.type === 'trend_alert' ? <AlertTriangle className="h-3 w-3 text-red-400" /> :
                   insight.type === 'recommendation' ? <Zap className="h-3 w-3 text-yellow-400" /> :
                   <CheckCircle className="h-3 w-3 text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white text-sm font-medium truncate">{insight.title}</h4>
                    <span className={`text-xs font-semibold ${
                      insight.trend === 'up' ? 'text-green-400' :
                      insight.trend === 'down' ? 'text-red-400' :
                      'text-white'
                    }`}>
                      {insight.value}
                    </span>
                  </div>
                  <p className="text-white/70 text-xs mt-1 line-clamp-2">{insight.description}</p>
                  {insight.actions && insight.actions.length > 0 && (
                    <button className="mt-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded hover:bg-blue-500/30 transition-colors">
                      {insight.actions[0].label}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Features Summary */}
      <motion.div
        variants={itemVariants}
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-black/20"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium">AI Features Active</h3>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs">Live</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(mockAIUsageMetrics.features).slice(0, 4).map(([feature, usage]) => (
            <div key={feature} className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/80 text-xs capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-purple-400 text-xs">{(usage.accuracy * 100).toFixed(0)}% acc</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">{usage.requests} requests</span>
                <span className="text-blue-400 text-xs">{(usage.accuracy * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={onNavigateToAI}
          className="w-full mt-3 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 text-sm rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <Brain className="h-4 w-4" />
          <span>Manage AI Features</span>
        </button>
      </motion.div>
    </motion.div>
  )
}

export default QuickInsights