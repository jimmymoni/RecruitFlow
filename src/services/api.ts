// API service layer for RecruitFlow backend communication
const API_BASE_URL = 'http://localhost:3003/api'

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // Add authentication token if available
  const token = localStorage.getItem('accessToken')
  if (token && !config.headers?.['Authorization']) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    }
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

// Health check
export const healthCheck = () => apiRequest<{
  status: string
  message: string
  timestamp: string
  supabase: {
    url: string
    hasKey: boolean
    keyLength: number
  }
}>('/health')

// Users API
export const getUsers = () => apiRequest<{
  success: boolean
  count: number
  users: Array<{
    id: string
    email: string
    first_name: string
    last_name: string
    role: string
  }>
}>('/users')

// Candidates API Types
export interface CandidateData {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  location?: string
  status?: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn'
  summary?: string
  skills?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface CandidatesResponse {
  success: boolean
  candidates: CandidateData[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CandidateResponse {
  success: boolean
  candidate: CandidateData
  message?: string
}

// Candidates API Functions
export const getCandidates = (params: {
  page?: number
  limit?: number
  search?: string
  status?: string
  skills?: string
} = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString())
    }
  })
  
  const query = searchParams.toString()
  return apiRequest<CandidatesResponse>(`/candidates${query ? `?${query}` : ''}`)
}

export const getCandidate = (id: string) => 
  apiRequest<CandidateResponse>(`/candidates/${id}`)

export const createCandidate = (candidateData: Omit<CandidateData, 'id' | 'createdAt' | 'updatedAt'>) => 
  apiRequest<CandidateResponse>('/candidates', {
    method: 'POST',
    body: JSON.stringify(candidateData)
  })

export const updateCandidate = (id: string, candidateData: Partial<CandidateData>) => 
  apiRequest<CandidateResponse>(`/candidates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(candidateData)
  })

export const deleteCandidate = (id: string) => 
  apiRequest<{ success: boolean; message: string }>(`/candidates/${id}`, {
    method: 'DELETE'
  })

export const getCandidateStats = () => 
  apiRequest<{
    success: boolean
    stats: {
      total: number
      recent: number
      byStatus: Record<string, number>
      activeStatuses: number
    }
  }>('/candidates/stats/overview')

// Jobs API Types
export interface JobData {
  id?: string
  title: string
  company: string
  location?: string
  type?: 'full-time' | 'part-time' | 'contract' | 'internship'
  status?: 'draft' | 'active' | 'paused' | 'closed' | 'filled'
  description?: string
  requirements?: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  benefits?: string
  skillsRequired?: string[]
  experienceLevel?: 'junior' | 'mid' | 'senior' | 'lead'
  closingDate?: string
  isRemote?: boolean
  applicationsCount?: number
  viewsCount?: number
  postedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface JobsResponse {
  success: boolean
  jobs: JobData[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface JobResponse {
  success: boolean
  job: JobData
  message?: string
}

// Jobs API Functions
export const getJobs = (params: {
  page?: number
  limit?: number
  search?: string
  status?: string
  location?: string
  company?: string
} = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString())
    }
  })
  
  const query = searchParams.toString()
  return apiRequest<JobsResponse>(`/jobs${query ? `?${query}` : ''}`)
}

export const getJob = (id: string) => 
  apiRequest<JobResponse>(`/jobs/${id}`)

export const createJob = (jobData: Omit<JobData, 'id' | 'createdAt' | 'updatedAt' | 'applicationsCount' | 'viewsCount'>) => 
  apiRequest<JobResponse>('/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData)
  })

export const updateJob = (id: string, jobData: Partial<JobData>) => 
  apiRequest<JobResponse>(`/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(jobData)
  })

export const deleteJob = (id: string) => 
  apiRequest<{ success: boolean; message: string }>(`/jobs/${id}`, {
    method: 'DELETE'
  })

