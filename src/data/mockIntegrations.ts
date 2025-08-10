import {
  IntegrationType,
  EmailIntegration,
  CalendarIntegration,
  LinkedInIntegration,
  JobBoardIntegration,
  CommunicationIntegration,
  ATSIntegration,
  CRMIntegration,
  IntegrationActivity,
  IntegrationDashboard
} from '../types/integrations'

export const mockIntegrations: IntegrationType[] = [
  {
    id: 'gmail-1',
    name: 'Gmail',
    category: 'email',
    icon: '📧',
    description: 'Sync emails and auto-file candidate communications',
    provider: 'google',
    isConnected: true,
    isEnabled: true,
    lastSync: new Date('2024-08-10T10:30:00Z'),
    syncStatus: 'success',
    features: ['Auto-sync emails', 'Smart filing', 'Email templates', 'Candidate matching'],
    requiredScopes: ['read', 'write', 'modify'],
    webhookUrl: 'https://api.recruitflow.com/webhooks/gmail'
  },
  {
    id: 'gcal-1',
    name: 'Google Calendar',
    category: 'calendar',
    icon: '📅',
    description: 'Two-way calendar sync for interviews and meetings',
    provider: 'google',
    isConnected: true,
    isEnabled: true,
    lastSync: new Date('2024-08-10T10:25:00Z'),
    syncStatus: 'success',
    features: ['Two-way sync', 'Auto-scheduling', 'Meeting prep', 'Reminders'],
    requiredScopes: ['calendar.events', 'calendar.readonly']
  },
  {
    id: 'linkedin-1',
    name: 'LinkedIn',
    category: 'social',
    icon: '💼',
    description: 'Import candidates and post jobs to LinkedIn',
    provider: 'linkedin',
    isConnected: true,
    isEnabled: true,
    lastSync: new Date('2024-08-10T09:45:00Z'),
    syncStatus: 'success',
    features: ['Candidate import', 'Profile matching', 'Job posting', 'Messaging'],
    requiredScopes: ['profile', 'network', 'recruiting']
  },
  {
    id: 'indeed-1',
    name: 'Indeed',
    category: 'job-board',
    icon: '🎯',
    description: 'Post jobs and manage applications from Indeed',
    provider: 'indeed',
    isConnected: true,
    isEnabled: true,
    lastSync: new Date('2024-08-10T08:15:00Z'),
    syncStatus: 'success',
    features: ['Job posting', 'Application tracking', 'Analytics', 'Featured listings'],
    requiredScopes: ['job.write', 'application.read']
  },
  {
    id: 'whatsapp-1',
    name: 'WhatsApp Business',
    category: 'communication',
    icon: '💬',
    description: 'Direct messaging with candidates and clients',
    provider: 'meta',
    isConnected: false,
    isEnabled: false,
    syncStatus: 'idle',
    features: ['Direct messaging', 'Templates', 'Media sharing', 'Business hours'],
    requiredScopes: ['messages.write', 'messages.read']
  },
  {
    id: 'outlook-1',
    name: 'Outlook',
    category: 'email',
    icon: '📨',
    description: 'Microsoft Outlook email integration',
    provider: 'microsoft',
    isConnected: false,
    isEnabled: false,
    syncStatus: 'idle',
    features: ['Email sync', 'Calendar integration', 'Contact sync', 'Teams meetings'],
    requiredScopes: ['mail.read', 'mail.send', 'calendars.readwrite']
  },
  {
    id: 'glassdoor-1',
    name: 'Glassdoor',
    category: 'job-board',
    icon: '🏢',
    description: 'Post jobs to Glassdoor and access company insights',
    provider: 'glassdoor',
    isConnected: false,
    isEnabled: false,
    syncStatus: 'idle',
    features: ['Job posting', 'Company reviews', 'Salary data', 'Employer branding'],
    requiredScopes: ['jobs.write', 'company.read']
  },
  {
    id: 'zoom-1',
    name: 'Zoom',
    category: 'communication',
    icon: '📹',
    description: 'Video interview scheduling and management',
    provider: 'zoom',
    isConnected: true,
    isEnabled: true,
    lastSync: new Date('2024-08-10T10:00:00Z'),
    syncStatus: 'success',
    features: ['Meeting scheduling', 'Recording', 'Waiting rooms', 'Calendar integration'],
    requiredScopes: ['meeting.write', 'recording.read']
  }
]

