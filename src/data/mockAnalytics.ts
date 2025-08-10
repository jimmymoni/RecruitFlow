import { 
  AnalyticsDashboard, 
  RevenueMetrics, 
  CommissionData, 
  PlacementMetrics, 
  TeamPerformance, 
  ClientAnalytics, 
  PipelineAnalytics, 
  BusinessIntelligence 
} from '../types/analytics'

const mockRevenueMetrics: RevenueMetrics = {
  totalRevenue: 485000,
  monthlyRevenue: 68500,
  quarterlyRevenue: 195000,
  yearlyRevenue: 485000,
  averagePlacementValue: 15500,
  revenueGrowth: 23.5,
  projectedRevenue: 598000,
  currency: 'USD'
}

const mockCommissionData: CommissionData[] = [
  {
    recruiterId: 'user-1',
    recruiterName: 'John Recruiter',
    totalCommission: 97000,
    monthlyCommission: 13700,
    commissionRate: 20,
    placements: 8,
    averageCommissionPerPlacement: 12125
  },
  {
    recruiterId: 'user-2',
    recruiterName: 'Sarah Mitchell',
    totalCommission: 145500,
    monthlyCommission: 20500,
    commissionRate: 22,
    placements: 12,
    averageCommissionPerPlacement: 12125
  },
  {
    recruiterId: 'user-3',
    recruiterName: 'Mike Johnson',
    totalCommission: 89250,
    monthlyCommission: 12500,
    commissionRate: 18,
    placements: 7,
    averageCommissionPerPlacement: 12750
  },
  {
    recruiterId: 'user-4',
    recruiterName: 'Lisa Chen',
    totalCommission: 42000,
    monthlyCommission: 6000,
    commissionRate: 15,
    placements: 4,
    averageCommissionPerPlacement: 10500
  },
  {
    recruiterId: 'user-5',
    recruiterName: 'David Park',
    totalCommission: 31750,
    monthlyCommission: 4500,
    commissionRate: 12,
    placements: 3,
    averageCommissionPerPlacement: 10583
  }
]

const mockPlacementMetrics: PlacementMetrics = {
  totalPlacements: 34,
  monthlyPlacements: 12,
  successRate: 68.5,
  averageTimeToFill: 21,
  interviewToHireRatio: 3.2,
  placementsByRole: [
    { role: 'Software Engineer', count: 12, averageValue: 18500 },
    { role: 'Product Manager', count: 8, averageValue: 22000 },
    { role: 'Designer', count: 6, averageValue: 15000 },
    { role: 'Data Scientist', count: 5, averageValue: 25000 },
    { role: 'Marketing Manager', count: 3, averageValue: 12000 }
  ],
  placementTrend: [
    { date: new Date('2024-01-01'), count: 8, value: 124000 },
    { date: new Date('2024-02-01'), count: 11, value: 167500 },
    { date: new Date('2024-03-01'), count: 15, value: 232500 },
    { date: new Date('2024-04-01'), count: 12, value: 186000 },
    { date: new Date('2024-05-01'), count: 14, value: 217000 },
    { date: new Date('2024-06-01'), count: 16, value: 248000 }
  ]
}