export const updateJobStatus = (id: string, status: string) => 
  apiRequest<JobResponse>(`/jobs/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status })
  })

export const getJobStats = () => 
  apiRequest<{
    success: boolean
    stats: {
      total: number
      active: number
      recent: number
      byStatus: Record<string, number>
      draft: number
      closed: number
      filled: number
    }
  }>('/jobs/stats/overview')

// Clients API Types
export interface ClientData {
  id?: string
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  website?: string
  industry?: string
  companySize?: string
  status?: 'prospective' | 'active' | 'contract_signed' | 'inactive' | 'terminated'
  billingAddress?: string
  notes?: string
  contractStartDate?: string
  contractEndDate?: string
  paymentTerms?: string
  totalJobsPosted?: number
  totalPlacements?: number
  totalRevenue?: number
  satisfactionRating?: number
  preferredCommunication?: 'email' | 'phone' | 'slack' | 'teams'
  timezone?: string
  createdAt?: string
  updatedAt?: string
}

export interface ClientsResponse {
  success: boolean
  clients: ClientData[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ClientResponse {
  success: boolean
  client: ClientData
  message?: string
}

// Clients API Functions
export const getClients = (params: {
  page?: number
  limit?: number
  search?: string
  status?: string
  industry?: string
} = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString())
    }
  })
  
  const query = searchParams.toString()
  return apiRequest<ClientsResponse>(`/clients${query ? `?${query}` : ''}`)
}

export const getClient = (id: string) => 
  apiRequest<ClientResponse>(`/clients/${id}`)

export const createClient = (clientData: Omit<ClientData, 'id' | 'createdAt' | 'updatedAt' | 'totalJobsPosted' | 'totalPlacements' | 'totalRevenue'>) => 
  apiRequest<ClientResponse>('/clients', {
    method: 'POST',
    body: JSON.stringify(clientData)
  })

export const updateClient = (id: string, clientData: Partial<ClientData>) => 
  apiRequest<ClientResponse>(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clientData)
  })

export const deleteClient = (id: string) => 
  apiRequest<{ success: boolean; message: string }>(`/clients/${id}`, {
    method: 'DELETE'
  })

export const getClientStats = () => 
  apiRequest<{
    success: boolean
    stats: {
      total: number
      active: number
      recent: number
      byStatus: Record<string, number>
      prospective: number
      inactive: number
    }
  }>('/clients/stats/overview')

// Files API Types
export interface FileData {
  id?: string
  filename: string
  originalName: string
  fileType: string
  fileSize: number
  mimeType?: string
  url: string
  category?: 'resume' | 'portfolio' | 'contract' | 'document' | 'image' | 'other'
  tags?: string[]
  isPublic?: boolean
  description?: string
  associatedWith?: Record<string, any>
  version?: number
  status?: 'uploading' | 'ready' | 'processing' | 'error'
  uploadedBy?: string
  uploadedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface FilesResponse {
  success: boolean
  files: FileData[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface FileResponse {
  success: boolean
  file: FileData
  message?: string
}

export interface FileUploadResponse {
  success: boolean
  files: FileData[]
  message: string
  errors?: any[]
  partialSuccess?: boolean
}

// Files API Functions
export const uploadFiles = (formData: FormData) => 
  apiRequest<FileUploadResponse>('/files/upload', {
    method: 'POST',
    body: formData,
    headers: {} // Remove Content-Type to let browser set it for FormData
  })

export const getFiles = (params: {
  page?: number
  limit?: number
  search?: string
  category?: string
  tags?: string
} = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString())
    }
  })
  
  const query = searchParams.toString()
  return apiRequest<FilesResponse>(`/files${query ? `?${query}` : ''}`)
}

export const getFile = (id: string) => 
  apiRequest<FileResponse>(`/files/${id}`)

export const deleteFile = (id: string) => 
  apiRequest<{ success: boolean; message: string }>(`/files/${id}`, {
    method: 'DELETE'
  })

export const getFileStats = () => 
  apiRequest<{
    success: boolean
    stats: {
      total: number
      recent: number
      byCategory: Record<string, number>
      totalSizeBytes: number
      totalSizeMB: number
    }
  }>('/files/stats/overview')

// Authentication API
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
  phone?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    isActive: boolean
    createdAt?: string
    lastLoginAt?: string
  }
  accessToken: string
  refreshToken: string
}

export interface UserProfile {
  success: boolean
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    isActive: boolean
    phone: string | null
    avatar: string | null
    lastLoginAt: string
    createdAt: string
  }
}

export const login = (credentials: LoginCredentials) => 
  apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })

export const signup = (userData: SignupData) => 
  apiRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  })

export const logout = () => 
  apiRequest<{ success: boolean; message: string }>('/auth/logout', {
    method: 'POST'
  })

export const getUserProfile = (token: string) => 
  apiRequest<UserProfile>('/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

export const refreshToken = (refreshToken: string) => 
  apiRequest<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  })

// Generic CRUD operations for future expansion
export const createRecord = <T>(endpoint: string, data: any) => 
  apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  })

export const updateRecord = <T>(endpoint: string, data: any) => 
  apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  })

export const deleteRecord = <T>(endpoint: string) => 
  apiRequest<T>(endpoint, {
    method: 'DELETE'
  })

// Error handling utility
export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'APIError'
  }
}

export default {
  healthCheck,
  getUsers,
  getCandidates,
  createRecord,
  updateRecord,
  deleteRecord
}