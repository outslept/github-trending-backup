import { Skeleton } from './ui/skeleton'

function LanguageSectionSkeleton() {
  return (
    <div className="mb-6 pb-6 border-b border-border/40 last:mb-0 last:pb-0 last:border-b-0">
      <div className="scroll-mt-16 pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-6" />
        </div>
      </div>

      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40">
              {/* rank, repo, description, stars, forks, today */}
              <th className="px-3 py-2"><Skeleton className="h-4 w-8" /></th>
              <th className="px-3 py-2"><Skeleton className="h-4 w-20" /></th>
              <th className="px-3 py-2 hidden lg:table-cell"><Skeleton className="h-4 w-24" /></th>
              <th className="px-3 py-2"><Skeleton className="h-4 w-10" /></th>
              <th className="px-3 py-2"><Skeleton className="h-4 w-10" /></th>
              <th className="px-3 py-2"><Skeleton className="h-4 w-12" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, i) => (
              <tr key={i} className="border-b border-border/40">
                <td className="px-3 py-2.5"><Skeleton className="h-4 w-8" /></td>
                <td className="px-3 py-2.5"><Skeleton className="h-4 w-40" /></td>
                <td className="px-3 py-2.5 hidden lg:table-cell"><Skeleton className="h-4 w-64" /></td>
                <td className="px-3 py-2.5"><Skeleton className="h-4 w-12" /></td>
                <td className="px-3 py-2.5"><Skeleton className="h-4 w-12" /></td>
                <td className="px-3 py-2.5"><Skeleton className="h-4 w-14" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="py-3 border-b border-border/40 last:border-b-0">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="mt-1 h-3 w-full" />
            <div className="mt-2 flex items-center gap-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  )
}

export function TrendingSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }, (_, i) => (
        <LanguageSectionSkeleton key={i} />
      ))}
    </div>
  )
}
