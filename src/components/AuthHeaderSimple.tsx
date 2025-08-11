import React, { useState } from 'react'
import { User, X } from 'lucide-react'
import { useTimeBasedTheme } from '../hooks/useTimeBasedTheme'

export const AuthHeaderSimple: React.FC = () => {
  const { theme } = useTimeBasedTheme()
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    console.log('Account button clicked - no freeze')
    try {
      setShowModal(true)
      console.log('Modal state set to true')
    } catch (error) {
      console.error('Error setting modal state:', error)
    }
  }

  return (
    <>
      {/* Simple Account Button */}
      <button
        onClick={handleClick}
        className={`flex items-center space-x-2 px-3 py-2 ${theme.textSecondary} hover:${theme.textPrimary} hover:bg-white/10 rounded-lg transition-all duration-200`}
        title="Sign In / Sign Up"
      >
        <User size={18} />
        <span className="hidden md:inline text-sm">Account</span>
      </button>

      {/* Simple Modal for testing */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className={`${theme.cardBackground} ${theme.border} border rounded-xl shadow-2xl w-full max-w-md p-6 relative mx-auto my-auto`}>
            <button
              onClick={() => setShowModal(false)}
              className={`absolute top-4 right-4 ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}
            >
              <X size={20} />
            </button>
            
            <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-4`}>
              Test Modal
            </h2>
            <p className={theme.textSecondary}>
              This is a simple test modal. If you can see this, the basic modal functionality works.
            </p>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AuthHeaderSimple