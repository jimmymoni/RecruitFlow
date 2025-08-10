import {
  AIConfig,
  ResumeParsingResult,
  AutoScreeningCriteria,
  SmartInsight,
  CustomPipeline,
  PipelineStage,
  AIUsageMetrics,
  AIModelComparison
} from '../types/ai'

// Cost-effective Chinese AI models configuration
export const mockAIConfigs: AIConfig[] = [
  {
    provider: 'qwen',
    model: 'qwen-plus',
    endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    maxTokens: 4000,
    temperature: 0.3,
    costPerToken: 0.0000015, // 10x cheaper than GPT-4
    isEnabled: true
  },
  {
    provider: 'baichuan',
    model: 'baichuan2-13b',
    endpoint: 'https://api.baichuan-ai.com/v1/chat/completions',
    maxTokens: 4000,
    temperature: 0.3,
    costPerToken: 0.000002, // 8x cheaper than GPT-4
    isEnabled: false
  },
  {
    provider: 'chatglm',
    model: 'chatglm-pro',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    maxTokens: 8000,
    temperature: 0.3,
    costPerToken: 0.000001, // 15x cheaper than GPT-4
    isEnabled: false
  }
]

// Sample resume parsing results showing AI efficiency
export const mockResumeParsingResults: ResumeParsingResult[] = [
  {
    id: 'parse-1',
    candidateId: 'candidate-1',
    confidence: 0.94,
    processingTime: 1200, // 1.2 seconds
    extractedData: {
      personalInfo: {
        name: 'Sarah Chen',
        email: 'sarah.chen@email.com',
        phone: '+1-555-0123',
        location: 'San Francisco, CA',
        linkedIn: 'linkedin.com/in/sarah-chen-dev',
        portfolio: 'sarahchen.dev'
      },
      experience: [
        {
          company: 'TechStart Inc.',
          title: 'Senior Frontend Developer',
          startDate: new Date('2021-03-01'),
          endDate: new Date('2024-01-15'),
          isCurrent: false,
          duration: '2 years 10 months',
          description: 'Led development of React-based dashboard serving 50K+ users',
          achievements: [
            'Improved app performance by 40%',
            'Led team of 4 developers',
            'Implemented CI/CD pipeline'
          ],
          technologies: ['React', 'TypeScript', 'Node.js', 'AWS'],
          industries: ['SaaS', 'B2B']
        }
      ],
      education: [
        {
          institution: 'UC Berkeley',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: new Date('2017-08-01'),
          endDate: new Date('2021-05-15'),
          gpa: 3.7,
          achievements: ['Dean\'s List 2020', 'CS Honor Society']
        }
      ],
      skills: [
        { name: 'React', category: 'technical', level: 'expert', yearsExperience: 4, verified: true },
        { name: 'TypeScript', category: 'technical', level: 'advanced', yearsExperience: 3, verified: true },
        { name: 'Leadership', category: 'soft', level: 'advanced', yearsExperience: 2, verified: false }
      ],
      certifications: [
        {
          name: 'AWS Certified Developer',
          issuer: 'Amazon Web Services',
          issueDate: new Date('2023-06-15'),
          expiryDate: new Date('2026-06-15'),
          credentialId: 'AWS-CDA-12345',
          verified: true
        }
      ],
      languages: [
        { name: 'English', proficiency: 'native', certified: false },
        { name: 'Mandarin', proficiency: 'fluent', certified: false }
      ],
      summary: 'Experienced frontend developer with strong leadership skills and proven track record of delivering scalable web applications.',
      salaryExpectation: {
        min: 120000,
        max: 150000,
        currency: 'USD',
        period: 'yearly'
      }
    },
    qualityScore: 8.7,
    flags: [
      {
        type: 'job_hopping',
        severity: 'low',
        description: 'Changed jobs every 2-3 years - normal for tech industry',
        suggestions: ['Ask about career progression motivation']
      }
    ],
    aiInsights: {
      strengths: [
        'Strong technical leadership experience',
        'Proven performance optimization skills',
        'Current with modern tech stack'
      ],
      concerns: [
        'May be overqualified for junior positions',
        'High salary expectations for some roles'
      ],
      fitScore: 0.89,
      recommendations: [
        'Excellent fit for Senior/Lead developer roles',
        'Consider for technical mentorship positions',
        'Strong candidate for fast-growing startups'
      ]
    }
  }
]

