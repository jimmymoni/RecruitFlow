export interface IntegrationType {
  id: string
  name: string
  category: 'email' | 'calendar' | 'social' | 'job-board' | 'communication' | 'ats' | 'crm'
  icon: string
  description: string
  provider: string
  isConnected: boolean
  isEnabled: boolean
  lastSync?: Date
  syncStatus: 'idle' | 'syncing' | 'error' | 'success'
  errorMessage?: string
  features: string[]
  requiredScopes: string[]
  webhookUrl?: string
}

export interface EmailIntegration {
  id: string
  provider: 'gmail' | 'outlook' | 'exchange'
  email: string
  displayName: string
  isConnected: boolean
  autoSync: boolean
  smartFiling: boolean
  syncFrequency: number // minutes
  folders: EmailFolder[]
  lastSync: Date
  syncedEmails: number
  settings: EmailSettings
}

export interface EmailFolder {
  id: string
  name: string
  type: 'inbox' | 'sent' | 'draft' | 'candidates' | 'clients' | 'jobs' | 'custom'
  autoFile: boolean
  keywords: string[]
}

export interface EmailSettings {
  autoFileEmails: boolean
  candidateKeywords: string[]
  clientKeywords: string[]
  jobKeywords: string[]
  notificationPreferences: {
    newCandidateEmail: boolean
    clientResponse: boolean
    interviewReminders: boolean
  }
}

export interface CalendarIntegration {
  id: string
  provider: 'google' | 'outlook' | 'apple'
  email: string
  displayName: string
  isConnected: boolean
  twoWaySync: boolean
  defaultCalendar: string
  calendars: CalendarItem[]
  meetingTypes: MeetingType[]
  settings: CalendarSettings
}

export interface CalendarItem {
  id: string
  name: string
  color: string
  isDefault: boolean
  syncEnabled: boolean
}

export interface MeetingType {
  id: string
  name: string
  duration: number
  description: string
  location?: string
  isVideoCall: boolean
  autoJoinUrl?: string
  bufferTime: number
}

export interface CalendarSettings {
  autoScheduling: boolean
  bufferTimeBefore: number
  bufferTimeAfter: number
  workingHours: {
    start: string
    end: string
    timezone: string
    workingDays: number[]
  }
  meetingPreferences: {
    defaultDuration: number
    defaultLocation: string
    autoAddVideoCall: boolean
    sendReminders: boolean
  }
}

export interface LinkedInIntegration {
  id: string
  profileId: string
  displayName: string
  profileUrl: string
  isConnected: boolean
  isPremium: boolean
  connectionCount: number
  features: {
    candidateImport: boolean
    profileMatching: boolean
    jobPosting: boolean
    messaging: boolean
    insights: boolean
  }
  quotaUsage: {
    searches: { used: number; limit: number; resetDate: Date }
    messages: { used: number; limit: number; resetDate: Date }
    profileViews: { used: number; limit: number; resetDate: Date }
  }
  settings: LinkedInSettings
}

export interface LinkedInSettings {
  autoImportProfiles: boolean
  matchingCriteria: {
    skills: string[]
    experience: number
    location: string[]
    industries: string[]
  }
  messagingTemplates: MessageTemplate[]
}

export interface MessageTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'connection' | 'inquiry' | 'follow-up' | 'interview-invite'
  variables: string[]
}

export interface JobBoardIntegration {
  id: string
  provider: 'indeed' | 'linkedin-jobs' | 'glassdoor' | 'monster' | 'ziprecruiter'
  name: string
  isConnected: boolean
  autoPosting: boolean
  postingQuota: {
    used: number
    limit: number
    resetDate: Date
  }
  defaultSettings: JobPostSettings
  activeJobs: number
  totalViews: number
  totalApplications: number
}

export interface JobPostSettings {
  duration: number // days
  featured: boolean
  urgentHiring: boolean
  remoteOptions: boolean
  salaryVisible: boolean
  companyLogoVisible: boolean
  autoRepost: boolean
  keywords: string[]
  targetAudience: {
    experienceLevel: string[]
    education: string[]
    location: string[]
  }
}

export interface CommunicationIntegration {
  id: string
  provider: 'whatsapp' | 'sms' | 'slack' | 'teams' | 'zoom' | 'meet'
  name: string
  isConnected: boolean
  isEnabled: boolean
  settings: CommunicationSettings
  usage: {
    messagesMonth: number
    callsMonth: number
    lastActivity: Date
  }
}

export interface CommunicationSettings {
  autoNotifications: boolean
  businessHours: {
    enabled: boolean
    start: string
    end: string
    timezone: string
    workingDays: number[]
  }
  templates: {
    interviewReminder: string
    statusUpdate: string
    welcome: string
    followUp: string
  }
  restrictions: {
    maxMessagesPerDay: number
    blacklistedNumbers: string[]
    requireOptIn: boolean
  }
}

export interface ATSIntegration {
  id: string
  provider: string
  name: string
  apiEndpoint: string
  isConnected: boolean
  syncDirection: 'import' | 'export' | 'bidirectional'
  fieldMapping: FieldMapping[]
  lastSync: Date
  syncedRecords: {
    candidates: number
    jobs: number
    clients: number
  }
}

export interface FieldMapping {
  sourceField: string
  targetField: string
  transformation?: 'uppercase' | 'lowercase' | 'capitalize' | 'date-format' | 'phone-format'
  required: boolean
}

export interface CRMIntegration {
  id: string
  provider: 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho'
  name: string
  isConnected: boolean
  syncDirection: 'import' | 'export' | 'bidirectional'
  clientMapping: FieldMapping[]
  contactMapping: FieldMapping[]
  leadMapping: FieldMapping[]
  lastSync: Date
  syncedRecords: {
    clients: number
    contacts: number
    leads: number
  }
}

export interface IntegrationActivity {
  id: string
  integrationId: string
  type: 'sync' | 'import' | 'export' | 'error' | 'connect' | 'disconnect'
  status: 'success' | 'error' | 'warning'
  message: string
  errorMessage?: string
  details?: any
  recordsProcessed?: number
  timestamp: Date
  duration?: number
}

export interface IntegrationDashboard {
  summary: {
    totalIntegrations: number
    connectedIntegrations: number
    activeIntegrations: number
    lastActivity: Date
    syncStatus: 'healthy' | 'issues' | 'offline'
  }
  integrations: IntegrationType[]
  recentActivity: IntegrationActivity[]
  usage: {
    emailsSynced: number
    calendarEventsSynced: number
    linkedinSearches: number
    jobPostings: number
    messagesSent: number
  }
  health: {
    systemStatus: 'operational' | 'degraded' | 'maintenance'
    apiHealth: { provider: string; status: string; responseTime: number }[]
    rateLimits: { provider: string; usage: number; limit: number }[]
  }
}

export interface IntegrationSettings {
  globalSettings: {
    autoSync: boolean
    syncFrequency: number // minutes
    retryAttempts: number
    timeoutDuration: number // seconds
    enableWebhooks: boolean
    logLevel: 'error' | 'warning' | 'info' | 'debug'
  }
  notifications: {
    syncErrors: boolean
    connectionIssues: boolean
    quotaWarnings: boolean
    successNotifications: boolean
    emailDigest: boolean
    digestFrequency: 'daily' | 'weekly' | 'monthly'
  }
  security: {
    encryptTokens: boolean
    tokenRefreshBuffer: number // hours
    requireReauth: boolean
    reauthInterval: number // days
    auditLog: boolean
    ipWhitelist: string[]
  }
}