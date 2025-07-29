import { Calendar } from './ui/calendar';
import { Skeleton } from './ui/skeleton';
import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export function CalendarSkeleton() {
  return (
    <div className="group/calendar p-3 w-fit opacity-50 pointer-events-none">
      <Calendar
        mode="single"
        selected={undefined}
        month={new Date()}
        disabled={() => true}
        className="w-full"
        components={{
          DayButton: () => (
            <div className="relative w-full h-full aspect-square select-none group/day">
              <Skeleton className="flex aspect-square h-auto w-full min-w-8 flex-col gap-1 leading-none font-normal rounded-md" />
            </div>
          ),
        }}
      />
    </div>
  );
}

export function TrendingSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="border border-border/60 rounded-xl bg-background shadow-sm"
        >
          <div className="px-6 py-4 border-b border-border/40 bg-muted/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background border border-border/60 shadow-sm">
                  <Skeleton className="size-5 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-24 rounded" />
                  <Skeleton className="h-6 w-8 rounded" />
                </div>
              </div>
              <Skeleton className="h-9 w-64 rounded" />
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="hidden md:block">
              <TableComponent>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/40">
                    {Array.from({ length: 6 }, (_, i) => (
                      <TableHead key={i} className="py-3 px-4 bg-muted/20">
                        <Skeleton className="h-4 w-16 rounded" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 10 }, (_, rowIndex) => (
                    <TableRow key={rowIndex} className="border-border/40">
                      <TableCell className="py-3 px-4">
                        <Skeleton className="h-6 w-12 rounded-md" />
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Skeleton className="h-4 w-32 rounded" />
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Skeleton className="h-4 w-48 rounded hidden lg:block" />
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Skeleton className="h-4 w-16 rounded" />
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Skeleton className="h-4 w-16 rounded" />
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Skeleton className="h-4 w-16 rounded" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableComponent>
            </div>

            <div className="md:hidden">
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  className="p-4 border-b border-border/40 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Skeleton className="h-5 w-8 rounded" />
                      <Skeleton className="h-4 w-32 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full rounded mb-3" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-3 w-12 rounded" />
                      <Skeleton className="h-3 w-12 rounded" />
                    </div>
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/40 bg-muted/10">
            <Skeleton className="h-4 w-48 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24 rounded" />
              <div className="flex items-center gap-1 ml-2">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="size-8 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
