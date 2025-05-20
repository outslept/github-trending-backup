'use client'

import { Calendar } from '$/components/ui/calendar'
import { motion } from 'motion/react'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  return (
    <motion.div initial={{ opacity: 1 }} className="w-auto p-0">
      <Calendar
        mode="single"
        selected={new Date(value)}
        onSelect={date => onChange(date?.toISOString().split('T')[0] || '')}
        initialFocus
      />
    </motion.div>
  )
}
