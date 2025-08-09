export interface Communication {
  id: string
  candidateId: string
  type: 'email' | 'call' | 'meeting' | 'note' | 'linkedin' | 'text'
  subject?: string
  content: string
  direction: 'inbound' | 'outbound'
  date: Date
  duration?: number // in minutes for calls/meetings
  outcome?: 'positive' | 'negative' | 'neutral' | 'follow-up-needed'
  tags?: string[]
  attachments?: {
    fileName: string
    url: string
    type: string
  }[]
  createdBy: string // recruiter name/id
  createdAt: Date
  updatedAt: Date
}

export interface CommunicationFormData {
  type: Communication['type']
  subject?: string
  content: string
  direction: Communication['direction']
  date: Date
  duration?: number
  outcome?: Communication['outcome']
  tags?: string[]
}

export const CommunicationTypeLabels: Record<Communication['type'], string> = {
  email: 'Email',
  call: 'Phone Call',
  meeting: 'Meeting',
  note: 'Note',
  linkedin: 'LinkedIn Message',
  text: 'Text Message'
}

export const CommunicationTypeIcons: Record<Communication['type'], string> = {
  email: 'Mail',
  call: 'Phone',
  meeting: 'Calendar',
  note: 'FileText',
  linkedin: 'Linkedin',
  text: 'MessageSquare'
}