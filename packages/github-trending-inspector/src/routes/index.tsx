import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { CalendarDays, Shuffle, Star, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, Suspense } from 'react'

import { Container } from '../components/container'
import { Calendar } from '../components/ui/calendar'
import { Input } from '../components/ui/input'
import { Skeleton } from '../components/ui/skeleton'
import { Button } from '../components/ui/button'

import { isValidIsoDate } from '../lib/date'
import { formatNumber } from '../lib/format'
import { useMetadata, useTrendingByDate } from '../hooks/use-trending-data'
import { lastAvailableDateFromMetadata } from '../shared/metadata'
import { languageIcons } from '../lib/language-icons'
import { GITHUB_BASE_URL } from '../lib/urls'
import type { Repository } from '../lib/types'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

const HISTORY_KEY = 'trending_history'
const MAX_HISTORY = 5

type RepoWithLang = Repository & { language: string }

function calculateTotalDays(years: Record<string, Record<string, string[]>>): number {
  let total = 0
  for (const year in years) {
    for (const month in years[year]) {
      total += years[year][month].length
    }
  }
  return total
}

function getRandomDate(years: Record<string, Record<string, string[]>>): string | null {
  const yearKeys = Object.keys(years)
  if (yearKeys.length === 0) return null

  const randomYear = yearKeys[Math.floor(Math.random() * yearKeys.length)]
  const monthKeys = Object.keys(years[randomYear])
  if (monthKeys.length === 0) return null

  const randomMonth = monthKeys[Math.floor(Math.random() * monthKeys.length)]
  const days = years[randomYear][randomMonth]
  if (days.length === 0) return null

  const randomDay = days[Math.floor(Math.random() * days.length)]
  return `${randomYear}-${randomMonth}-${randomDay}`
}

function IndexTopSkeleton() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <Skeleton className="h-4 w-24" />
        <span className="text-border">·</span>
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mt-4 flex w-full flex-col gap-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
            <Skeleton className="h-4 w-8" />
            <div className="flex flex-1 flex-col gap-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TopReposBlock() {
  const { data: metadata } = useMetadata()
  const latestDate = useMemo(() => lastAvailableDateFromMetadata(metadata), [metadata])

  if (!latestDate) return null

  const { data: groups } = useTrendingByDate(latestDate)

  const topRepos = useMemo(() => {
    return groups
      .flatMap((g) => g.repos.map((r) => ({ ...r, language: g.language })))
      .sort((a, b) => (b.today ?? 0) - (a.today ?? 0))
      .slice(0, 3) as RepoWithLang[]
  }, [groups])

  const totalDays = useMemo(() => calculateTotalDays(metadata.years), [metadata.years])

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">
            Top for {latestDate}
          </h2>
          <Button variant="link" size="sm" asChild>
            <Link to="/$date" params={{ date: latestDate }}>
              View full day →
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-2 w-full">
          {topRepos.map((repo) => {
            const iconSrc = languageIcons[repo.language.toLowerCase()]
            return (
              <a
                key={repo.repo}
                href={`${GITHUB_BASE_URL}/${repo.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-mono text-sm tabular-nums text-muted-foreground shrink-0">
                    #{repo.rank}
                  </span>
                  {iconSrc ? (
                    <img src={iconSrc} alt={repo.language} width={16} height={16} className="shrink-0" />
                  ) : null}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {repo.repo}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {repo.desc || 'no description available'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="size-3" />
                    <span className="font-mono tabular-nums">{formatNumber(repo.stars)}</span>
                  </div>
                  {repo.today != null && repo.today > 0 && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="size-3" />
                      <span className="font-mono tabular-nums">+{formatNumber(repo.today)}</span>
                    </div>
                  )}
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function IndexContent() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [dateInput, setDateInput] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [recentDates, setRecentDates] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: metadata } = useMetadata()

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
    setRecentDates((prev) => {
      const next = [iso, ...prev.filter((d) => d !== iso)].slice(0, MAX_HISTORY)
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

  const handleRandomDate = () => {
    if (!metadata) return
    const randomDate = getRandomDate(metadata.years)
    if (randomDate) navigateToDate(randomDate)
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
        <div className="flex flex-col w-full max-w-2xl items-center gap-8">

          <div className="flex flex-col items-center gap-3 text-center">
            <img
              src="/daily.png"
              alt="Daily trending"
              className="size-40 object-contain"
            />
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Github Trending Inspector
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              Archive of trending GitHub repositories. Enter a date, pick a day in the calendar, or try your luck.
            </p>
          </div>

          <Suspense fallback={<IndexTopSkeleton />}>
            <TopReposBlock />
          </Suspense>

          <div className="relative w-full max-w-md" ref={dropdownRef}>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Enter date (YYYY-MM-DD)"
                  className="pl-10 h-11 w-full rounded-xl"
                />
              </div>
              <Button
                variant="outline"
                className="h-11 px-4 rounded-xl gap-2"
                onClick={handleRandomDate}
                disabled={!metadata}
              >
                <Shuffle className="size-4" />
                <span className="hidden sm:inline">Random day</span>
              </Button>
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
            <div className="flex flex-col w-full max-w-md items-start gap-1.5">
              <span className="text-[10px] tracking-tight text-muted-foreground/50">
                recent:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {recentDates.map((date) => (
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

function IndexPage() {
  return (
    <Suspense fallback={<IndexTopSkeleton />}>
      <IndexContent />
    </Suspense>
  )
}
