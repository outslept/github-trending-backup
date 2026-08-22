import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CalendarDays } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Container } from '../components/container'
import { Calendar } from '../components/ui/calendar'
import { Input } from '../components/ui/input'
import { isValidIsoDate } from '../lib/date'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

const HISTORY_KEY = 'trending_history'
const MAX_HISTORY = 5

function IndexPage() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [dateInput, setDateInput] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [recentDates, setRecentDates] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) setRecentDates(JSON.parse(raw))
    } catch { }
  }, [])

  const addToHistory = (iso: string) => {
    if (!iso) return
    setRecentDates(prev => {
      const next = [iso, ...prev.filter(d => d !== iso)].slice(0, MAX_HISTORY)
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
      } catch { }
      return next
    })
  }

  const navigateToDate = (iso: string) => {
    if (!isValidIsoDate(iso)) return
    addToHistory(iso)
    navigate({ to: '/$date', params: { date: iso } })
  }

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const iso = date.toLocaleDateString('sv-SE')
      setDateInput(iso)
      setIsOpen(false)
      navigateToDate(iso)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const iso = dateInput.trim()
      if (isValidIsoDate(iso)) {
        navigateToDate(iso)
      } else {
        setDateInput('')
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Container className="flex flex-1 flex-col items-center justify-center py-8">
        <div className="flex flex-col w-full max-w-md items-center gap-6">
          <img
            src="/daily.png"
            alt="Daily trending"
            className="size-40 object-contain"
          />

          <div className="relative w-full" ref={dropdownRef}>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="enter date (YYYY-MM-DD)"
                className="pl-10 pr-16 h-11 w-full rounded-xl"
              />
            </div>

            {isOpen && (
              <div className="absolute z-50 mt-2 p-2 w-full bg-popover border border-border/60 rounded-xl text-popover-foreground shadow-xl">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleSelect}
                  className="w-full"
                  disabled={(date) => date < new Date('2020-01-01')}
                  autoFocus
                />
              </div>
            )}
          </div>

          {recentDates.length > 0 && (
            <div className="flex flex-col w-full items-start gap-1.5">
              <span className="text-[10px] tracking-tight text-muted-foreground/50">
                recent:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {recentDates.map(date => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => navigateToDate(date)}
                    className="px-2 py-0.5 font-mono text-xs text-muted-foreground rounded-md transition-colors hover:bg-muted/60 hover:text-foreground"
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>

      <Container className="pb-6 text-center">
        <p className="text-xs lowercase tracking-tight text-muted-foreground">
          not affiliated with github. use responsibly.
        </p>
      </Container>
    </div>
  )
}
