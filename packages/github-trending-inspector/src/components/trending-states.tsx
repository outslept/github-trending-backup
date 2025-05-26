import { AlertCircle, Database } from 'lucide-react'

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="w-full border bg-background">
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8">
        <div className="p-3 bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-destructive">Something went wrong</h3>
          <p className="text-sm text-muted-foreground max-w-md">{message}</p>
          <p className="text-xs text-muted-foreground">Please try refreshing the page or selecting a different date</p>
        </div>
      </div>
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="w-full border bg-background border-dashed">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
        <div className="p-4 bg-muted/50">
          <Database className="h-10 w-10 text-muted-foreground/60" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-muted-foreground">No data available</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            No trending repositories found for this date. Try selecting a different date from the calendar.
          </p>
        </div>
      </div>
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <div key={groupIndex} className="w-full border bg-background">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-muted animate-pulse" />
                <div className="h-6 w-24 bg-muted animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-48 bg-muted animate-pulse" />
                <div className="h-8 w-10 bg-muted animate-pulse" />
              </div>
            </div>

            <div className="border overflow-hidden">
              <div className="border-b bg-muted/30">
                <div className="grid grid-cols-4 gap-4 p-4">
                  <div className="h-4 w-16 bg-muted animate-pulse" />
                  <div className="h-4 w-24 bg-muted animate-pulse" />
                  <div className="hidden sm:block h-4 w-32 bg-muted animate-pulse" />
                  <div className="h-4 w-16 bg-muted animate-pulse" />
                </div>
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
                <div className="h-8 w-8 bg-muted animate-pulse" />
                <div className="h-8 w-8 bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