const mockTeamPerformance: TeamPerformance[] = [
  {
    teamMember: {
      id: 'user-2',
      name: 'Sarah Mitchell',
      role: 'Senior Recruiter',
      avatar: '👩‍💼'
    },
    metrics: {
      totalPlacements: 12,
      totalRevenue: 186000,
      successRate: 75.2,
      averageTimeToFill: 18,
      clientSatisfaction: 4.8,
      activeCandidates: 23,
      activeJobs: 6
    },
    rankings: {
      placementRank: 1,
      revenueRank: 1,
      successRateRank: 1,
      timeToFillRank: 2
    },
    monthlyTrend: [
      { month: 'Jan', placements: 3, revenue: 45500 },
      { month: 'Feb', placements: 4, revenue: 62000 },
      { month: 'Mar', placements: 5, revenue: 78500 }
    ]
  },
  {
    teamMember: {
      id: 'user-1',
      name: 'John Recruiter',
      role: 'Admin',
      avatar: '👨‍💼'
    },
    metrics: {
      totalPlacements: 8,
      totalRevenue: 124000,
      successRate: 66.7,
      averageTimeToFill: 22,
      clientSatisfaction: 4.6,
      activeCandidates: 18,
      activeJobs: 4
    },
    rankings: {
      placementRank: 2,
      revenueRank: 2,
      successRateRank: 3,
      timeToFillRank: 4
    },
    monthlyTrend: [
      { month: 'Jan', placements: 2, revenue: 31000 },
      { month: 'Feb', placements: 3, revenue: 46500 },
      { month: 'Mar', placements: 3, revenue: 46500 }
    ]
  },
  {
    teamMember: {
      id: 'user-3',
      name: 'Mike Johnson',
      role: 'Recruiter',
      avatar: '🧑‍💻'
    },
    metrics: {
      totalPlacements: 7,
      totalRevenue: 108500,
      successRate: 70.8,
      averageTimeToFill: 19,
      clientSatisfaction: 4.4,
      activeCandidates: 15,
      activeJobs: 3
    },
    rankings: {
      placementRank: 3,
      revenueRank: 3,
      successRateRank: 2,
      timeToFillRank: 3
    },
    monthlyTrend: [
      { month: 'Jan', placements: 2, revenue: 31000 },
      { month: 'Feb', placements: 2, revenue: 31000 },
      { month: 'Mar', placements: 3, revenue: 46500 }
    ]
  },
  {
    teamMember: {
      id: 'user-4',
      name: 'Lisa Chen',
      role: 'Coordinator',
      avatar: '👩‍🎓'
    },
    metrics: {
      totalPlacements: 4,
      totalRevenue: 62000,
      successRate: 57.1,
      averageTimeToFill: 25,
      clientSatisfaction: 4.2,
      activeCandidates: 8,
      activeJobs: 2
    },
    rankings: {
      placementRank: 4,
      revenueRank: 4,
      successRateRank: 5,
      timeToFillRank: 5
    },
    monthlyTrend: [
      { month: 'Jan', placements: 1, revenue: 15500 },
      { month: 'Feb', placements: 2, revenue: 31000 },
      { month: 'Mar', placements: 1, revenue: 15500 }
    ]
  },
  {
    teamMember: {
      id: 'user-5',
      name: 'David Park',
      role: 'Sourcer',
      avatar: '🕵️‍♂️'
    },
    metrics: {
      totalPlacements: 3,
      totalRevenue: 46500,
      successRate: 60.0,
      averageTimeToFill: 16,
      clientSatisfaction: 4.1,
      activeCandidates: 12,
      activeJobs: 1
    },
    rankings: {
      placementRank: 5,
      revenueRank: 5,
      successRateRank: 4,
      timeToFillRank: 1
    },
    monthlyTrend: [
      { month: 'Jan', placements: 1, revenue: 15500 },
      { month: 'Feb', placements: 1, revenue: 15500 },
      { month: 'Mar', placements: 1, revenue: 15500 }
    ]
  }
]

const mockClientAnalytics: ClientAnalytics[] = [
  {
    clientId: 'client-1',
    clientName: 'TechCorp Solutions',
    metrics: {
      totalSpent: 186000,
      jobsPosted: 12,
      successfulPlacements: 8,
      averageTimeToFill: 18,
      satisfactionScore: 4.8,
      contractValue: 85000,
      renewalProbability: 92
    },
    revenueContribution: 38.3,
    placementHistory: [
      { date: new Date('2024-01-15'), position: 'Senior Developer', candidate: 'John Doe', value: 23500 },
      { date: new Date('2024-02-10'), position: 'Product Manager', candidate: 'Jane Smith', value: 31000 },
      { date: new Date('2024-03-05'), position: 'DevOps Engineer', candidate: 'Bob Wilson', value: 27500 }
    ]
  },
  {
    clientId: 'client-2',
    clientName: 'StartupXYZ',
    metrics: {
      totalSpent: 124000,
      jobsPosted: 8,
      successfulPlacements: 6,
      averageTimeToFill: 22,
      satisfactionScore: 4.5,
      contractValue: 45000,
      renewalProbability: 78
    },
    revenueContribution: 25.6,
    placementHistory: [
      { date: new Date('2024-01-20'), position: 'Marketing Manager', candidate: 'Alice Brown', value: 20500 },
      { date: new Date('2024-02-25'), position: 'Sales Director', candidate: 'Charlie Davis', value: 35000 }
    ]
  }
]

