export interface RevenueMetrics {
  totalRevenue: number
  monthlyRevenue: number
  quarterlyRevenue: number
  yearlyRevenue: number
  averagePlacementValue: number
  revenueGrowth: number
  projectedRevenue: number
  currency: string
}

export interface CommissionData {
  recruiterId: string
  recruiterName: string
  totalCommission: number
  monthlyCommission: number
  commissionRate: number
  placements: number
  averageCommissionPerPlacement: number
}

export interface PlacementMetrics {
  totalPlacements: number
  monthlyPlacements: number
  successRate: number
  averageTimeToFill: number
  interviewToHireRatio: number
  placementsByRole: Array<{
    role: string
    count: number
    averageValue: number
  }>
  placementTrend: Array<{
    date: Date
    count: number
    value: number
  }>
}

export interface TeamPerformance {
  teamMember: {
    id: string
    name: string
    role: string
    avatar?: string
  }
  metrics: {
    totalPlacements: number
    totalRevenue: number
    successRate: number
    averageTimeToFill: number
    clientSatisfaction: number
    activeCandidates: number
    activeJobs: number
  }
  rankings: {
    placementRank: number
    revenueRank: number
    successRateRank: number
    timeToFillRank: number
  }
  monthlyTrend: Array<{
    month: string
    placements: number
    revenue: number
  }>
}

export interface ClientAnalytics {
  clientId: string
  clientName: string
  metrics: {
    totalSpent: number
    jobsPosted: number
    successfulPlacements: number
    averageTimeToFill: number
    satisfactionScore: number
    contractValue: number
    renewalProbability: number
  }
  revenueContribution: number
  placementHistory: Array<{
    date: Date
    position: string
    candidate: string
    value: number
  }>
}

export interface PipelineAnalytics {
  funnelData: Array<{
    stage: 'Applied' | 'Screening' | 'Interviewing' | 'Offered' | 'Hired' | 'Rejected'
    count: number
    conversionRate: number
  }>
  bottlenecks: Array<{
    stage: string
    averageTime: number
    dropOffRate: number
    suggestions: string[]
  }>
  sourceEffectiveness: Array<{
    source: string
    candidates: number
    placements: number
    costPerHire: number
  }>
}

export interface BusinessIntelligence {
  kpis: {
    costPerHire: number
    timeToFill: number
    qualityOfHire: number
    candidateExperience: number
    clientRetention: number
  }
  goals: Array<{
    id: string
    name: string
    target: number
    current: number
    progress: number
    deadline: Date
    status: 'on-track' | 'at-risk' | 'behind' | 'completed'
  }>
  predictions: {
    nextMonthPlacements: number
    nextMonthRevenue: number
    quarterlyGrowth: number
    riskFactors: string[]
  }
  industryBenchmarks: {
    averageTimeToFill: number
    averageSuccessRate: number
    averageCostPerHire: number
  }
}

export interface AnalyticsPeriod {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: Date
  endDate: Date
}

export interface AnalyticsFilter {
  period: AnalyticsPeriod
  teamMembers?: string[]
  clients?: string[]
  jobTypes?: string[]
  industries?: string[]
}

export interface AnalyticsDashboard {
  summary: {
    revenue: RevenueMetrics
    placements: PlacementMetrics
    performance: TeamPerformance[]
    pipeline: PipelineAnalytics
  }
  detailed: {
    commissions: CommissionData[]
    clients: ClientAnalytics[]
    businessIntelligence: BusinessIntelligence
  }
  filters: AnalyticsFilter
  lastUpdated: Date
}