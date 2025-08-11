// API service layer for RecruitFlow backend communication
const API_BASE_URL = 'http://localhost:3001/api'

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

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
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

// Candidates API
export const getCandidates = () => apiRequest<{
  success: boolean
  count: number
  candidates: Array<{
    id: string
    first_name: string
    last_name: string
    email: string
    status: string
  }>
}>('/candidates')

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