const mockPipelineAnalytics: PipelineAnalytics = {
  funnelData: [
    { stage: 'Applied', count: 234, conversionRate: 100 },
    { stage: 'Screening', count: 156, conversionRate: 66.7 },
    { stage: 'Interviewing', count: 89, conversionRate: 57.1 },
    { stage: 'Offered', count: 42, conversionRate: 47.2 },
    { stage: 'Hired', count: 34, conversionRate: 81.0 },
    { stage: 'Rejected', count: 200, conversionRate: 0 }
  ],
  bottlenecks: [
    {
      stage: 'Screening to Interview',
      averageTime: 5.2,
      dropOffRate: 43.0,
      suggestions: ['Improve screening criteria', 'Faster response times', 'Better candidate qualification']
    },
    {
      stage: 'Offer to Hire',
      averageTime: 3.8,
      dropOffRate: 19.0,
      suggestions: ['Competitive compensation', 'Faster decision making', 'Better selling of opportunity']
    }
  ],
  sourceEffectiveness: [
    { source: 'LinkedIn', candidates: 89, placements: 15, costPerHire: 1250 },
    { source: 'Indeed', candidates: 67, placements: 8, costPerHire: 1850 },
    { source: 'Referrals', candidates: 45, placements: 7, costPerHire: 950 },
    { source: 'Company Website', candidates: 33, placements: 4, costPerHire: 1100 }
  ]
}

const mockBusinessIntelligence: BusinessIntelligence = {
  kpis: {
    costPerHire: 1425,
    timeToFill: 21,
    qualityOfHire: 4.6,
    candidateExperience: 4.2,
    clientRetention: 89.5
  },
  goals: [
    {
      id: 'goal-1',
      name: 'Monthly Placements',
      target: 15,
      current: 12,
      progress: 80,
      deadline: new Date('2024-03-31'),
      status: 'on-track'
    },
    {
      id: 'goal-2',
      name: 'Quarter Revenue',
      target: 200000,
      current: 195000,
      progress: 97.5,
      deadline: new Date('2024-03-31'),
      status: 'on-track'
    },
    {
      id: 'goal-3',
      name: 'Time to Fill',
      target: 18,
      current: 21,
      progress: 70,
      deadline: new Date('2024-06-30'),
      status: 'at-risk'
    }
  ],
  predictions: {
    nextMonthPlacements: 14,
    nextMonthRevenue: 217000,
    quarterlyGrowth: 28.5,
    riskFactors: ['Economic uncertainty', 'Increased competition', 'Talent shortage in tech']
  },
  industryBenchmarks: {
    averageTimeToFill: 25,
    averageSuccessRate: 62.0,
    averageCostPerHire: 1650
  }
}

export const mockAnalyticsDashboard: AnalyticsDashboard = {
  summary: {
    revenue: mockRevenueMetrics,
    placements: mockPlacementMetrics,
    performance: mockTeamPerformance,
    pipeline: mockPipelineAnalytics
  },
  detailed: {
    commissions: mockCommissionData,
    clients: mockClientAnalytics,
    businessIntelligence: mockBusinessIntelligence
  },
  filters: {
    period: {
      period: 'quarterly',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31')
    }
  },
  lastUpdated: new Date()
}