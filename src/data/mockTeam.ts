import { TeamMember, ChatThread, ChatMessage, TeamActivity, Team, SlashCommand } from '../types/team'

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'user-1',
    name: 'John Recruiter',
    email: 'john@recruitflow.com',
    role: 'admin',
    avatar: '👨‍💼',
    status: 'online',
    lastSeen: new Date(),
    joinedAt: new Date('2023-01-01'),
    permissions: ['*'],
    assignedCandidates: ['1', '3', '5'],
    assignedJobs: ['1', '2'],
    assignedClients: ['client-1', 'client-2'],
    isActive: true
  },
  {
    id: 'user-2',
    name: 'Sarah Mitchell',
    email: 'sarah@recruitflow.com',
    role: 'senior_recruiter',
    avatar: '👩‍💼',
    status: 'online',
    lastSeen: new Date(),
    joinedAt: new Date('2023-02-15'),
    permissions: ['manage_candidates', 'manage_jobs', 'approve_offers'],
    assignedCandidates: ['2', '4'],
    assignedJobs: ['3', '4'],
    assignedClients: ['client-3'],
    isActive: true
  },
  {
    id: 'user-3',
    name: 'Mike Johnson',
    email: 'mike@recruitflow.com',
    role: 'recruiter',
    avatar: '🧑‍💻',
    status: 'away',
    lastSeen: new Date(Date.now() - 30 * 60 * 1000),
    joinedAt: new Date('2023-03-10'),
    permissions: ['manage_candidates', 'manage_jobs'],
    assignedCandidates: ['6', '7'],
    assignedJobs: ['5'],
    assignedClients: [],
    isActive: true
  },
  {
    id: 'user-4',
    name: 'Lisa Chen',
    email: 'lisa@recruitflow.com',
    role: 'coordinator',
    avatar: '👩‍🎓',
    status: 'online',
    lastSeen: new Date(),
    joinedAt: new Date('2023-04-05'),
    permissions: ['schedule_interviews', 'manage_communications'],
    assignedCandidates: [],
    assignedJobs: [],
    assignedClients: ['client-4', 'client-5'],
    isActive: true
  },
  {
    id: 'user-5',
    name: 'David Park',
    email: 'david@recruitflow.com',
    role: 'sourcer',
    avatar: '🕵️‍♂️',
    status: 'busy',
    lastSeen: new Date(),
    joinedAt: new Date('2023-05-20'),
    permissions: ['add_candidates', 'initial_contact'],
    assignedCandidates: ['8', '9', '10'],
    assignedJobs: [],
    assignedClients: [],
    isActive: true
  }
]

