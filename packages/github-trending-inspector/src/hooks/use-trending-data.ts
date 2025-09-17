import { useSuspenseQuery } from '@tanstack/react-query'

import type { TrendingResponse } from '../lib/types'
import { fetchTrendingMetadata } from '../lib/trending-metadata'

const REQUEST_TIMEOUT = 30_000
const STALE_TIME = 1000 * 60 * 60 * 12

function trendingApiUrlFor (endpoint: string): string {
  const baseUrl = import.meta.env.PROD
    ? '/api/trending'
    : 'http://localhost:3001/api/trending'
  return `${baseUrl}/${endpoint}`
}

async function fetchOrTimeout (url: string): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(url, { signal: controller.signal })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

function useTrendingMonth (month: string) {
  return useSuspenseQuery({
    queryKey: ['trending-month', month],
    queryFn: async () => {
      const res = await fetchOrTimeout(trendingApiUrlFor(month))
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`)
      return (await res.json()) as TrendingResponse
    },
    staleTime: STALE_TIME,
  })
}

export function useTrendingByDate (date: string) {
  const month = date.slice(0, 7)
  const day = date.slice(8)

  const { data: monthData } = useTrendingMonth(month)
  const result = monthData.repositories[day] ?? []

  return { data: result }
}

export function useMetadata () {
  return useSuspenseQuery({
    queryKey: ['metadata'],
    queryFn: () => fetchTrendingMetadata(),
    staleTime: 1000 * 60 * 60,
  })
}
