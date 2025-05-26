'use client'

import type { TrendingData } from '$/lib/types'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export function useTrendingData(date: string): TrendingData {
  const monthKey = date.substring(0, 7)

  const monthQuery = useQuery({
    queryKey: ['month-dates', monthKey],
    queryFn: async () => {
      const res = await fetch(`/api/trending?month=${monthKey}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch available dates: ${res.status}`)
      }
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const isDateAvailable = useMemo(() =>
    monthQuery.data?.availableDates?.includes(date) ?? false, [monthQuery.data, date])

  const dayQuery = useQuery({
    queryKey: ['day-content', date],
    queryFn: async () => {
      const res = await fetch(`/api/trending?date=${date}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch trending data: ${res.status}`)
      }
      const data = await res.json()
      return data
    },
    enabled: isDateAvailable,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })

  return useMemo(() => {
    if (monthQuery.error || dayQuery.error) {
      return {
        state: 'error',
        groups: [],
        error: (monthQuery.error || dayQuery.error)?.message,
      }
    }

    if (monthQuery.isLoading || (isDateAvailable && dayQuery.isLoading)) {
      return {
        state: 'loading',
        groups: [],
      }
    }

    if (!monthQuery.isLoading && !isDateAvailable) {
      return {
        state: 'date-unavailable',
        groups: [],
      }
    }

    if (dayQuery.data?.available && dayQuery.data?.data) {
      const groups = dayQuery.data.data
      return {
        state: groups.length > 0 ? 'success' : 'empty',
        groups,
      }
    }

    if (dayQuery.data?.available === false) {
      return {
        state: 'date-unavailable',
        groups: [],
      }
    }

    return {
      state: 'loading',
      groups: [],
    }
  }, [
    monthQuery.isLoading,
    monthQuery.error,
    monthQuery.data,
    dayQuery.isLoading,
    dayQuery.error,
    dayQuery.data,
    isDateAvailable,
    date,
  ])
}
