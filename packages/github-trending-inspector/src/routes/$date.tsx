import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { Suspense, useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { ErrorBoundary } from 'react-error-boundary'

import { Container } from '../components/container'
import { DailyTrending } from '../components/daily-trending'
import { TrendingSkeleton } from '../components/skeletons'
import { Button, buttonVariants } from '../components/ui/button'
import { Calendar } from '../components/ui/calendar'
import { Input } from '../components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'

import { isValidIsoDate } from '../lib/date'
import { fetchTrendingMetadata, isDateAvailableInMetadata } from '../lib/trending-metadata'
import { lastAvailableDateFromMetadata } from '../shared/metadata'
import { useTrendingByDate, useMetadata } from '../hooks/use-trending-data'

export const Route = createFileRoute('/$date')({
  beforeLoad: async ({ params }) => {
    const { date } = params
    if (!isValidIsoDate(date)) return

    try {
      const meta = await fetchTrendingMetadata()
      if (!isDateAvailableInMetadata(meta, date)) {
        const latest = lastAvailableDateFromMetadata(meta)
        if (latest && latest !== date) {
          throw redirect({ to: '/$date', params: { date: latest }, replace: true })
        }
      }
    } catch { }
  },
  component: DatePage,
})

function formatHumanDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getAllAvailableDates(metadata: ReturnType<typeof useMetadata>['data']): string[] {
  const dates: string[] = []
  for (const [year, months] of Object.entries(metadata.years)) {
    for (const [month, days] of Object.entries(months)) {
      for (const day of days) {
        dates.push(`${year}-${month}-${day}`)
      }
    }
  }
  return dates.sort()
}

function DatePicker({
  date,
  onDateChange,
}: {
  date: string
  onDateChange: (iso: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>(() => {
    const [y, m] = date.split('-').map(Number)
    return new Date(y, m - 1, 1)
  })

  const { data: metadata } = useMetadata()
  const selectedDate = new Date(date + 'T00:00:00')

  const isAvailable = (d: Date) => {
    const y = String(d.getFullYear())
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return metadata.years[y]?.[m]?.includes(day) ?? false
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="w-full sm:w-[220px] justify-start gap-2 px-3 text-xs sm:text-sm font-normal"
          >
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {date}
            </span>
          </Button>
        }
      />

      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => {
            if (!d) return

            const iso = d.toLocaleDateString('sv-SE')

            if (isAvailable(d)) {
              onDateChange(iso)
              setOpen(false)
            }
          }}
          month={month}
          onMonthChange={setMonth}
          disabled={(d) => !isAvailable(d)}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

function PageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <Container className="py-6">
          <TrendingSkeleton />
        </Container>
      </main>
    </div>
  )
}

function DatePageContent({ date }: { date: string }) {
  const navigate = useNavigate()
  const { data: languageGroups } = useTrendingByDate(date)
  const { data: metadata } = useMetadata()
  const [globalFilter, setGlobalFilter] = useState('')

  const availableDates = useMemo(() => getAllAvailableDates(metadata), [metadata])
  const latestDate = availableDates[availableDates.length - 1]
  const totalRepos = languageGroups.reduce((acc, g) => acc + g.repos.length, 0)
  const totalLanguages = languageGroups.length

  const navigateWithScroll = (iso: string) => {
    navigate({
      to: '/$date',
      params: { date: iso },
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Container className="py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src="/daily.png"
              alt="trending inspector"
              className="size-16 sm:size-24 lg:size-28 shrink-0 object-contain"
            />

            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-3">
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-semibold leading-tight">
                  Github Daily Trending
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  Showing results for {formatHumanDate(date)}
                </p>
              </div>

              <div className="flex flex-col items-start gap-1">
                <p className="text-xs text-muted-foreground">Pick a date</p>
                <DatePicker date={date} onDateChange={navigateWithScroll} />
              </div>
            </div>
          </div>
        </Container>
      </div>

      <main className="flex-1">
        <Container className="pb-6">
          <DailyTrending groups={languageGroups} globalFilter={globalFilter} />
        </Container>
      </main>

      <Container className="pb-6 text-center">
        <p className="text-xs lowercase tracking-tight text-muted-foreground">
          data from github trending backup · not affiliated with github
        </p>
      </Container>
    </div>
  )
}

function DatePage() {
  const { date } = Route.useParams()
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ErrorBoundary
        fallback={
          <div className="flex flex-col min-h-screen items-center justify-center gap-4 p-4 bg-background">
            <p className="text-lg font-semibold">failed to load data for this date</p>
            <Link to="/latest" className={buttonVariants({ variant: 'outline' })}>
              go to latest data
            </Link>
          </div>
        }
      >
        <DatePageContent key={date} date={date} />
      </ErrorBoundary>
    </Suspense>
  )
}
