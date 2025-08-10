import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index
} from 'typeorm'

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
  })
  @Index()
  period: string

  @Column({ type: 'date' })
  @Index()
  periodStart: Date

  @Column({ type: 'date' })
  periodEnd: Date

  @Column({
    type: 'enum',
    enum: ['recruitment', 'business', 'performance', 'ai_usage', 'user_activity', 'financial'],
  })
  @Index()
  category: string

  @Column({ type: 'jsonb' })
  metrics: {
    // Recruitment metrics
    candidatesAdded?: number
    candidatesScreened?: number
    candidatesInterviewed?: number
    candidatesHired?: number
    candidatesRejected?: number
    jobsPosted?: number
    jobsFilled?: number
    jobsClosed?: number
    avgTimeToFill?: number // in days
    avgTimeToHire?: number // in days
    fillRate?: number // percentage
    
    // Business metrics
    revenue?: number
    fees?: number
    clientsAcquired?: number
    clientsLost?: number
    avgDealValue?: number
    conversionRate?: number
    clientSatisfactionScore?: number
    
    // Performance metrics
    recruiterProductivity?: {
      userId: string
      userName: string
      candidatesProcessed: number
      jobsFilled: number
      revenue: number
      clientInteractions: number
    }[]
    teamPerformance?: {
      totalPlacements: number
      totalRevenue: number
      avgPlacementTime: number
      clientRetentionRate: number
    }
    
    // AI usage metrics
    aiRequests?: number
    aiCost?: number
    resumesParsed?: number
    candidatesScreened?: number
    avgProcessingTime?: number
    costSavings?: number
    accuracyRate?: number
    
    // User activity metrics
    activeUsers?: number
    logins?: number
    documentsUploaded?: number
    communicationsSent?: number
    workflowsExecuted?: number
    
    // Financial metrics
    monthlyRecurringRevenue?: number
    averageRevenuePerUser?: number
    customerLifetimeValue?: number
    costPerAcquisition?: number
    profitMargin?: number
    
    // Pipeline metrics
    pipelineHealth?: {
      stage: string
      count: number
      avgDuration: number
      conversionRate: number
    }[]
    
    // Quality metrics
    candidateQualityScore?: number
    jobMatchScore?: number
    clientSatisfactionScore?: number
    npsScore?: number
    
    // Industry benchmarks
    industryAverages?: {
      timeToFill: number
      fillRate: number
      candidateQuality: number
      clientSatisfaction: number
    }
  }

  @Column({ type: 'jsonb', nullable: true })
  breakdown: {
    byLocation?: Record<string, any>
    byIndustry?: Record<string, any>
    byJobType?: Record<string, any>
    byExperienceLevel?: Record<string, any>
    bySkills?: Record<string, any>
    bySource?: Record<string, any>
    byRecruiter?: Record<string, any>
    byClient?: Record<string, any>
  }

  @Column({ type: 'jsonb', nullable: true })
  trends: {
    metric: string
    previousPeriod: number
    currentPeriod: number
    changePercent: number
    trend: 'up' | 'down' | 'stable'
    significance: 'high' | 'medium' | 'low'
  }[]

  @Column({ type: 'jsonb', nullable: true })
  goals: {
    metric: string
    target: number
    actual: number
    achievement: number // percentage
    status: 'exceeded' | 'met' | 'behind' | 'at_risk'
  }[]

  @Column({ type: 'jsonb', nullable: true })
  insights: {
    type: 'opportunity' | 'risk' | 'trend' | 'anomaly'
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    confidence: number
    recommendations: string[]
    dataPoints: any[]
  }[]

  @Column({ type: 'jsonb', nullable: true })
  forecasts: {
    metric: string
    nextPeriod: number
    confidence: number
    factors: string[]
    methodology: string
  }[]

  @Column({ default: false })
  isProcessed: boolean

  @Column({ nullable: true })
  processedAt: Date

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    dataSource?: string[]
    calculationMethod?: string
    filters?: any
    excludedData?: any
    notes?: string
    version?: string
    generatedBy?: 'system' | 'user' | 'ai'
  }

  @CreateDateColumn()
  @Index()
  createdAt: Date

  // Virtual properties
  get isCurrentPeriod(): boolean {
    const now = new Date()
    return now >= this.periodStart && now <= this.periodEnd
  }

  get isPreviousPeriod(): boolean {
    const now = new Date()
    return now > this.periodEnd
  }

  get periodLabel(): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    
    if (this.period === 'daily') {
      return formatter.format(this.periodStart)
    }
    
    return `${formatter.format(this.periodStart)} - ${formatter.format(this.periodEnd)}`
  }

  get totalCandidates(): number {
    return (this.metrics?.candidatesAdded || 0) +
           (this.metrics?.candidatesScreened || 0) +
           (this.metrics?.candidatesInterviewed || 0)
  }

  get conversionRate(): number {
    const candidates = this.metrics?.candidatesAdded || 0
    const hired = this.metrics?.candidatesHired || 0
    return candidates > 0 ? (hired / candidates) * 100 : 0
  }

  get revenueGrowth(): number {
    const currentRevenue = this.metrics?.revenue || 0
    const trend = this.trends?.find(t => t.metric === 'revenue')
    if (!trend) return 0
    return trend.changePercent
  }

  get topPerformer(): any {
    const recruiters = this.metrics?.recruiterProductivity || []
    if (recruiters.length === 0) return null
    
    return recruiters.reduce((top, recruiter) => {
      const score = recruiter.jobsFilled * 10 + recruiter.revenue * 0.001
      const topScore = top ? top.jobsFilled * 10 + top.revenue * 0.001 : 0
      return score > topScore ? recruiter : top
    }, null)
  }

  get healthScore(): number {
    let score = 0
    let factors = 0
    
    // Fill rate
    const fillRate = this.metrics?.fillRate || 0
    score += Math.min(fillRate / 70 * 25, 25) // 70% target = 25 points
    factors++
    
    // Time to fill
    const timeToFill = this.metrics?.avgTimeToFill || 0
    if (timeToFill > 0) {
      score += Math.max(25 - (timeToFill - 30), 0) // 30 days target = 25 points
      factors++
    }
    
    // Revenue growth
    const revenueGrowthRate = this.revenueGrowth
    score += Math.min(Math.max(revenueGrowthRate + 25, 0), 25) // 0% growth = 25 points
    factors++
    
    // Client satisfaction
    const satisfaction = this.metrics?.clientSatisfactionScore || 0
    score += (satisfaction / 10) * 25 // Scale 0-10 to 0-25
    factors++
    
    return factors > 0 ? Math.round(score / factors * 4) : 0 // Scale to 0-100
  }

  get riskFactors(): string[] {
    const risks: string[] = []
    
    if ((this.metrics?.fillRate || 0) < 50) {
      risks.push('Low fill rate')
    }
    
    if ((this.metrics?.avgTimeToFill || 0) > 45) {
      risks.push('Extended time to fill')
    }
    
    if (this.revenueGrowth < -10) {
      risks.push('Declining revenue')
    }
    
    if ((this.metrics?.clientSatisfactionScore || 0) < 7) {
      risks.push('Low client satisfaction')
    }
    
    return risks
  }

  get opportunities(): string[] {
    const opportunities: string[] = []
    
    if ((this.metrics?.candidatesAdded || 0) > (this.metrics?.candidatesScreened || 0) * 1.5) {
      opportunities.push('Untapped candidate pool')
    }
    
    if ((this.metrics?.fillRate || 0) > 80) {
      opportunities.push('High performance - consider expansion')
    }
    
    if ((this.metrics?.aiCost || 0) < (this.metrics?.costSavings || 0) * 0.1) {
      opportunities.push('Excellent AI ROI')
    }
    
    return opportunities
  }

  // Static methods
  static getPeriodDates(period: string, date: Date = new Date()): { start: Date; end: Date } {
    const start = new Date(date)
    const end = new Date(date)
    
    switch (period) {
      case 'daily':
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'weekly':
        const dayOfWeek = start.getDay()
        start.setDate(start.getDate() - dayOfWeek)
        start.setHours(0, 0, 0, 0)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        break
      case 'monthly':
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        end.setMonth(start.getMonth() + 1, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'quarterly':
        const quarter = Math.floor(start.getMonth() / 3)
        start.setMonth(quarter * 3, 1)
        start.setHours(0, 0, 0, 0)
        end.setMonth(quarter * 3 + 3, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'yearly':
        start.setMonth(0, 1)
        start.setHours(0, 0, 0, 0)
        end.setMonth(11, 31)
        end.setHours(23, 59, 59, 999)
        break
    }
    
    return { start, end }
  }
}