export const mockChatThreads: ChatThread[] = [
  {
    id: 'main-chat',
    name: 'Main Team Chat',
    type: 'main',
    participants: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    createdBy: 'user-1',
    createdAt: new Date('2023-01-01'),
    lastActivity: new Date(),
    isArchived: false,
    isPinned: true,
    unreadCount: 3
  },
  {
    id: 'techcorp-project',
    name: 'TechCorp Senior Dev Search',
    type: 'group',
    participants: ['user-1', 'user-2', 'user-3'],
    createdBy: 'user-2',
    createdAt: new Date('2024-01-10'),
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isArchived: false,
    isPinned: false,
    unreadCount: 1
  },
  {
    id: 'candidate-john-doe',
    name: 'John Doe Application',
    type: 'candidate',
    participants: ['user-2', 'user-4'],
    createdBy: 'user-2',
    createdAt: new Date('2024-01-12'),
    lastActivity: new Date(Date.now() - 30 * 60 * 1000),
    isArchived: false,
    isPinned: false,
    unreadCount: 0,
    contextId: '1',
    contextType: 'candidate'
  }
]

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'user-2',
    senderName: 'Sarah Mitchell',
    senderRole: 'senior_recruiter',
    content: 'Good morning team! 🌅 Ready to place some great candidates today?',
    type: 'text',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    reactions: [
      { emoji: '👍', users: ['user-3', 'user-4'] },
      { emoji: '🚀', users: ['user-1'] }
    ]
  },
  {
    id: 'msg-2',
    senderId: 'user-5',
    senderName: 'David Park',
    senderRole: 'sourcer',
    content: 'Found an amazing candidate for the TechCorp role. /share-candidate john-doe',
    type: 'command',
    timestamp: new Date(Date.now() - 90 * 60 * 1000),
    reactions: [],
    richPreview: {
      type: 'candidate',
      id: '1',
      data: {
        name: 'John Doe',
        title: 'Senior React Developer',
        experience: '6 years',
        skills: ['React', 'TypeScript', 'Node.js']
      }
    }
  },
  {
    id: 'msg-3',
    senderId: 'system',
    senderName: 'RecruitFlow Bot',
    senderRole: 'admin',
    content: '✅ John Doe has been assigned to Sarah Mitchell for the TechCorp Senior Developer position.',
    type: 'system',
    timestamp: new Date(Date.now() - 85 * 60 * 1000),
    reactions: [],
    commandResult: {
      success: true,
      message: 'Candidate successfully assigned'
    }
  },
  {
    id: 'msg-4',
    senderId: 'user-3',
    senderName: 'Mike Johnson',
    senderRole: 'recruiter',
    content: '@sarah Great choice! I reviewed his portfolio yesterday. Very strong React skills.',
    type: 'text',
    timestamp: new Date(Date.now() - 80 * 60 * 1000),
    reactions: [
      { emoji: '💯', users: ['user-2'] }
    ]
  },
  {
    id: 'msg-5',
    senderId: 'user-4',
    senderName: 'Lisa Chen',
    senderRole: 'coordinator',
    content: '/schedule-interview john-doe tomorrow-2pm with sarah and techcorp-team',
    type: 'command',
    timestamp: new Date(Date.now() - 75 * 60 * 1000),
    reactions: [],
    commandResult: {
      success: true,
      message: 'Interview scheduled for tomorrow at 2:00 PM'
    }
  },
  {
    id: 'msg-6',
    senderId: 'user-1',
    senderName: 'John Recruiter',
    senderRole: 'admin',
    content: 'Team update: We\'re at 85% of our monthly placement goal! 🎯 Keep up the excellent work everyone.',
    type: 'text',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    reactions: [
      { emoji: '🔥', users: ['user-2', 'user-3', 'user-4', 'user-5'] },
      { emoji: '💪', users: ['user-2', 'user-5'] }
    ]
  },
  {
    id: 'msg-7',
    senderId: 'user-2',
    senderName: 'Sarah Mitchell',
    senderRole: 'senior_recruiter',
    content: '/update-status john-doe interviewing "Technical interview scheduled for tomorrow"',
    type: 'command',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    reactions: [],
    commandResult: {
      success: true,
      message: 'John Doe status updated to Interviewing'
    }
  }
]

export const mockTeamActivities: TeamActivity[] = [
  {
    id: 'activity-1',
    type: 'candidate_updated',
    userId: 'user-2',
    userName: 'Sarah Mitchell',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    description: 'Updated candidate status to Interviewing',
    entityType: 'candidate',
    entityId: '1',
    entityName: 'John Doe',
    details: { previousStatus: 'Applied', newStatus: 'Interviewing' }
  },
  {
    id: 'activity-2',
    type: 'interview_scheduled',
    userId: 'user-4',
    userName: 'Lisa Chen',
    timestamp: new Date(Date.now() - 75 * 60 * 1000),
    description: 'Scheduled technical interview',
    entityType: 'candidate',
    entityId: '1',
    entityName: 'John Doe',
    details: { date: 'tomorrow-2pm', participants: ['sarah', 'techcorp-team'] }
  },
  {
    id: 'activity-3',
    type: 'job_posted',
    userId: 'user-1',
    userName: 'John Recruiter',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    description: 'Posted new job opening',
    entityType: 'job',
    entityId: '6',
    entityName: 'Product Manager - StartupXYZ',
    details: { salary: '$90k-120k', remote: true }
  }
]

