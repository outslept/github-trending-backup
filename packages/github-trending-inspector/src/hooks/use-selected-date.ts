'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

export function useSelectedDate() {
  const router = useRouter()

  const selectedDate = useMemo(() => {
    if (typeof window === 'undefined')
      return new Date()

    const searchParams = new URLSearchParams(window.location.search)
    const dateParam = searchParams.get('date')
    return dateParam ? new Date(dateParam) : new Date()
  }, [router])

  const setSelectedDate = (date: Date) => {
    router.replace(`/?date=${date.toISOString().split('T')[0]}`)
  }

  return { selectedDate, setSelectedDate }
}
