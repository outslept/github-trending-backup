import { Skeleton } from './ui/skeleton';

function LanguageSectionSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/30 shadow-2xs">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/25 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-6 rounded-md" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-7 rounded-md" />
        </div>
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="hidden md:block">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-border/60 bg-muted/15">
              <th className="w-14 px-4 py-2.5">
                <Skeleton className="h-3 w-4" />
              </th>
              <th className="w-[270px] px-4 py-2.5">
                <Skeleton className="h-3 w-20" />
              </th>
              <th className="hidden lg:table-cell px-4 py-2.5">
                <Skeleton className="h-3 w-24" />
              </th>
              <th className="w-24 px-4 py-2.5">
                <Skeleton className="ml-auto h-3 w-10" />
              </th>
              <th className="w-24 px-4 py-2.5">
                <Skeleton className="ml-auto h-3 w-10" />
              </th>
              <th className="w-28 px-4 py-2.5">
                <Skeleton className="ml-auto h-3 w-12" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {Array.from({ length: 5 }, (_, i) => (
              <tr key={i}>
                <td className="px-4 py-3">
                  <Skeleton className="size-5 rounded-md" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-4.5 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </td>
                <td className="hidden lg:table-cell px-4 py-3">
                  <Skeleton className="h-4 w-3/4" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="ml-auto h-4 w-12" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="ml-auto h-4 w-10" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="ml-auto h-5 w-16 rounded-md" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border/50 md:hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="px-4 py-3.5">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-md" />
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="mt-2 h-3 w-full" />
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex gap-3">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border/60 bg-muted/15 px-4 py-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-7 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function TrendingSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }, (_, i) => (
        <LanguageSectionSkeleton key={i} />
      ))}
    </div>
  );
}
