import { Database } from 'lucide-react'

import type { LanguageGroup } from '../lib/types'
import { LanguageSection } from './language-section'

interface DailyTrendingProps {
  groups: LanguageGroup[]
  globalFilter: string
}

function EmptyState() {
  return (
    <div className="w-full bg-background border border-dashed">
      <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[300px]">
        <div className="p-3 bg-muted/50">
          <Database className="size-8" />
        </div>
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold">no data available</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            no trending repositories found for this date. try selecting a different date from the calendar.
          </p>
        </div>
      </div>
    </div>
  )
}

export function DailyTrending({ groups, globalFilter }: DailyTrendingProps) {
  if (groups.length === 0) return <EmptyState />

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <LanguageSection key={group.language} group={group} globalFilter={globalFilter} />
      ))}
    </div>
  )
}
