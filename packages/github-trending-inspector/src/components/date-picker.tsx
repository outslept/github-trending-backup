'use client'

import { Button } from '$/components/ui/button'
import { Calendar } from '$/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '$/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21)
    return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

function formatDate(date: Date): string {
  const month = MONTHS[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`
}

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date-picker"
          variant="outline"
          className="w-[240px] justify-start group"
        >
          <motion.div
            className="mr-2"
            whileTap={{ scale: 0.95 }}
          >
            <CalendarIcon className="h-4 w-4 transition-colors group-hover:text-primary" />
          </motion.div>
          <span className="transition-colors group-hover:text-primary">
            {formatDate(new Date(value))}
          </span>
        </Button>
      </PopoverTrigger>
      <AnimatePresence>
        {open && (
          <PopoverContent
            align="start"
            asChild
            forceMount
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-auto p-0"
            >
              <Calendar
                mode="single"
                selected={new Date(value)}
                onSelect={(date) => {
                  onChange(date?.toISOString().split('T')[0] || '')
                  setOpen(false)
                }}
                initialFocus
              />
            </motion.div>
          </PopoverContent>
        )}
      </AnimatePresence>
    </Popover>
  )
}
