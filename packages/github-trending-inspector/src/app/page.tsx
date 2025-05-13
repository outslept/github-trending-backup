"use client"

import { DailyTrending } from '$/components/daily-trending'
import { DatePicker } from '$/components/date-picker'
import { Button } from '$/components/ui/button'
import { useSession, signOut } from '$/lib/auth-client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function Home() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }

  return (
    <div className="container mx-auto py-10">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">GitHub Trending Inspector</h1>

        <div className="flex items-center gap-4">
          {isPending ? (
            <div>Loading...</div>
          ) : session?.user ? (
            <div className="flex items-center gap-4">
              <span>Welcome, {session.user.name}</span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={() => router.push('/auth')}>
              Sign In
            </Button>
          )}
        </div>
      </header>

      <div className="mb-6">
        <DatePicker
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
        />
      </div>

      <DailyTrending date={selectedDate} />
    </div>
  )
}
