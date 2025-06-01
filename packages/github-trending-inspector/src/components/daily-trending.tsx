'use client'

import type { LanguageGroup } from '$/lib/types'
import { useTrendingData } from '$/hooks/use-trending-data'
import { AlertCircle, Database } from 'lucide-react'
import { LanguageSection } from './language-section'

function StateContainer({
  icon: Icon,
  iconColor,
  title,
  description,
  subtitle,
  className = 'border',
}: {
  icon: any
  iconColor: string
  title: string
  description: string
  subtitle?: string
  className?: string
}) {
  return (
    <div className={`w-full bg-background ${className}`}>
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8">
        <div className={`p-3 ${iconColor}`}>
          <Icon className="size-8" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <div key={groupIndex} className="w-full border bg-background p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="size-6 bg-muted animate-pulse" />
              <div className="h-6 w-24 bg-muted animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-48 bg-muted animate-pulse" />
              <div className="size-8 bg-muted animate-pulse" />
            </div>
          </div>

          <div className="border overflow-hidden">
            <div className="border-b bg-muted/30 grid grid-cols-4 gap-4 p-4">
              <div className="h-4 w-16 bg-muted animate-pulse" />
              <div className="h-4 w-24 bg-muted animate-pulse" />
              <div className="hidden sm:block h-4 w-32 bg-muted animate-pulse" />
              <div className="h-4 w-16 bg-muted animate-pulse" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0">
                <div className="h-4 w-8 bg-muted animate-pulse" />
                <div className="h-4 w-36 bg-muted animate-pulse" />
                <div className="hidden sm:block h-4 w-full bg-muted animate-pulse" />
                <div className="h-4 w-12 bg-muted animate-pulse" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="h-4 w-48 bg-muted animate-pulse" />
            <div className="flex gap-2">
              <div className="size-8 bg-muted animate-pulse" />
              <div className="size-8 bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function DailyTrending({ date }: { date: string }) {
  const { state, groups, error } = useTrendingData(date)

  if (state === 'loading') {
    return <LoadingSkeleton />
  }

  if (state === 'error') {
    return (
      <StateContainer
        icon={AlertCircle}
        iconColor="bg-destructive/10"
        title="Something went wrong"
        description={error || 'Unknown error occurred'}
        subtitle="Please try refreshing the page or selecting a different date"
      />
    )
  }

  if (state === 'date-unavailable' || state === 'empty') {
    return (
      <StateContainer
        icon={Database}
        iconColor="bg-muted/50"
        title="No data available"
        description="No trending repositories found for this date. Try selecting a different date from the calendar."
        className="border border-dashed"
      />
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((group: LanguageGroup) => (
        <LanguageSection key={group.language} group={group} />
      ))}
    </div>
  )
}
