export interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  location: {
    city: string
    state: string
    country: string
  }
  status: 'active' | 'passive' | 'placed' | 'unavailable'
  source: 'linkedin' | 'referral' | 'job_board' | 'website' | 'other'
  title: string
  experience: number // years
  salary: {
    current?: number
    expected?: number
    currency: 'USD' | 'EUR' | 'GBP'
  }
  skills: string[]
  education: {
    degree: string
    institution: string
    year?: number
  }[]
  resume?: {
    url: string
    fileName: string
    uploadedAt: Date
  }
  notes: string
  createdAt: Date
  updatedAt: Date
  lastContact?: Date
  lastContactType?: 'email' | 'call' | 'meeting' | 'note' | 'linkedin' | 'text'
  communicationCount?: number
  tags: string[]
  socialLinks: {
    linkedin?: string
    github?: string
    portfolio?: string
  }
}

export interface CandidateFilters {
  search?: string
  status?: Candidate['status'][]
  skills?: string[]
  location?: string
  experience?: {
    min?: number
    max?: number
  }
  salary?: {
    min?: number
    max?: number
  }
  source?: Candidate['source'][]
}

export type CandidateFormData = Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>