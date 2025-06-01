'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DateSelectorProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function CalendarSkeleton() {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day, index) => (
          <div key={`weekday-${index}`} className="text-[10px] text-muted-foreground p-1">
            {day}
          </div>
        ))}
      </div>
      <div className="h-[144px] bg-muted animate-pulse rounded" />
    </div>
  )
}

async function fetchMonthData(month: string) {
  const res = await fetch(`/api/trending/metadata?month=${month}`)
  if (!res.ok)
    throw new Error('Failed to fetch dates')
  return res.json()
}

export function DateSelector({ selectedDate }: DateSelectorProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const router = useRouter()

  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

  const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
  const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`
  const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`

  const { data: monthData, isPending } = useQuery({
    queryKey: ['month-dates', currentMonth],
    queryFn: () => fetchMonthData(currentMonth),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  })

  const { data: prevMonthData } = useQuery({
    queryKey: ['month-dates', prevMonthStr],
    queryFn: () => fetchMonthData(prevMonthStr),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    enabled: true,
  })

  const { data: nextMonthData } = useQuery({
    queryKey: ['month-dates', nextMonthStr],
    queryFn: () => fetchMonthData(nextMonthStr),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    enabled: true,
  })

  const currentMonthNum = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonthNum + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonthNum, 1).getDay()
  const availableDates = monthData?.availableDates || []

  const goToPreviousMonth = () => {
    if (prevMonthData?.availableDates?.length > 0) {
      setCurrentDate(new Date(currentYear, currentMonthNum - 1, 1))
    }
  }

  const goToNextMonth = () => {
    if (nextMonthData?.availableDates?.length > 0) {
      setCurrentDate(new Date(currentYear, currentMonthNum + 1, 1))
    }
  }

  const isDateAvailable = (date: number) => {
    const dayStr = String(date).padStart(2, '0')
    return availableDates.includes(dayStr)
  }

  const isDateSelected = (date: number) => {
    return selectedDate.getDate() === date
      && selectedDate.getMonth() === currentMonthNum
      && selectedDate.getFullYear() === currentYear
  }

  const handleDateClick = (date: number) => {
    if (isDateAvailable(date)) {
      const dateStr = `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
      router.push(`/${dateStr}`)
    }
  }

  return (
    <div className="p-3 border-b bg-background flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={goToPreviousMonth}
          disabled={!prevMonthData?.availableDates?.length}
          className={`p-1 rounded transition-colors ${
            prevMonthData?.availableDates?.length
              ? 'hover:bg-muted'
              : 'text-muted-foreground/30 cursor-not-allowed'
          }`}
          aria-label="Previous month"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-xs font-medium text-muted-foreground">
          {monthNames[currentMonthNum]}
          {' '}
          {currentYear}
        </h3>

        <button
          onClick={goToNextMonth}
          disabled={!nextMonthData?.availableDates?.length}
          className={`p-1 rounded transition-colors ${
            nextMonthData?.availableDates?.length
              ? 'hover:bg-muted'
              : 'text-muted-foreground/30 cursor-not-allowed'
          }`}
          aria-label="Next month"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {isPending
        ? (
            <CalendarSkeleton />
          )
        : (
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDays.map((day, index) => (
                <div key={`weekday-${index}`} className="text-[10px] text-muted-foreground p-1">
                  {day}
                </div>
              ))}

              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => {
                const date = i + 1
                const available = isDateAvailable(date)
                const selected = isDateSelected(date)

                return (
                  <button
                    key={`date-${date}`}
                    onClick={() => handleDateClick(date)}
                    disabled={!available}
                    className={`size-6 text-xs flex items-center justify-center transition-colors ${
                      available
                        ? selected
                          ? 'bg-foreground text-background'
                          : 'hover:bg-muted text-foreground'
                        : 'text-muted-foreground/30 cursor-not-allowed'
                    }`}
                  >
                    {date}
                  </button>
                )
              })}
            </div>
          )}
    </div>
  )
}
