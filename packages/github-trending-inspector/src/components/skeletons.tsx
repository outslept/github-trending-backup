import { Skeleton } from './ui/skeleton'

export function TrendingSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="bg-background border border-border/60 rounded-xl shadow-sm"
        >
          <div className="bg-muted/20 px-6 py-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <Skeleton className="size-5 rounded" />
              <Skeleton className="h-6 w-24 rounded" />
              <Skeleton className="h-6 w-8 rounded" />
            </div>
          </div>
          <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
