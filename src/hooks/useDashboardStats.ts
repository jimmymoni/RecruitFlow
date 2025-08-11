import { useState, useEffect } from 'react'
import { getCandidates, getCandidateStats, getUsers } from '../services/api'

interface DashboardStats {
  activeCandidates: number
  openJobs: number
  totalUsers: number
  loading: boolean
  error: string | null
}

export function useDashboardStats(): DashboardStats {
  const [stats, setStats] = useState<DashboardStats>({
    activeCandidates: 0,
    openJobs: 0,
    totalUsers: 0,
    loading: true,
    error: null
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }))
        
        // Fetch candidate stats and users in parallel
        const [candidateStatsResponse, usersResponse] = await Promise.all([
          getCandidateStats().catch(() => ({ stats: { total: 0, activeStatuses: 0 } })),
          getUsers().catch(() => ({ count: 0 }))
        ])

        setStats({
          activeCandidates: candidateStatsResponse.stats?.activeStatuses || 0,
          openJobs: 0, // TODO: Add jobs API endpoint
          totalUsers: usersResponse.count || 0,
          loading: false,
          error: null
        })
      } catch (error) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch stats'
        }))
      }
    }

    fetchStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return stats
}

export default useDashboardStats