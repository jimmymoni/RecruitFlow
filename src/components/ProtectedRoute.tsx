import React from 'react'
import { useUser } from '../contexts/UserContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { user, isAuthenticated, isLoading } = useUser()

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // User is authenticated, show protected content
  if (isAuthenticated) {
    return <>{children}</>
  }

  // User is not authenticated, show fallback or login prompt
  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13-9V6a2 2 0 00-2-2H5a2 2 0 00-2 2v3m0 0v10a2 2 0 002 2h14a2 2 0 002-2V9m0 0V6a2 2 0 00-2-2H5a2 2 0 00-2 2v3"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Authentication Required
          </h2>
          
          <p className="text-gray-300 mb-6">
            Please sign in to access your RecruitFlow dashboard and manage your recruitment pipeline.
          </p>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-200"
          >
            Sign In to Continue
          </button>
          
          <p className="text-gray-400 text-sm mt-4">
            Click the Account button in the header to sign in or create an account.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProtectedRoute