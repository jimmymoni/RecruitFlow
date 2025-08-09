export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
  remote: boolean
  salaryMin: number
  salaryMax: number
  currency: string
  description: string
  requirements: string[]
  benefits: string[]
  status: 'draft' | 'active' | 'paused' | 'closed' | 'filled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  postedAt: Date
  closingDate?: Date
  createdBy: string
  updatedAt: Date
  applicationsCount: number
  viewsCount: number
  tags: string[]
  department: string
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive'
  clientId?: string
}

export interface JobFormData {
  title: string
  company: string
  location: string
  type: Job['type']
  remote: boolean
  salaryMin: number
  salaryMax: number
  currency: string
  description: string
  requirements: string[]
  benefits: string[]
  priority: Job['priority']
  closingDate?: Date
  tags: string[]
  department: string
  experienceLevel: Job['experienceLevel']
  clientId?: string
}

export interface JobApplication {
  id: string
  jobId: string
  candidateId: string
  appliedAt: Date
  status: 'applied' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected'
  notes: string
  stage: string
  nextAction?: string
  nextActionDate?: Date
}