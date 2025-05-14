"use client"

import { DailyTrending } from '$/components/daily-trending/index'
import { DatePicker } from '$/components/date-picker'
import { NextUpdateTimer } from '$/components/next-update-timer'
import { useState } from 'react'

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex justify-between">
        <DatePicker
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
        />
        <NextUpdateTimer />
      </div>

      <DailyTrending date={selectedDate} />
    </div>
  )
}
