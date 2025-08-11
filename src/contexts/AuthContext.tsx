import React, { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi, signup as signupApi, logout as logoutApi, getUserProfile, refreshToken as refreshTokenApi, LoginCredentials, SignupData, AuthResponse } from '../services/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  phone?: string | null
  avatar?: string | null
  lastLoginAt?: string
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (userData: SignupData) => Promise<void>
  logout: () => void
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Token management
  const getStoredTokens = () => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    return { accessToken, refreshToken }
  }

  const storeTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  const clearTokens = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      const { accessToken, refreshToken } = getStoredTokens()
      
      if (!accessToken) {
        setIsLoading(false)
        return
      }

      try {
        // Try to get user profile with current token
        const profileResponse = await getUserProfile(accessToken)
        setUser(profileResponse.user)
      } catch (error) {
        // If access token is invalid, try to refresh
        if (refreshToken) {
          try {
            const refreshResponse = await refreshTokenApi(refreshToken)
            storeTokens(refreshResponse.accessToken, refreshResponse.refreshToken)
            setUser(refreshResponse.user)
          } catch (refreshError) {
            // Refresh failed, clear tokens
            clearTokens()
          }
        } else {
          clearTokens()
        }
      }
      
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await loginApi(credentials)
      
      storeTokens(response.accessToken, response.refreshToken)
      setUser(response.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (userData: SignupData) => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await signupApi(userData)
      
      storeTokens(response.accessToken, response.refreshToken)
      setUser(response.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearTokens()
      setUser(null)
      setError(null)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    error,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider