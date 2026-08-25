import { useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'

import { Button } from './ui/button'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

import { useMetadata } from '../hooks/use-trending-data'
import { getDateBoundsFromMetadata } from '../lib/trending-metadata'
import { cn, formatHumanDate } from '../lib/utils'

interface SidebarDatePickerProps {
  date: string
  onDateChange: (iso: string) => void
  isIcon?: boolean
  className?: string
}

export function SidebarDatePicker({ date, onDateChange, isIcon = false, className }: SidebarDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>(() => {
    const [y, m] = date.split('-').map(Number)
    return new Date(y, m - 1, 1)
  })

  const { data: metadata } = useMetadata()
  const selectedDate = new Date(`${date}T00:00:00`)

  const isAvailable = (d: Date) => {
    const year = String(d.getFullYear())
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return metadata?.years[year]?.[month]?.includes(day) ?? false
  }

  const bounds = useMemo(() => getDateBoundsFromMetadata(metadata), [metadata])

  const triggerButton = (
    <Button
      variant="outline"
      className={cn(
        "justify-start gap-2 px-3 text-xs font-normal sm:text-sm aria-expanded:bg-muted",
        isIcon ? "size-8 p-0 justify-center shrink-0" : "h-9 w-full",
        className
      )}
    >
      <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
      {!isIcon && <span className="truncate tabular-nums">{formatHumanDate(date)}</span>}
    </Button>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          isIcon ? (
            <Tooltip>
              <TooltipTrigger render={triggerButton} />
              <TooltipContent side="right">Change date</TooltipContent>
            </Tooltip>
          ) : triggerButton
        }
      />

      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          month={month}
          onMonthChange={setMonth}
          disabled={(d) => !isAvailable(d)}
          startMonth={bounds.startMonth}
          endMonth={bounds.endMonth}
          onSelect={(d) => {
            if (!d || !isAvailable(d)) return

            const iso = d.toLocaleDateString('sv-SE')

            onDateChange(iso)
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
