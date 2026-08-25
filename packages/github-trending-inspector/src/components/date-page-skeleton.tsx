import { TrendingSkeleton } from './skeletons'

export function DatePageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="container mx-auto px-4 py-6">
        <TrendingSkeleton />
      </main>
    </div>
  )
}
