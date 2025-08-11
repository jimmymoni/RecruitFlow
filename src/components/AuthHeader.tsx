import React, { useState, useEffect, useRef } from 'react'
import { LogIn, LogOut, User, UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTimeBasedTheme } from '../hooks/useTimeBasedTheme'
import AuthModal from './AuthModal'

export const AuthHeader: React.FC = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const { theme } = useTimeBasedTheme()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
        <div className="w-20 h-4 bg-gray-300 rounded animate-pulse" />
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${theme.cardBackground} ${theme.border} border hover:bg-opacity-80 transition-all duration-200`}
        >
          <div className={`w-8 h-8 ${theme.accentBackground} rounded-full flex items-center justify-center`}>
            <User size={16} className="text-white" />
          </div>
          <div className="hidden sm:block text-left">
            <p className={`text-sm font-medium ${theme.textPrimary}`}>
              {user.firstName} {user.lastName}
            </p>
            <p className={`text-xs ${theme.textSecondary} capitalize`}>
              {user.role}
            </p>
          </div>
        </button>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <div className={`absolute right-0 top-full mt-2 w-48 ${theme.cardBackground} ${theme.border} border rounded-lg shadow-lg py-2 z-50`}>
            <div className="px-4 py-2 border-b border-gray-200">
              <p className={`text-sm font-medium ${theme.textPrimary}`}>
                {user.firstName} {user.lastName}
              </p>
              <p className={`text-xs ${theme.textSecondary}`}>
                {user.email}
              </p>
            </div>
            <button
              onClick={() => {
                logout()
                setShowUserMenu(false)
              }}
              className={`w-full px-4 py-2 text-left text-sm ${theme.textPrimary} hover:bg-gray-100 flex items-center space-x-2 transition-colors`}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Single Account Button - More Minimal */}
      <button
        onClick={() => handleAuthClick('login')}
        className={`flex items-center space-x-2 px-3 py-2 ${theme.textSecondary} hover:${theme.textPrimary} hover:bg-white/10 rounded-lg transition-all duration-200`}
        title="Sign In / Sign Up"
      >
        <User size={18} />
        <span className="hidden md:inline text-sm">Account</span>
      </button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  )
}

export default AuthHeader