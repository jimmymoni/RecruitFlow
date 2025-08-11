import { useState, useEffect } from 'react'
import { healthCheck, getCandidates, getUsers } from '../services/api'
import { useTimeBasedTheme } from '../hooks/useTimeBasedTheme'

interface StatusLightProps {
  status: 'loading' | 'success' | 'error'
  label?: string
  theme?: any
}

const StatusLight: React.FC<StatusLightProps> = ({ status, label, theme }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-neon-green shadow-neon-green/50' // Using the same green as other success indicators
      case 'error':
        return 'bg-red-500 shadow-red-500/50'
      case 'loading':
        return 'bg-neon-blue shadow-neon-blue/50 animate-pulse' // Using theme blue
      default:
        return 'bg-gray-500 shadow-gray-500/50'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return `✅ ${label}: Online`
      case 'error':
        return `🔴 ${label}: Error`
      case 'loading':
        return `🔵 ${label}: Checking...`
      default:
        return `⚫ ${label}: Unknown`
    }
  }

  return (
    <div className="group relative">
      <div 
        className={`w-3 h-3 rounded-full ${getStatusColor()} shadow-lg transition-all duration-500 cursor-help`}
      />
      
      {/* Enhanced Tooltip - positioned above and to the right to avoid clipping */}
      <div className={`absolute bottom-full right-0 mb-2 px-3 py-2 ${theme?.cardBackground || 'bg-dark-800/95'} backdrop-blur-sm ${theme?.textPrimary || 'text-white'} text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100] ${theme?.border || 'border border-dark-600'}`}>
        <div className="font-medium">{getStatusText()}</div>
        <div className={`absolute top-full right-3 border-4 border-transparent ${theme?.cardBackground?.includes('dark-800') ? 'border-t-dark-800' : 'border-t-current'}`}></div>
      </div>
    </div>
  )
}

export const BackendStatus: React.FC = () => {
  const { theme } = useTimeBasedTheme()
  const [healthStatus, setHealthStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [candidatesStatus, setCandidatesStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [usersStatus, setUsersStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const testBackendConnection = async () => {
    // Test health endpoint
    setHealthStatus('loading')
    try {
      await healthCheck()
      setHealthStatus('success')
    } catch (error) {
      setHealthStatus('error')
    }

    // Test candidates endpoint
    setCandidatesStatus('loading')
    try {
      await getCandidates()
      setCandidatesStatus('success')
    } catch (error) {
      setCandidatesStatus('error')
    }

    // Test users endpoint
    setUsersStatus('loading')
    try {
      await getUsers()
      setUsersStatus('success')
    } catch (error) {
      setUsersStatus('error')
    }
  }

  useEffect(() => {
    testBackendConnection()
    // Check status every 60 seconds
    const interval = setInterval(testBackendConnection, 60000)
    return () => clearInterval(interval)
  }, [])

  const allSystemsOperational = healthStatus === 'success' && candidatesStatus === 'success' && usersStatus === 'success'
  const hasErrors = healthStatus === 'error' || candidatesStatus === 'error' || usersStatus === 'error'

  return (
    <>
      <h3 className={`text-lg font-semibold ${theme.textPrimary} mb-4 transition-colors duration-[5000ms] ease-in-out`}>System Status</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StatusLight status={healthStatus} label="Backend Server" theme={theme} />
          <StatusLight status={candidatesStatus} label="Database" theme={theme} />
          <StatusLight status={usersStatus} label="API Services" theme={theme} />
        </div>
        
        {/* Overall status text with theme colors - using neon-green to match other success indicators */}
        <span className={`text-sm font-medium transition-colors duration-500 ${
          allSystemsOperational ? 'text-neon-green' : 
          hasErrors ? 'text-red-400' : 'text-blue-400'
        }`}>
          {allSystemsOperational ? 'All Systems Online' :
           hasErrors ? 'Service Issues' : 'Checking Status...'}
        </span>
      </div>
    </>
  )
}

export default BackendStatus