export const mockEmailIntegration: EmailIntegration = {
  id: 'gmail-1',
  provider: 'gmail',
  email: 'recruiter@recruitflow.com',
  displayName: 'John Recruiter',
  isConnected: true,
  autoSync: true,
  smartFiling: true,
  syncFrequency: 15,
  folders: [
    {
      id: 'folder-1',
      name: 'Candidates',
      type: 'candidates',
      autoFile: true,
      keywords: ['resume', 'cv', 'application', 'interested', 'candidate']
    },
    {
      id: 'folder-2',
      name: 'Clients',
      type: 'clients',
      autoFile: true,
      keywords: ['job posting', 'requirement', 'hiring', 'position', 'client']
    },
    {
      id: 'folder-3',
      name: 'Interviews',
      type: 'custom',
      autoFile: true,
      keywords: ['interview', 'meeting', 'schedule', 'appointment']
    }
  ],
  lastSync: new Date('2024-08-10T10:30:00Z'),
  syncedEmails: 1247,
  settings: {
    autoFileEmails: true,
    candidateKeywords: ['resume', 'cv', 'portfolio', 'experience', 'skills'],
    clientKeywords: ['hiring', 'position', 'job', 'requirement', 'vacancy'],
    jobKeywords: ['developer', 'manager', 'analyst', 'designer', 'engineer'],
    notificationPreferences: {
      newCandidateEmail: true,
      clientResponse: true,
      interviewReminders: true
    }
  }
}

export const mockCalendarIntegration: CalendarIntegration = {
  id: 'gcal-1',
  provider: 'google',
  email: 'recruiter@recruitflow.com',
  displayName: 'John Recruiter',
  isConnected: true,
  twoWaySync: true,
  defaultCalendar: 'primary',
  calendars: [
    {
      id: 'primary',
      name: 'Primary Calendar',
      color: '#1976d2',
      isDefault: true,
      syncEnabled: true
    },
    {
      id: 'interviews',
      name: 'Interviews',
      color: '#f57c00',
      isDefault: false,
      syncEnabled: true
    },
    {
      id: 'meetings',
      name: 'Client Meetings',
      color: '#388e3c',
      isDefault: false,
      syncEnabled: true
    }
  ],
  meetingTypes: [
    {
      id: 'interview-1',
      name: 'Technical Interview',
      duration: 60,
      description: 'Technical skills assessment',
      location: 'Video Call',
      isVideoCall: true,
      autoJoinUrl: 'https://meet.google.com/',
      bufferTime: 15
    },
    {
      id: 'interview-2',
      name: 'Initial Screening',
      duration: 30,
      description: 'Initial candidate screening call',
      isVideoCall: true,
      bufferTime: 10
    },
    {
      id: 'meeting-1',
      name: 'Client Consultation',
      duration: 45,
      description: 'Client requirements discussion',
      isVideoCall: false,
      bufferTime: 15
    }
  ],
  settings: {
    autoScheduling: true,
    bufferTimeBefore: 15,
    bufferTimeAfter: 10,
    workingHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'America/New_York',
      workingDays: [1, 2, 3, 4, 5]
    },
    meetingPreferences: {
      defaultDuration: 30,
      defaultLocation: 'Video Call',
      autoAddVideoCall: true,
      sendReminders: true
    }
  }
}

