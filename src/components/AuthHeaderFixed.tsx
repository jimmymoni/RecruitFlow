import React, { useState } from 'react'
import { User, X, Mail, Lock, UserPlus } from 'lucide-react'
import { useTimeBasedTheme } from '../hooks/useTimeBasedTheme'
import { login, signup } from '../services/api'

export const AuthHeaderFixed: React.FC = () => {
  const { theme } = useTimeBasedTheme()
  const [showModal, setShowModal] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  })

  const handleClick = () => {
    setShowModal(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (mode === 'login') {
        const response = await login({ 
          email: formData.email, 
          password: formData.password 
        })
        console.log('Login successful:', response)
        setUser(response.user)
        localStorage.setItem('accessToken', response.accessToken)
        localStorage.setItem('refreshToken', response.refreshToken)
      } else {
        const response = await signup({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        })
        console.log('Signup successful:', response)
        setUser(response.user)
        localStorage.setItem('accessToken', response.accessToken)
        localStorage.setItem('refreshToken', response.refreshToken)
      }
      setShowModal(false)
      setFormData({ email: '', password: '', firstName: '', lastName: '' })
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'Authentication failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError(null)
    setFormData({ email: '', password: '', firstName: '', lastName: '' })
  }

  // If user is logged in, show user info
  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${theme.cardBackground} ${theme.border} border`}>
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <span className={`text-sm ${theme.textPrimary} hidden sm:inline`}>
            {user.firstName} {user.lastName}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className={`px-3 py-2 text-sm ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Account Button */}
      <button
        onClick={handleClick}
        className={`flex items-center space-x-2 px-3 py-2 ${theme.textSecondary} hover:${theme.textPrimary} hover:bg-white/10 rounded-lg transition-all duration-200`}
        title="Sign In / Sign Up"
      >
        <User size={18} />
        <span className="hidden md:inline text-sm">Account</span>
      </button>

      {/* Authentication Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div 
              className={`${theme.border} border rounded-xl shadow-2xl w-full max-w-md p-6 relative`}
              style={{
                backgroundColor: theme.cardBackground?.includes('dark') ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(8px)'
              }}
            >
            
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className={`absolute top-4 right-4 ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className={theme.textSecondary}>
                {mode === 'login' 
                  ? 'Sign in to access your RecruitFlow dashboard' 
                  : 'Join RecruitFlow and streamline your recruitment'
                }
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium ${theme.textPrimary} mb-1`}>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 ${theme.inputBackground} ${theme.border} border rounded-lg ${theme.textPrimary} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.textPrimary} mb-1`}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 ${theme.inputBackground} ${theme.border} border rounded-lg ${theme.textPrimary} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Last name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium ${theme.textPrimary} mb-1`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.textSecondary}`} size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-10 pr-4 py-2 ${theme.inputBackground} ${theme.border} border rounded-lg ${theme.textPrimary} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme.textPrimary} mb-1`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.textSecondary}`} size={18} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className={`w-full pl-10 pr-4 py-2 ${theme.inputBackground} ${theme.border} border rounded-lg ${theme.textPrimary} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder={mode === 'login' ? 'Enter your password' : 'Create a password (min 6 chars)'}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting 
                  ? (mode === 'login' ? 'Signing In...' : 'Creating Account...') 
                  : (mode === 'login' ? 'Sign In' : 'Create Account')
                }
              </button>
            </form>

            {/* Switch Mode */}
            <div className="mt-6 text-center">
              <p className={theme.textSecondary}>
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AuthHeaderFixed