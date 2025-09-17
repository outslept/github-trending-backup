import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { Database } from 'lucide-react'

import { useTrendingByDate } from '../hooks/use-trending-data'

import { LanguageSection } from './language-section'

function EmptyState () {
  return (
    <div className='w-full bg-background border border-dashed'>
      <div className='flex flex-col items-center justify-center min-h-[300px] gap-4 p-8'>
        <div className='p-3 bg-muted/50'>
          <Database className='size-8' />
        </div>
        <div className='text-center space-y-2'>
          <h3 className='text-lg font-semibold'>No data available</h3>
          <p className='text-sm text-muted-foreground max-w-md'>
            No trending repositories found for this date. Try selecting a different date from the calendar.
          </p>
        </div>
      </div>
    </div>
  )
}

export function DailyTrending ({ date }: { date: string }) {
  const { data: languageGroups } = useTrendingByDate(date)

  const virtualizer = useWindowVirtualizer({
    count: languageGroups.length,
    estimateSize: () => 800,
    overscan: 2,
    measureElement: (element) => element.getBoundingClientRect().height,
  })

  if (languageGroups.length === 0) return <EmptyState />

  return (
    <div
      className='w-full relative'
      style={{ height: `${virtualizer.getTotalSize()}px` }}
    >
      {virtualizer.getVirtualItems().map((item) => (
        <div
          key={item.key}
          data-index={item.index}
          ref={virtualizer.measureElement}
          className='absolute top-0 left-0 w-full'
          style={{ transform: `translateY(${item.start}px)` }}
        >
          <div className='mb-6'>
            <LanguageSection group={languageGroups[item.index]} />
          </div>
        </div>
      ))}
    </div>
  )
}