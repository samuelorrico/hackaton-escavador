import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import type { DashboardSummary, StationRanking } from '../types/api'

interface DashboardData {
  summary: DashboardSummary | null
  ranking: StationRanking[]
  loading: boolean
  error: string | null
}

export function useDashboardData(): DashboardData {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [ranking, setRanking] = useState<StationRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      api.get<DashboardSummary>('/dashboard/summary'),
      api.get<StationRanking[]>('/dashboard/risk-ranking?limit=10'),
    ])
      .then(([s, r]) => {
        if (!cancelled) {
          setSummary(s)
          setRanking(r)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { summary, ranking, loading, error }
}
