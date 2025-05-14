'use client'

import { Card, CardContent } from '$/components/ui/card'
import { Skeleton } from '$/components/ui/skeleton'
import { TableSkeleton } from './table-skeleton'

export function SectionSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <TableSkeleton />
        <div className="flex justify-end mt-4">
          <Skeleton className="h-8 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}