// Smart screening criteria to filter AI-generated applications
export const mockScreeningCriteria: AutoScreeningCriteria[] = [
  {
    id: 'screening-senior-dev',
    jobId: 'job-123',
    name: 'Senior Developer Auto-Screen',
    isEnabled: true,
    criteria: {
      requiredSkills: [
        { skill: 'React', required: true, minLevel: 'advanced', weight: 0.3 },
        { skill: 'TypeScript', required: true, minLevel: 'intermediate', weight: 0.2 },
        { skill: 'Node.js', required: false, minLevel: 'intermediate', weight: 0.15 }
      ],
      experienceRange: { min: 3, max: 10 },
      educationLevel: 'bachelor',
      salaryRange: { min: 80000, max: 160000, currency: 'USD', period: 'yearly' },
      location: {
        type: 'hybrid',
        locations: ['San Francisco', 'New York', 'Remote'],
        timezone: 'PST'
      },
      industries: ['Technology', 'SaaS', 'Fintech'],
      customRules: [
        {
          id: 'ai-detection',
          name: 'AI-Generated Resume Detection',
          type: 'custom_logic',
          parameters: {
            checkPatterns: ['generic phrases', 'template structure', 'unrealistic achievements'],
            threshold: 0.7
          },
          weight: -0.5, // Negative weight to penalize AI content
          isEnabled: true
        }
      ]
    },
    scoring: {
      skillsWeight: 0.4,
      experienceWeight: 0.3,
      educationWeight: 0.1,
      locationWeight: 0.1,
      customWeight: 0.1
    },
    thresholds: {
      minScore: 0.6,
      autoReject: 0.3,
      autoAdvance: 0.85
    }
  }
]

// Quick insights generated by AI
export const mockSmartInsights: SmartInsight[] = [
  {
    id: 'insight-1',
    type: 'trend_alert',
    title: 'Resume Quality Declining',
    description: '78% increase in AI-generated applications detected this week',
    value: '78%',
    trend: 'up',
    priority: 'high',
    actionable: true,
    actions: [
      { label: 'Adjust Screening', type: 'configure', parameters: { feature: 'ai-detection' } },
      { label: 'View Flagged', type: 'filter', parameters: { filter: 'ai-generated' } }
    ],
    generatedAt: new Date('2024-08-10T10:00:00Z')
  },
  {
    id: 'insight-2',
    type: 'recommendation',
    title: 'Optimize Interview Pipeline',
    description: 'Average time in screening stage is 3.2 days longer than industry benchmark',
    value: '3.2 days',
    trend: 'down',
    priority: 'medium',
    actionable: true,
    actions: [
      { label: 'Enable Auto-Screen', type: 'configure', parameters: { feature: 'auto-screening' } },
      { label: 'View Pipeline', type: 'navigate', parameters: { path: '/pipeline' } }
    ],
    generatedAt: new Date('2024-08-10T09:30:00Z')
  },
  {
    id: 'insight-3',
    type: 'performance_insight',
    title: 'Top Skill Demand',
    description: 'React developers have 40% faster placement rate',
    value: '40% faster',
    trend: 'up',
    priority: 'medium',
    actionable: true,
    actions: [
      { label: 'Source React Talent', type: 'navigate', parameters: { path: '/candidates?skills=React' } }
    ],
    generatedAt: new Date('2024-08-10T08:45:00Z')
  }
]