export const mockSlashCommands: SlashCommand[] = [
  {
    command: '/assign-candidate',
    description: 'Assign a candidate to a team member',
    usage: '/assign-candidate @user candidate-name',
    permissions: ['admin', 'senior_recruiter'],
    category: 'candidate',
    handler: async (args: string[], _senderId: string) => ({
      id: Date.now().toString(),
      senderId: 'system',
      senderName: 'RecruitFlow Bot',
      senderRole: 'admin',
      content: `✅ Candidate ${args[1]} assigned to ${args[0]}`,
      type: 'system',
      timestamp: new Date(),
      reactions: [],
      commandResult: { success: true, message: 'Assignment completed' }
    })
  },
  {
    command: '/update-status',
    description: 'Update candidate or job status',
    usage: '/update-status entity-name new-status "optional note"',
    permissions: ['admin', 'senior_recruiter', 'recruiter'],
    category: 'candidate',
    handler: async (args: string[], _senderId: string) => ({
      id: Date.now().toString(),
      senderId: 'system',
      senderName: 'RecruitFlow Bot',
      senderRole: 'admin',
      content: `✅ Status updated: ${args[0]} → ${args[1]}`,
      type: 'system',
      timestamp: new Date(),
      reactions: [],
      commandResult: { success: true, message: 'Status updated successfully' }
    })
  },
  {
    command: '/schedule-interview',
    description: 'Schedule an interview',
    usage: '/schedule-interview candidate-name time participants',
    permissions: ['admin', 'senior_recruiter', 'recruiter', 'coordinator'],
    category: 'candidate',
    handler: async (args: string[], _senderId: string) => ({
      id: Date.now().toString(),
      senderId: 'system',
      senderName: 'RecruitFlow Bot',
      senderRole: 'admin',
      content: `📅 Interview scheduled: ${args[0]} at ${args[1]}`,
      type: 'system',
      timestamp: new Date(),
      reactions: [],
      commandResult: { success: true, message: 'Interview scheduled successfully' }
    })
  },
  {
    command: '/share-candidate',
    description: 'Share candidate profile in chat',
    usage: '/share-candidate candidate-name',
    permissions: ['admin', 'senior_recruiter', 'recruiter', 'sourcer'],
    category: 'candidate',
    handler: async (args: string[], _senderId: string) => ({
      id: Date.now().toString(),
      senderId: 'system',
      senderName: 'RecruitFlow Bot',
      senderRole: 'admin',
      content: `📋 Candidate Profile: ${args[0]}`,
      type: 'rich_preview',
      timestamp: new Date(),
      reactions: [],
      richPreview: {
        type: 'candidate',
        id: args[0],
        data: { name: args[0] }
      }
    })
  },
  {
    command: '/post-job',
    description: 'Quickly post a new job',
    usage: '/post-job job-title @assignee',
    permissions: ['admin', 'senior_recruiter'],
    category: 'job',
    handler: async (args: string[], _senderId: string) => ({
      id: Date.now().toString(),
      senderId: 'system',
      senderName: 'RecruitFlow Bot',
      senderRole: 'admin',
      content: `💼 New job posted: ${args[0]} assigned to ${args[1]}`,
      type: 'system',
      timestamp: new Date(),
      reactions: [],
      commandResult: { success: true, message: 'Job posted successfully' }
    })
  }
]

export const mockTeam: Team = {
  id: 'team-1',
  name: 'RecruitFlow Agency',
  description: 'Premier recruitment agency specializing in tech talent',
  ownerId: 'user-1',
  members: mockTeamMembers,
  settings: {
    allowGuestUsers: false,
    requireApprovalForJoining: true,
    retentionDays: 90,
    allowFileSharing: true,
    allowVoiceMessages: true,
    workingHours: {
      start: '09:00',
      end: '18:00',
      timezone: 'PST'
    }
  },
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date()
}