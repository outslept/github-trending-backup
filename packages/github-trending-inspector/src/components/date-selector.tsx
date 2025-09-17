import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'

import { Calendar } from '../components/ui/calendar'
import { useMetadata } from '../hooks/use-trending-data'

export function DateSelector ({ selectedDate }: { selectedDate: Date }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)
  const navigate = useNavigate()
  const { data: metadata } = useMetadata()

  const isDateAvailable = useCallback(
    (d: Date) => {
      const y = String(d.getFullYear())
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return metadata.years[y]?.[m]?.includes(day) ?? false
    },
    [metadata]
  )

  return (
    <Calendar
      mode='single'
      selected={isDateAvailable(selectedDate) ? selectedDate : undefined}
      onSelect={(d) => {
        if (!d) return
        navigate({ to: '/$date', params: { date: d.toLocaleDateString('sv-SE') } })
      }}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      disabled={(d) => !isDateAvailable(d)}
      className='w-full'
      classNames={{ today: 'text-accent-foreground' }}
    />
  )
}