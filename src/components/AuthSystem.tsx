import React, { useState } from 'react'
import { User } from 'lucide-react'
import { login, signup } from '../services/api'
import { useUser } from '../contexts/UserContext'

export const AuthSystem: React.FC = () => {
  const { user, setUser, logout } = useUser()
  const [credentials, setCredentials] = useState({ email: 'test@test.com', password: '123456' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await login(credentials)
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      setUser(response.user)
      setMessage('Login successful!')
    } catch (error: any) {
      setMessage(`Login failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await signup({
        email: credentials.email,
        password: credentials.password,
        firstName: 'Test',
        lastName: 'User'
      })
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      setUser(response.user)
      setMessage('Signup successful!')
    } catch (error: any) {
      setMessage(`Signup failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setMessage('Logged out')
  }

  // If user is logged in, show user info in header style
  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-600">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <span className="text-sm text-white hidden sm:inline">
            {user.firstName} {user.lastName}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    )
  }

  // If not logged in, show centered auth panel
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(17, 24, 39, 0.95)', // dark-900 with opacity
      backdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px', // Add padding to prevent edge cropping
      boxSizing: 'border-box',
      overflow: 'hidden', // Prevent any scrollbars on the main container
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'rgba(31, 41, 55, 0.95)', // dark-800 with opacity
        padding: '24px', // Optimized padding
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        height: 'fit-content', // Let content determine height naturally
        maxHeight: 'calc(100vh - 40px)', // Ensure it fits within viewport
        border: '1px solid rgba(75, 85, 99, 0.3)', // dark-600 with opacity
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(16px)',
        boxSizing: 'border-box',
        overflow: 'visible', // Remove any internal scrolling
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            boxShadow: '0 8px 32px rgba(14, 165, 233, 0.3)'
          }}>
            <span style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>RF</span>
          </div>
          <h1 style={{ 
            color: '#f3f4f6', // dark-100
            fontSize: '24px', 
            fontWeight: '700',
            margin: '0 0 6px 0'
          }}>
            Welcome to RecruitFlow
          </h1>
          <p style={{ 
            color: '#9ca3af', // dark-400
            fontSize: '14px',
            margin: 0
          }}>
            Sign in to access your recruitment dashboard
          </p>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            marginBottom: '18px',
            padding: '10px 14px',
            backgroundColor: message.includes('failed') 
              ? 'rgba(239, 68, 68, 0.1)' 
              : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${message.includes('failed') 
              ? 'rgba(239, 68, 68, 0.3)' 
              : 'rgba(16, 185, 129, 0.3)'}`,
            borderRadius: '8px',
            color: message.includes('failed') ? '#f87171' : '#10b981',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#f3f4f6', // dark-100
              marginBottom: '6px'
            }}>
              Email Address
            </label>
            <input 
              type="email" 
              value={credentials.email} 
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#374151', // dark-700
                border: '1px solid #4b5563', // dark-600
                borderRadius: '8px',
                color: '#f3f4f6', // dark-100
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#4b5563'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#f3f4f6', // dark-100
              marginBottom: '6px'
            }}>
              Password
            </label>
            <input 
              type="password" 
              value={credentials.password} 
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#374151', // dark-700
                border: '1px solid #4b5563', // dark-600
                borderRadius: '8px',
                color: '#f3f4f6', // dark-100
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#4b5563'}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button 
              onClick={handleLogin} 
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 24px',
                background: loading ? '#4b5563' : 'linear-gradient(135deg, #059669, #10b981)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)'
                }
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <button 
              onClick={handleSignup} 
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 24px',
                background: loading ? '#4b5563' : 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'
                }
              }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>

          {/* Footer */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: 'auto', // Push to bottom with flex
            paddingTop: '20px',
            paddingBottom: '4px'
          }}>
            <p style={{ 
              color: '#6b7280', // dark-500
              fontSize: '13px',
              margin: 0,
              lineHeight: '1.4'
            }}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthSystem