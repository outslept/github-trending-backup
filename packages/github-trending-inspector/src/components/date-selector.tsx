'use client'

import { useQuery } from '@tanstack/react-query'

interface DateSelectorProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export function DateSelector({ selectedDate, onDateSelect }: DateSelectorProps) {
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

  const { data: monthData, isLoading } = useQuery({
    queryKey: ['month-dates', currentMonth],
    queryFn: async () => {
      const res = await fetch(`/api/trending?month=${currentMonth}`)
      if (!res.ok)
        throw new Error('Failed to fetch dates')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const today = new Date()
  const currentMonthNum = today.getMonth()
  const currentYear = today.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonthNum + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonthNum, 1).getDay()
  const availableDates = monthData?.availableDates || []

  const isDateAvailable = (date: number) => {
    const dateStr = `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    return availableDates.includes(dateStr)
  }

  const isDateSelected = (date: number) => {
    return selectedDate.getDate() === date
      && selectedDate.getMonth() === currentMonthNum
      && selectedDate.getFullYear() === currentYear
  }

  const handleDateClick = (date: number) => {
    if (isDateAvailable(date)) {
      const dateStr = `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
      const newDate = new Date(`${dateStr}T12:00:00.000Z`)
      onDateSelect(newDate)
    }
  }

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="p-3 border-b bg-background flex-shrink-0">
      <div className="mb-3">
        <h3 className="text-xs font-medium text-muted-foreground mb-2">
          {monthNames[currentMonthNum]}
          {' '}
          {currentYear}
        </h3>
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
                disabled={!available || isLoading}
                className={`
                  h-6 w-6 text-xs flex items-center justify-center transition-colors
                  ${available
                ? selected
                  ? 'bg-foreground text-background'
                  : 'hover:bg-muted text-foreground'
                : 'text-muted-foreground/30 cursor-not-allowed'
              }
                `}
              >
                {date}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