export const mockLinkedInIntegration: LinkedInIntegration = {
  id: 'linkedin-1',
  profileId: 'john-recruiter-123',
  displayName: 'John Recruiter',
  profileUrl: 'https://linkedin.com/in/john-recruiter-123',
  isConnected: true,
  isPremium: true,
  connectionCount: 2847,
  features: {
    candidateImport: true,
    profileMatching: true,
    jobPosting: true,
    messaging: true,
    insights: true
  },
  quotaUsage: {
    searches: { used: 45, limit: 100, resetDate: new Date('2024-09-01') },
    messages: { used: 28, limit: 50, resetDate: new Date('2024-09-01') },
    profileViews: { used: 156, limit: 300, resetDate: new Date('2024-09-01') }
  },
  settings: {
    autoImportProfiles: true,
    matchingCriteria: {
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript'],
      experience: 3,
      location: ['New York', 'San Francisco', 'Remote'],
      industries: ['Technology', 'Software', 'Fintech']
    },
    messagingTemplates: [
      {
        id: 'template-1',
        name: 'Connection Request',
        subject: 'Exciting opportunity in {industry}',
        content: 'Hi {firstName}, I came across your profile and was impressed by your {skill} experience. I have an exciting {position} opportunity that might interest you.',
        type: 'connection',
        variables: ['firstName', 'skill', 'position', 'industry']
      },
      {
        id: 'template-2',
        name: 'Interview Invitation',
        subject: 'Interview opportunity with {company}',
        content: 'Hi {firstName}, Thank you for your interest in the {position} role. We would love to schedule an interview with you.',
        type: 'interview-invite',
        variables: ['firstName', 'position', 'company']
      }
    ]
  }
}

export const mockJobBoardIntegrations: JobBoardIntegration[] = [
  {
    id: 'indeed-1',
    provider: 'indeed',
    name: 'Indeed',
    isConnected: true,
    autoPosting: true,
    postingQuota: {
      used: 12,
      limit: 25,
      resetDate: new Date('2024-09-01')
    },
    defaultSettings: {
      duration: 30,
      featured: false,
      urgentHiring: false,
      remoteOptions: true,
      salaryVisible: true,
      companyLogoVisible: true,
      autoRepost: true,
      keywords: ['remote', 'flexible', 'competitive salary'],
      targetAudience: {
        experienceLevel: ['entry', 'mid', 'senior'],
        education: ['bachelor', 'master'],
        location: ['remote', 'hybrid', 'onsite']
      }
    },
    activeJobs: 8,
    totalViews: 2847,
    totalApplications: 156
  },
  {
    id: 'linkedin-jobs-1',
    provider: 'linkedin-jobs',
    name: 'LinkedIn Jobs',
    isConnected: true,
    autoPosting: false,
    postingQuota: {
      used: 5,
      limit: 10,
      resetDate: new Date('2024-09-01')
    },
    defaultSettings: {
      duration: 30,
      featured: true,
      urgentHiring: false,
      remoteOptions: true,
      salaryVisible: false,
      companyLogoVisible: true,
      autoRepost: false,
      keywords: ['linkedin', 'professional', 'network'],
      targetAudience: {
        experienceLevel: ['mid', 'senior', 'executive'],
        education: ['bachelor', 'master', 'phd'],
        location: ['remote', 'major cities']
      }
    },
    activeJobs: 3,
    totalViews: 1523,
    totalApplications: 89
  }
]

