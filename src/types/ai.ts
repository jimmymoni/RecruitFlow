// AI-Powered Recruitment System Types
export interface AIConfig {
  provider: 'qwen' | 'baichuan' | 'chatglm' | 'local' | 'custom'
  model: string
  endpoint?: string
  apiKey?: string
  maxTokens: number
  temperature: number
  costPerToken: number // Much lower for Chinese models
  isEnabled: boolean
}

export interface ResumeParsingResult {
  id: string
  candidateId: string
  confidence: number
  processingTime: number
  extractedData: {
    personalInfo: {
      name: string
      email: string
      phone: string
      location: string
      linkedIn?: string
      portfolio?: string
    }
    experience: WorkExperience[]
    education: Education[]
    skills: ExtractedSkill[]
    certifications: Certification[]
    languages: Language[]
    summary: string
    salaryExpectation?: SalaryRange
  }
  qualityScore: number
  flags: ResumeFlag[]
  aiInsights: {
    strengths: string[]
    concerns: string[]
    fitScore: number
    recommendations: string[]
  }
}

export interface WorkExperience {
  company: string
  title: string
  startDate: Date
  endDate?: Date
  isCurrent: boolean
  duration: string
  description: string
  achievements: string[]
  technologies: string[]
  industries: string[]
}

export interface Education {
  institution: string
  degree: string
  field: string
  startDate: Date
  endDate?: Date
  gpa?: number
  achievements: string[]
}

export interface ExtractedSkill {
  name: string
  category: 'technical' | 'soft' | 'language' | 'certification'
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsExperience?: number
  verified: boolean
}

export interface Certification {
  name: string
  issuer: string
  issueDate: Date
  expiryDate?: Date
  credentialId?: string
  verified: boolean
}

export interface Language {
  name: string
  proficiency: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic'
  certified: boolean
}

export interface SalaryRange {
  min: number
  max: number
  currency: string
  period: 'hourly' | 'monthly' | 'yearly'
}

export interface ResumeFlag {
  type: 'ai_generated' | 'gaps' | 'job_hopping' | 'overqualified' | 'underqualified' | 'suspicious'
  severity: 'low' | 'medium' | 'high'
  description: string
  suggestions: string[]
}

export interface AutoScreeningCriteria {
  id: string
  jobId: string
  name: string
  isEnabled: boolean
  criteria: {
    requiredSkills: SkillRequirement[]
    experienceRange: { min: number; max: number }
    educationLevel: 'high_school' | 'bachelor' | 'master' | 'phd' | 'any'
    salaryRange?: SalaryRange
    location: LocationRequirement
    industries: string[]
    customRules: CustomRule[]
  }
  scoring: {
    skillsWeight: number
    experienceWeight: number
    educationWeight: number
    locationWeight: number
    customWeight: number
  }
  thresholds: {
    minScore: number
    autoReject: number
    autoAdvance: number
  }
}

export interface SkillRequirement {
  skill: string
  required: boolean
  minLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  weight: number
}

export interface LocationRequirement {
  type: 'remote' | 'onsite' | 'hybrid' | 'any'
  locations: string[]
  radius?: number
  timezone?: string
}

export interface CustomRule {
  id: string
  name: string
  type: 'keyword_presence' | 'keyword_absence' | 'experience_pattern' | 'custom_logic'
  parameters: Record<string, any>
  weight: number
  isEnabled: boolean
}

export interface AIWorkflowAction {
  id: string
  type: 'send_email' | 'schedule_interview' | 'add_note' | 'change_status' | 'assign_recruiter' | 'add_tag'
  trigger: WorkflowTrigger
  conditions: WorkflowCondition[]
  parameters: Record<string, any>
  isEnabled: boolean
  executionCount: number
  successRate: number
}

export interface WorkflowTrigger {
  type: 'resume_parsed' | 'score_threshold' | 'status_change' | 'time_based' | 'manual'
  parameters: Record<string, any>
}

export interface WorkflowCondition {
  field: string
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in_range'
  value: any
  logic: 'AND' | 'OR'
}

export interface SmartInsight {
  id: string
  type: 'quick_stat' | 'trend_alert' | 'recommendation' | 'performance_insight'
  title: string
  description: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
  priority: 'low' | 'medium' | 'high'
  actionable: boolean
  actions?: InsightAction[]
  generatedAt: Date
}

export interface InsightAction {
  label: string
  type: 'navigate' | 'filter' | 'export' | 'configure'
  parameters: Record<string, any>
}

export interface PipelineStage {
  id: string
  name: string
  description: string
  order: number
  color: string
  type: 'screening' | 'interviewing' | 'decision' | 'onboarding' | 'custom'
  automations: PipelineAutomation[]
  slaHours?: number
  isActive: boolean
}

export interface PipelineAutomation {
  id: string
  name: string
  trigger: 'entry' | 'exit' | 'time_based' | 'condition_met'
  actions: AIWorkflowAction[]
  conditions: WorkflowCondition[]
  isEnabled: boolean
}

export interface CustomPipeline {
  id: string
  name: string
  description: string
  jobTypes: string[]
  stages: PipelineStage[]
  defaultAssignee?: string
  isTemplate: boolean
  isActive: boolean
  createdBy: string
  createdAt: Date
  usageCount: number
}

export interface AIUsageMetrics {
  provider: string
  model: string
  totalRequests: number
  totalTokens: number
  totalCost: number
  averageLatency: number
  successRate: number
  costSavings: number // vs OpenAI pricing
  features: {
    resumeParsing: FeatureUsage
    screening: FeatureUsage
    insights: FeatureUsage
    automation: FeatureUsage
  }
}

export interface FeatureUsage {
  requests: number
  tokens: number
  cost: number
  accuracy: number
  timesSaved: number // in hours
}

export interface AIModelComparison {
  provider: string
  model: string
  costPerToken: number
  avgLatency: number
  accuracy: {
    resumeParsing: number
    screening: number
    insights: number
  }
  languages: string[]
  maxTokens: number
  availability: number
  recommended: boolean
}