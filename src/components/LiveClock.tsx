import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Sun, Moon, Sunrise, Sunset, Stars } from 'lucide-react'

const LiveClock = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getTimeIcon = () => {
    const hour = time.getHours()
    
    if (hour >= 5 && hour < 8) return <Sunrise className="h-4 w-4 text-orange-400" />
    if (hour >= 8 && hour < 12) return <Sun className="h-4 w-4 text-yellow-400" />
    if (hour >= 12 && hour < 17) return <Sun className="h-4 w-4 text-blue-400" />
    if (hour >= 17 && hour < 22) return <Sunset className="h-4 w-4 text-purple-400" />
    return <Moon className="h-4 w-4 text-indigo-400" />
  }

  const getTimeGradient = () => {
    const hour = time.getHours()
    
    if (hour >= 5 && hour < 8) return 'from-orange-500/10 to-pink-500/5'
    if (hour >= 8 && hour < 12) return 'from-blue-500/10 to-cyan-500/5'
    if (hour >= 12 && hour < 17) return 'from-teal-500/10 to-blue-500/5'
    if (hour >= 17 && hour < 22) return 'from-purple-500/10 to-indigo-500/5'
    return 'from-indigo-500/5 to-purple-500/5'
  }

  return (
    <motion.div 
      className={`flex items-center space-x-2 px-3 py-2 bg-gradient-to-r ${getTimeGradient()} backdrop-blur-sm rounded-lg border border-dark-600/50 transition-all duration-[3000ms] ease-in-out`}
      whileHover={{ scale: 1.02 }}
    >
      {getTimeIcon()}
      <div className="text-right">
        <div className="text-white font-medium text-sm">
          {time.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true 
          })}
        </div>
      </div>
    </motion.div>
  )
}

export default LiveClock