export const mockCommunicationIntegrations: CommunicationIntegration[] = [
  {
    id: 'zoom-1',
    provider: 'zoom',
    name: 'Zoom',
    isConnected: true,
    isEnabled: true,
    settings: {
      autoNotifications: true,
      businessHours: {
        enabled: true,
        start: '09:00',
        end: '17:00',
        timezone: 'America/New_York',
        workingDays: [1, 2, 3, 4, 5]
      },
      templates: {
        interviewReminder: 'Hi {name}, this is a reminder about your interview tomorrow at {time}. Join here: {link}',
        statusUpdate: 'Hi {name}, your application status has been updated to: {status}',
        welcome: 'Welcome to RecruitFlow! We\'re excited to work with you.',
        followUp: 'Hi {name}, following up on our conversation about the {position} role.'
      },
      restrictions: {
        maxMessagesPerDay: 50,
        blacklistedNumbers: [],
        requireOptIn: true
      }
    },
    usage: {
      messagesMonth: 234,
      callsMonth: 67,
      lastActivity: new Date('2024-08-10T10:00:00Z')
    }
  },
  {
    id: 'whatsapp-1',
    provider: 'whatsapp',
    name: 'WhatsApp Business',
    isConnected: false,
    isEnabled: false,
    settings: {
      autoNotifications: false,
      businessHours: {
        enabled: true,
        start: '09:00',
        end: '18:00',
        timezone: 'America/New_York',
        workingDays: [1, 2, 3, 4, 5]
      },
      templates: {
        interviewReminder: 'Hi {name}, reminder: interview tomorrow at {time}',
        statusUpdate: 'Application update: {status}',
        welcome: 'Welcome! We\'re here to help with your job search.',
        followUp: 'Following up on the {position} opportunity'
      },
      restrictions: {
        maxMessagesPerDay: 100,
        blacklistedNumbers: [],
        requireOptIn: true
      }
    },
    usage: {
      messagesMonth: 0,
      callsMonth: 0,
      lastActivity: new Date('2024-07-15T14:30:00Z')
    }
  }
]

export const mockRecentActivity: IntegrationActivity[] = [
  {
    id: 'activity-1',
    integrationId: 'gmail-1',
    type: 'sync',
    status: 'success',
    message: 'Successfully synced 23 new emails',
    recordsProcessed: 23,
    timestamp: new Date('2024-08-10T10:30:00Z'),
    duration: 1200
  },
  {
    id: 'activity-2',
    integrationId: 'linkedin-1',
    type: 'import',
    status: 'success',
    message: 'Imported 5 candidate profiles',
    recordsProcessed: 5,
    timestamp: new Date('2024-08-10T09:45:00Z'),
    duration: 3400
  },
  {
    id: 'activity-3',
    integrationId: 'indeed-1',
    type: 'export',
    status: 'success',
    message: 'Posted 2 new job listings',
    recordsProcessed: 2,
    timestamp: new Date('2024-08-10T08:15:00Z'),
    duration: 2100
  },
  {
    id: 'activity-4',
    integrationId: 'gcal-1',
    type: 'sync',
    status: 'success',
    message: 'Synced 12 calendar events',
    recordsProcessed: 12,
    timestamp: new Date('2024-08-10T08:00:00Z'),
    duration: 800
  },
  {
    id: 'activity-5',
    integrationId: 'whatsapp-1',
    type: 'connect',
    status: 'error',
    message: 'Failed to connect WhatsApp Business account',
    errorMessage: 'Invalid API credentials',
    timestamp: new Date('2024-08-09T15:20:00Z')
  }
]

export const mockIntegrationDashboard: IntegrationDashboard = {
  summary: {
    totalIntegrations: 8,
    connectedIntegrations: 5,
    activeIntegrations: 5,
    lastActivity: new Date('2024-08-10T10:30:00Z'),
    syncStatus: 'healthy'
  },
  integrations: mockIntegrations,
  recentActivity: mockRecentActivity,
  usage: {
    emailsSynced: 1247,
    calendarEventsSynced: 89,
    linkedinSearches: 45,
    jobPostings: 17,
    messagesSent: 234
  },
  health: {
    systemStatus: 'operational',
    apiHealth: [
      { provider: 'google', status: 'healthy', responseTime: 120 },
      { provider: 'linkedin', status: 'healthy', responseTime: 180 },
      { provider: 'indeed', status: 'healthy', responseTime: 200 },
      { provider: 'zoom', status: 'healthy', responseTime: 90 },
      { provider: 'whatsapp', status: 'offline', responseTime: 0 }
    ],
    rateLimits: [
      { provider: 'linkedin', usage: 45, limit: 100 },
      { provider: 'gmail', usage: 847, limit: 1000 },
      { provider: 'indeed', usage: 12, limit: 25 }
    ]
  }
}