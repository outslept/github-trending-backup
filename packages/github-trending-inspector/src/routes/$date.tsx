import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Suspense, useState } from 'react'
import { CalendarDays } from 'lucide-react'

import { Container } from '../components/container'
import { DailyTrending } from '../components/daily-trending'
import { TrendingSkeleton } from '../components/skeletons'
import { Button } from '../components/ui/button'
import { Calendar } from '../components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'

import { isValidIsoDate } from '../lib/date'
import { fetchTrendingMetadata, isDateAvailableInMetadata } from '../lib/trending-metadata'
import { lastAvailableDateFromMetadata } from '../shared/metadata'
import { useMetadata, useTrendingByDate } from '../hooks/use-trending-data'

export const Route = createFileRoute('/$date')({
  beforeLoad: async ({ params }) => {
    const { date } = params

    if (!isValidIsoDate(date)) return

    try {
      const meta = await fetchTrendingMetadata()

      if (!isDateAvailableInMetadata(meta, date)) {
        const latest = lastAvailableDateFromMetadata(meta)

        if (latest && latest !== date) {
          throw redirect({
            to: '/$date',
            params: { date: latest },
            replace: true,
          })
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
  const selectedDate = new Date(`${date}T00:00:00`)

  const isAvailable = (d: Date) => {
    const year = String(d.getFullYear())
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return metadata.years[year]?.[month]?.includes(day) ?? false
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="w-full justify-start gap-2 px-3 text-xs font-normal sm:w-[220px] sm:text-sm"
          >
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate tabular-nums">{date}</span>
          </Button>
        }
      />

      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          month={month}
          onMonthChange={setMonth}
          disabled={(d) => !isAvailable(d)}
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

function PageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
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

  const navigateToDate = (iso: string) => {
    navigate({
      to: '/$date',
      params: { date: iso },
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Container className="py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src="/daily.png"
              alt="trending inspector"
              className="size-16 shrink-0 object-contain sm:size-24 lg:size-28"
            />

            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight sm:text-base">
                  Github Daily Trending
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  Showing results for {formatHumanDate(date)}
                </p>
              </div>

              <div className="flex flex-col items-start gap-1">
                <p className="text-xs text-muted-foreground">
                  Pick a date
                </p>

                <DatePicker
                  date={date}
                  onDateChange={navigateToDate}
                />
              </div>
            </div>
          </div>
        </Container>
      </div>

      <main className="flex-1">
        <Container className="pb-6">
          <DailyTrending
            groups={languageGroups}
            globalFilter=""
          />
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
      <DatePageContent key={date} date={date} />
    </Suspense>
  )
}
