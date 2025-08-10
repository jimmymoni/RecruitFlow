export type UserRole = 'admin' | 'senior_recruiter' | 'recruiter' | 'coordinator' | 'sourcer' | 'client_manager'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: Date
  joinedAt: Date
  permissions: string[]
  assignedCandidates: string[]
  assignedJobs: string[]
  assignedClients: string[]
  isActive: boolean
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: UserRole
  content: string
  type: 'text' | 'system' | 'command' | 'file' | 'voice' | 'rich_preview'
  timestamp: Date
  edited?: boolean
  editedAt?: Date
  replyTo?: string
  reactions: Array<{
    emoji: string
    users: string[]
  }>
  attachments?: Array<{
    id: string
    name: string
    type: string
    url: string
    size: number
  }>
  richPreview?: {
    type: 'candidate' | 'job' | 'client'
    id: string
    data: any
  }
  commandResult?: {
    success: boolean
    message: string
    data?: any
  }
}

export interface ChatThread {
  id: string
  name: string
  type: 'main' | 'direct' | 'group' | 'candidate' | 'job' | 'client'
  participants: string[]
  createdBy: string
  createdAt: Date
  lastActivity: Date
  isArchived: boolean
  isPinned: boolean
  unreadCount: number
  contextId?: string // candidate/job/client ID if contextual chat
  contextType?: 'candidate' | 'job' | 'client'
}

export interface SlashCommand {
  command: string
  description: string
  usage: string
  permissions: UserRole[]
  category: 'candidate' | 'job' | 'client' | 'team' | 'system'
  handler: (args: string[], senderId: string) => Promise<ChatMessage>
}

export interface TeamActivity {
  id: string
  type: 'candidate_updated' | 'job_posted' | 'client_added' | 'interview_scheduled' | 'placement_made' | 'user_joined'
  userId: string
  userName: string
  timestamp: Date
  description: string
  entityType?: 'candidate' | 'job' | 'client'
  entityId?: string
  entityName?: string
  details?: Record<string, any>
}

export interface ChatNotification {
  id: string
  userId: string
  threadId: string
  messageId: string
  type: 'mention' | 'direct_message' | 'assignment' | 'urgent'
  isRead: boolean
  createdAt: Date
  content: string
}

export interface Team {
  id: string
  name: string
  description: string
  ownerId: string
  members: TeamMember[]
  settings: {
    allowGuestUsers: boolean
    requireApprovalForJoining: boolean
    retentionDays: number
    allowFileSharing: boolean
    allowVoiceMessages: boolean
    workingHours: {
      start: string
      end: string
      timezone: string
    }
  }
  createdAt: Date
  updatedAt: Date
}