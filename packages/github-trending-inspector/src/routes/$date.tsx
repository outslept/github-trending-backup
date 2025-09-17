import { createFileRoute, redirect } from '@tanstack/react-router'
import { Suspense } from 'react'

import { AppSidebar } from '../components/app-sidebar'
import { DailyTrending } from '../components/daily-trending'
import { TrendingSkeleton } from '../components/skeletons'
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar'
import { isValidIsoDate } from '../lib/date'
import {
  fetchLatestAvailableDate,
  fetchTrendingMetadata,
  isDateAvailableInMetadata,
} from '../lib/trending-metadata'

export const Route = createFileRoute('/$date')({
  validateSearch: (search) => search,
  beforeLoad: async ({ params }) => {
    const { date } = params

    if (!isValidIsoDate(date)) {
      throw redirect({
        to: '/$date',
        params: { date: await fetchLatestAvailableDate() },
      })
    }

    try {
      const meta = await fetchTrendingMetadata()
      const ok = isDateAvailableInMetadata(meta, date)
      if (!ok) {
        throw redirect({
          to: '/$date',
          params: { date: await fetchLatestAvailableDate() },
        })
      }
    } catch {
      throw redirect({
        to: '/$date',
        params: { date: await fetchLatestAvailableDate() },
      })
    }
  },
  component: DatePage,
})

function DatePage () {
  const { date } = Route.useParams()

  return (
    <SidebarProvider
      defaultOpen
      style={
        { '--sidebar-width': '18rem', '--sidebar-width-mobile': '18rem' } as React.CSSProperties
      }
    >
      <AppSidebar selectedDate={new Date(date)} />
      <SidebarInset>
        <div className='w-[85%] max-w-none mx-auto py-6'>
          <Suspense fallback={<TrendingSkeleton />}>
            <DailyTrending date={date} />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
