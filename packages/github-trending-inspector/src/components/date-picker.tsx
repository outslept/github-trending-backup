"use client"

import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '$/components/ui/popover'
import { Button } from '$/components/ui/button'
import { Calendar } from '$/components/ui/calendar'
import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'

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
            {format(new Date(value), 'PPP')}
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