// Customizable pipeline stages
export const mockPipelineStages: PipelineStage[] = [
  {
    id: 'stage-applied',
    name: 'Applied',
    description: 'Initial application received',
    order: 1,
    color: '#3b82f6',
    type: 'screening',
    automations: [
      {
        id: 'auto-parse',
        name: 'Auto-Parse Resume',
        trigger: 'entry',
        actions: [],
        conditions: [],
        isEnabled: true
      }
    ],
    slaHours: 24,
    isActive: true
  },
  {
    id: 'stage-ai-screened',
    name: 'AI Pre-Screened',
    description: 'Passed initial AI screening',
    order: 2,
    color: '#10b981',
    type: 'screening',
    automations: [
      {
        id: 'auto-score',
        name: 'Calculate Fit Score',
        trigger: 'entry',
        actions: [],
        conditions: [],
        isEnabled: true
      }
    ],
    slaHours: 48,
    isActive: true
  },
  {
    id: 'stage-phone-screen',
    name: 'Phone Screen',
    description: 'Initial recruiter conversation',
    order: 3,
    color: '#f59e0b',
    type: 'interviewing',
    automations: [],
    slaHours: 72,
    isActive: true
  }
]

// Custom pipeline templates
export const mockCustomPipelines: CustomPipeline[] = [
  {
    id: 'pipeline-tech',
    name: 'Tech Roles Pipeline',
    description: 'Optimized for software engineering positions',
    jobTypes: ['Software Engineer', 'Frontend Developer', 'Backend Developer'],
    stages: mockPipelineStages,
    defaultAssignee: 'tech-recruiter',
    isTemplate: true,
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date('2024-01-15'),
    usageCount: 23
  }
]

// AI usage metrics showing cost savings
export const mockAIUsageMetrics: AIUsageMetrics = {
  provider: 'qwen',
  model: 'qwen-plus',
  totalRequests: 1547,
  totalTokens: 892340,
  totalCost: 1.34, // Extremely low cost
  averageLatency: 1100, // ms
  successRate: 0.967,
  costSavings: 12.85, // vs GPT-4 pricing
  features: {
    resumeParsing: {
      requests: 892,
      tokens: 445600,
      cost: 0.67,
      accuracy: 0.94,
      timesSaved: 178 // hours
    },
    screening: {
      requests: 445,
      tokens: 278900,
      cost: 0.42,
      accuracy: 0.91,
      timesSaved: 89
    },
    insights: {
      requests: 156,
      tokens: 124340,
      cost: 0.19,
      accuracy: 0.88,
      timesSaved: 31
    },
    automation: {
      requests: 54,
      tokens: 43500,
      cost: 0.06,
      accuracy: 0.93,
      timesSaved: 27
    }
  }
}

// Model comparison showing Chinese AI cost advantages
export const mockAIModelComparison: AIModelComparison[] = [
  {
    provider: 'qwen',
    model: 'qwen-plus',
    costPerToken: 0.0000015,
    avgLatency: 1100,
    accuracy: { resumeParsing: 0.94, screening: 0.91, insights: 0.88 },
    languages: ['English', 'Chinese', 'Japanese', 'Korean'],
    maxTokens: 8000,
    availability: 0.999,
    recommended: true
  },
  {
    provider: 'openai',
    model: 'gpt-4',
    costPerToken: 0.00003, // 20x more expensive
    avgLatency: 2300,
    accuracy: { resumeParsing: 0.96, screening: 0.93, insights: 0.91 },
    languages: ['English', '100+ others'],
    maxTokens: 8000,
    availability: 0.995,
    recommended: false
  },
  {
    provider: 'baichuan',
    model: 'baichuan2-13b',
    costPerToken: 0.000002,
    avgLatency: 950,
    accuracy: { resumeParsing: 0.92, screening: 0.89, insights: 0.86 },
    languages: ['English', 'Chinese'],
    maxTokens: 4000,
    availability: 0.997,
    recommended: true
  },
  {
    provider: 'chatglm',
    model: 'chatglm-pro',
    costPerToken: 0.000001,
    avgLatency: 1400,
    accuracy: { resumeParsing: 0.90, screening: 0.87, insights: 0.84 },
    languages: ['English', 'Chinese'],
    maxTokens: 8000,
    availability: 0.994,
    recommended: true
  }
]