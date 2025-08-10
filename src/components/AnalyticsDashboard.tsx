import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  Calendar,
  Award,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  Zap
} from 'lucide-react'
import { mockAnalyticsDashboard } from '../data/mockAnalytics'
import { AnalyticsDashboard as AnalyticsDashboardType } from '../types/analytics'

interface AnalyticsDashboardProps {
  data?: AnalyticsDashboardType
}

const AnalyticsDashboard = ({ data = mockAnalyticsDashboard }: AnalyticsDashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly')
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'revenue' | 'pipeline'>('overview')

  const { summary, detailed } = data

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getPerformanceColor = (value: number, benchmark: number, higherIsBetter: boolean = true) => {
    const isGood = higherIsBetter ? value >= benchmark : value <= benchmark
    return isGood ? 'text-green-400' : 'text-red-400'
  }

  const getPerformanceIcon = (value: number, benchmark: number, higherIsBetter: boolean = true) => {
    const isGood = higherIsBetter ? value >= benchmark : value <= benchmark
    return isGood ? <ArrowUp className="h-4 w-4 text-green-400" /> : <ArrowDown className="h-4 w-4 text-red-400" />
  }

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
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                <p className="text-white/70">Business intelligence and performance insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-1 bg-black/20 backdrop-blur-xl border border-white/10 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'team', label: 'Team Performance', icon: Users },
            { id: 'revenue', label: 'Revenue', icon: DollarSign },
            { id: 'pipeline', label: 'Pipeline', icon: Target }
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
        {activeTab === 'overview' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20 hover:shadow-glow transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {getPerformanceIcon(summary.revenue.revenueGrowth, 0)}
                    <span className={`text-sm font-medium ${getPerformanceColor(summary.revenue.revenueGrowth, 0)}`}>
                      +{summary.revenue.revenueGrowth}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {formatCurrency(summary.revenue.monthlyRevenue)}
                  </p>
                  <p className="text-white/70 text-sm">Monthly Revenue</p>
                  <p className="text-white/50 text-xs mt-2">
                    {formatCurrency(summary.revenue.totalRevenue)} total
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20 hover:shadow-glow transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {getPerformanceIcon(summary.placements.successRate, detailed.businessIntelligence.industryBenchmarks.averageSuccessRate)}
                    <span className={`text-sm font-medium ${getPerformanceColor(summary.placements.successRate, detailed.businessIntelligence.industryBenchmarks.averageSuccessRate)}`}>
                      {summary.placements.successRate}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">{summary.placements.monthlyPlacements}</p>
                  <p className="text-white/70 text-sm">Monthly Placements</p>
                  <p className="text-white/50 text-xs mt-2">
                    {summary.placements.totalPlacements} total this year
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20 hover:shadow-glow transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {getPerformanceIcon(summary.placements.averageTimeToFill, detailed.businessIntelligence.industryBenchmarks.averageTimeToFill, false)}
                    <span className={`text-sm font-medium ${getPerformanceColor(summary.placements.averageTimeToFill, detailed.businessIntelligence.industryBenchmarks.averageTimeToFill, false)}`}>
                      {summary.placements.averageTimeToFill} days
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">{summary.placements.averageTimeToFill}</p>
                  <p className="text-white/70 text-sm">Avg Time to Fill</p>
                  <p className="text-white/50 text-xs mt-2">
                    vs {detailed.businessIntelligence.industryBenchmarks.averageTimeToFill} industry avg
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20 hover:shadow-glow transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">Predicted</span>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {formatCurrency(detailed.businessIntelligence.predictions.nextMonthRevenue)}
                  </p>
                  <p className="text-white/70 text-sm">Projected Next Month</p>
                  <p className="text-white/50 text-xs mt-2">
                    +{detailed.businessIntelligence.predictions.quarterlyGrowth}% quarterly growth
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Goals Progress */}
            <motion.div
              variants={itemVariants}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Goal Progress</h3>
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <div className="space-y-4">
                {detailed.businessIntelligence.goals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white/90 font-medium">{goal.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white/70 text-sm">
                          {goal.current} / {goal.target}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          goal.status === 'on-track' ? 'bg-green-500/20 text-green-400' :
                          goal.status === 'at-risk' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {goal.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          goal.status === 'on-track' ? 'bg-green-400' :
                          goal.status === 'at-risk' ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Performers */}
            <motion.div
              variants={itemVariants}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Top Performers</h3>
                <Award className="h-5 w-5 text-gold" />
              </div>
              <div className="space-y-4">
                {summary.performance.slice(0, 3).map((member, index) => (
                  <div key={member.teamMember.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-gold text-dark-900' :
                        index === 1 ? 'bg-gray-300 text-dark-900' :
                        'bg-amber-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="text-xl">{member.teamMember.avatar}</div>
                      <div>
                        <p className="text-white font-medium">{member.teamMember.name}</p>
                        <p className="text-white/70 text-sm">{member.teamMember.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{member.metrics.totalPlacements} placements</p>
                      <p className="text-white/70 text-sm">{formatCurrency(member.metrics.totalRevenue)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">{member.metrics.successRate}%</p>
                      <p className="text-white/70 text-sm">success rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Team Performance Tab */}
        {activeTab === 'team' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Team Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                variants={itemVariants}
                className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{detailed.businessIntelligence.kpis.clientRetention}%</span>
                </div>
                <p className="text-white/90 font-medium">Team Efficiency</p>
                <p className="text-white/70 text-sm">Based on placement success</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-green-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{summary.placements.successRate}%</span>
                </div>
                <p className="text-white/90 font-medium">Team Success Rate</p>
                <p className="text-white/70 text-sm">Above industry average</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{summary.placements.averageTimeToFill}</span>
                </div>
                <p className="text-white/90 font-medium">Avg Time to Fill</p>
                <p className="text-white/70 text-sm">Days per placement</p>
              </motion.div>
            </div>

            {/* Detailed Team Performance Table */}
            <motion.div
              variants={itemVariants}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-black/20 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white">Team Performance Details</h3>
                <p className="text-white/70 text-sm">Individual metrics and rankings</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-4 text-white/80 font-medium">Member</th>
                      <th className="text-left p-4 text-white/80 font-medium">Placements</th>
                      <th className="text-left p-4 text-white/80 font-medium">Revenue</th>
                      <th className="text-left p-4 text-white/80 font-medium">Success Rate</th>
                      <th className="text-left p-4 text-white/80 font-medium">Time to Fill</th>
                      <th className="text-left p-4 text-white/80 font-medium">Satisfaction</th>
                      <th className="text-left p-4 text-white/80 font-medium">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.performance.map((member, index) => (
                      <motion.tr
                        key={member.teamMember.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-xl">{member.teamMember.avatar}</div>
                            <div>
                              <p className="text-white font-medium">{member.teamMember.name}</p>
                              <p className="text-white/70 text-sm">{member.teamMember.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-semibold">{member.metrics.totalPlacements}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              member.rankings.placementRank === 1 ? 'bg-gold/20 text-gold' :
                              member.rankings.placementRank === 2 ? 'bg-gray-300/20 text-gray-300' :
                              member.rankings.placementRank === 3 ? 'bg-amber-600/20 text-amber-400' :
                              'bg-white/10 text-white/70'
                            }`}>
                              #{member.rankings.placementRank}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-white font-medium">{formatCurrency(member.metrics.totalRevenue)}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-400 font-medium">{member.metrics.successRate}%</span>
                            {getPerformanceIcon(member.metrics.successRate, detailed.businessIntelligence.industryBenchmarks.averageSuccessRate)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${getPerformanceColor(member.metrics.averageTimeToFill, detailed.businessIntelligence.industryBenchmarks.averageTimeToFill, false)}`}>
                              {member.metrics.averageTimeToFill}d
                            </span>
                            {getPerformanceIcon(member.metrics.averageTimeToFill, detailed.businessIntelligence.industryBenchmarks.averageTimeToFill, false)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-white font-medium">{member.metrics.clientSatisfaction}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="text-white/70 text-sm">
                              <span className="text-blue-400">{member.metrics.activeCandidates}</span> candidates
                            </div>
                            <div className="text-white/70 text-sm">
                              <span className="text-purple-400">{member.metrics.activeJobs}</span> jobs
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Performance Trends */}
            <motion.div
              variants={itemVariants}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Monthly Performance Trends</h3>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {summary.performance.slice(0, 3).map((member) => (
                  <div key={member.teamMember.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="text-lg">{member.teamMember.avatar}</div>
                      <div>
                        <p className="text-white font-medium">{member.teamMember.name}</p>
                        <p className="text-white/70 text-xs">{member.teamMember.role}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {member.monthlyTrend.map((trend, index) => (
                        <div key={trend.month} className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">{trend.month}</span>
                          <div className="flex items-center space-x-3">
                            <span className="text-blue-400 text-sm">{trend.placements} placements</span>
                            <span className="text-green-400 text-sm">{formatCurrency(trend.revenue)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                variants={itemVariants}
                className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <ArrowUp className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">{formatCurrency(summary.revenue.totalRevenue)}</p>
                  <p className="text-white/70 text-sm">Total Revenue</p>
                  <p className="text-green-400 text-xs mt-2">+{summary.revenue.revenueGrowth}% growth</p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">{formatCurrency(summary.revenue.quarterlyRevenue)}</p>
                  <p className="text-white/70 text-sm">Quarterly Revenue</p>
                  <p className="text-blue-400 text-xs mt-2">Q1 2024 Performance</p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-400" />
                  </div>
                  <Zap className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">{formatCurrency(summary.revenue.averagePlacementValue)}</p>
                  <p className="text-white/70 text-sm">Avg Placement Value</p>
                  <p className="text-purple-400 text-xs mt-2">Per successful hire</p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-400" />
                  </div>
                  <Zap className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">{formatCurrency(summary.revenue.projectedRevenue)}</p>
                  <p className="text-white/70 text-sm">Projected Revenue</p>
                  <p className="text-orange-400 text-xs mt-2">End of year forecast</p>
                </div>
              </motion.div>
            </div>

            {/* Commission Breakdown */}
            <motion.div
              variants={itemVariants}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-black/20 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white">Commission Breakdown</h3>
                <p className="text-white/70 text-sm">Individual earnings and rates</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-4 text-white/80 font-medium">Recruiter</th>
                      <th className="text-left p-4 text-white/80 font-medium">Total Commission</th>
                      <th className="text-left p-4 text-white/80 font-medium">Monthly</th>
                      <th className="text-left p-4 text-white/80 font-medium">Rate</th>
                      <th className="text-left p-4 text-white/80 font-medium">Placements</th>
                      <th className="text-left p-4 text-white/80 font-medium">Avg per Placement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailed.commissions.map((commission, index) => (
                      <motion.tr
                        key={commission.recruiterId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <span className="text-white font-medium">{commission.recruiterName}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-green-400 font-semibold">{formatCurrency(commission.totalCommission)}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-white font-medium">{formatCurrency(commission.monthlyCommission)}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-blue-400 font-medium">{commission.commissionRate}%</span>
                        </td>
                        <td className="p-4">
                          <span className="text-white font-medium">{commission.placements}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-purple-400 font-medium">{formatCurrency(commission.averageCommissionPerPlacement)}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Pipeline Tab */}
        {activeTab === 'pipeline' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Pipeline Overview */}
            <motion.div
              variants={itemVariants}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Recruitment Funnel</h3>
                <PieChart className="h-5 w-5 text-purple-400" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {summary.pipeline.funnelData.filter(stage => stage.stage !== 'Rejected').map((stage, index) => (
                  <div key={stage.stage} className="text-center">
                    <div className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                      index === 0 ? 'bg-blue-500/20 text-blue-400' :
                      index === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 2 ? 'bg-orange-500/20 text-orange-400' :
                      index === 3 ? 'bg-purple-500/20 text-purple-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      <span className="text-lg font-bold">{stage.count}</span>
                    </div>
                    <p className="text-white/90 text-sm font-medium">{stage.stage}</p>
                    <p className="text-white/70 text-xs">{stage.conversionRate}%</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bottlenecks Analysis */}
            <motion.div
              variants={itemVariants}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Pipeline Bottlenecks</h3>
                <Activity className="h-5 w-5 text-red-400" />
              </div>
              <div className="space-y-6">
                {summary.pipeline.bottlenecks.map((bottleneck, index) => (
                  <div key={bottleneck.stage} className="border-l-4 border-red-400/50 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{bottleneck.stage}</h4>
                      <div className="flex items-center space-x-4">
                        <span className="text-red-400 text-sm">{bottleneck.dropOffRate}% drop-off</span>
                        <span className="text-orange-400 text-sm">{bottleneck.averageTime} days avg</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {bottleneck.suggestions.map((suggestion, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          {suggestion}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Source Effectiveness */}
            <motion.div
              variants={itemVariants}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-black/20 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white">Source Effectiveness</h3>
                <p className="text-white/70 text-sm">Candidate acquisition channels performance</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-4 text-white/80 font-medium">Source</th>
                      <th className="text-left p-4 text-white/80 font-medium">Candidates</th>
                      <th className="text-left p-4 text-white/80 font-medium">Placements</th>
                      <th className="text-left p-4 text-white/80 font-medium">Success Rate</th>
                      <th className="text-left p-4 text-white/80 font-medium">Cost per Hire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.pipeline.sourceEffectiveness.map((source, index) => {
                      const successRate = (source.placements / source.candidates * 100).toFixed(1)
                      return (
                        <motion.tr
                          key={source.source}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <span className="text-white font-medium">{source.source}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-blue-400 font-medium">{source.candidates}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-green-400 font-medium">{source.placements}</span>
                          </td>
                          <td className="p-4">
                            <span className={`font-medium ${parseFloat(successRate) > 15 ? 'text-green-400' : parseFloat(successRate) > 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {successRate}%
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`font-medium ${source.costPerHire < 1200 ? 'text-green-400' : source.costPerHire < 1500 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {formatCurrency(source.costPerHire)}
                            </span>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AnalyticsDashboard