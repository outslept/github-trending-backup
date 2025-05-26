'use client'

import { useTrendingData } from '$/hooks/use-trending-data'
import { TrendingContent } from './trending-content'
import { EmptyState, ErrorState, LoadingState } from './trending-states'

export function DailyTrending({ date }: { date: string }) {
  const { state, groups, error } = useTrendingData(date)

  return <TrendingRenderer state={state} groups={groups} error={error} />
}

function TrendingRenderer({ state, groups, error }: {
  state: string
  groups: any[]
  error?: string
}) {
  switch (state) {
    case 'loading':
      return <LoadingState />

    case 'error':
      return <ErrorState message={error || 'Unknown error occurred'} />

    case 'date-unavailable':
    case 'empty':
      return <EmptyState />

    case 'success':
      return (
        <div className="space-y-8">
          <TrendingContent groups={groups} />
        </div>
      )

    default:
      return <LoadingState />
  }
}
