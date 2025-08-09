import { useState, useEffect } from 'react'

export interface TimeTheme {
  background: string
  cardBackground: string
  textPrimary: string
  textSecondary: string
  accent: string
  border: string
  glow: string
}

const themes = {
  dawn: {
    background: 'bg-white',
    cardBackground: 'bg-white border-gray-200',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    accent: 'text-blue-600',
    border: 'border-gray-200',
    glow: 'shadow-sm'
  },
  morning: {
    background: 'bg-white',
    cardBackground: 'bg-white border-gray-200',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    accent: 'text-blue-600',
    border: 'border-gray-200',
    glow: 'shadow-sm'
  },
  afternoon: {
    background: 'bg-white',
    cardBackground: 'bg-white border-gray-200',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    accent: 'text-blue-600',
    border: 'border-gray-200',
    glow: 'shadow-sm'
  },
  evening: {
    background: 'bg-gray-50',
    cardBackground: 'bg-white border-gray-300',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    accent: 'text-blue-600',
    border: 'border-gray-300',
    glow: 'shadow-sm'
  },
  night: {
    background: 'bg-gradient-to-br from-dark-900 via-slate-900 to-gray-900',
    cardBackground: 'bg-black/30 backdrop-blur-xl border-white/10',
    textPrimary: 'text-white',
    textSecondary: 'text-white/70',
    accent: 'text-neon-blue',
    border: 'border-white/10',
    glow: 'shadow-black/20'
  }
}

export const useTimeBasedTheme = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute for performance

    return () => clearInterval(timer)
  }, [])

  const getThemeForTime = (): TimeTheme => {
    return themes.night
  }

  const getTimePeriod = (): string => {
    const hour = currentTime.getHours()
    
    if (hour >= 5 && hour < 8) return 'dawn'
    if (hour >= 8 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 22) return 'evening'
    return 'night'
  }

  return {
    theme: getThemeForTime(),
    timePeriod: getTimePeriod(),
    currentTime
  }
}