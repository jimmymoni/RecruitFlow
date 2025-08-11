import React, { createContext, useContext, useState, useEffect } from 'react'
import { getUserProfile } from '../services/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  phone?: string
  avatar?: string
  lastLoginAt?: string
  createdAt?: string
}

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken')
    
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await getUserProfile(token)
      setUser(response.user)
    } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: UserContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    logout,
    checkAuth
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider