'use client'

import { DailyTrending } from '$/components/daily-trending'
import { AppSidebar } from '$/components/sidebar'
import { useState } from 'react'

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  return (
    <div className="min-h-screen max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-6 relative">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-4">
            <AppSidebar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto w-full">
          <div className="lg:hidden mb-6">
          </div>
          <DailyTrending date={selectedDate} />
        </main>
      </div>
    </div>
  )
}
