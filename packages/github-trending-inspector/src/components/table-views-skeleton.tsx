import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

function createSkeletonHeaders() {
  return [
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium text-muted-foreground tracking-tight">
        rank
      </span>
      <span className="text-[10px] text-muted-foreground/50 font-mono px-1 py-0.5 bg-muted/40 rounded">
        number
      </span>
    </div>,
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium text-muted-foreground tracking-tight">
        repository
      </span>
      <span className="text-[10px] text-muted-foreground/50 font-mono px-1 py-0.5 bg-muted/40 rounded">
        string
      </span>
    </div>,
    <div className="items-center gap-1.5 hidden lg:flex">
      <span className="text-sm font-medium text-muted-foreground tracking-tight">
        description
      </span>
      <span className="text-[10px] text-muted-foreground/50 font-mono px-1 py-0.5 bg-muted/40 rounded">
        string
      </span>
    </div>,
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium text-muted-foreground tracking-tight">
        stars
      </span>
      <span className="text-[10px] text-muted-foreground/50 font-mono px-1 py-0.5 bg-muted/40 rounded">
        number
      </span>
    </div>,
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium text-muted-foreground tracking-tight">
        forks
      </span>
      <span className="text-[10px] text-muted-foreground/50 font-mono px-1 py-0.5 bg-muted/40 rounded">
        number
      </span>
    </div>,
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium text-muted-foreground tracking-tight">
        today
      </span>
      <span className="text-[10px] text-muted-foreground/50 font-mono px-1 py-0.5 bg-muted/40 rounded">
        number
      </span>
    </div>,
  ];
}

function SkeletonRow({ rank }: { rank: number }) {
  return (
    <div className="p-4 border-b border-border/40 last:border-b-0">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="inline-flex items-center justify-center min-w-[2rem] h-5 px-1.5 bg-muted/60 text-[10px] font-mono text-muted-foreground rounded">
            #{rank}
          </div>
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div className="h-3 w-full bg-muted animate-pulse rounded mb-3" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-3 w-12 bg-muted animate-pulse rounded" />
          <div className="h-3 w-12 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

export function MobileViewSkeleton() {
  return (
    <div className="md:hidden">
      {Array.from({ length: 10 }, (_, index) => (
        <SkeletonRow key={index} rank={index + 1} />
      ))}
    </div>
  );
}

export function DesktopViewSkeleton() {
  const headers = createSkeletonHeaders();

  return (
    <div className="hidden md:block">
      <TableComponent>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/40">
            {headers.map((header, index) => (
              <TableHead key={index} className="py-3 px-4 bg-muted/20">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }, (_, rowIndex) => (
            <TableRow
              key={rowIndex}
              className={`
                border-border/40
                ${rowIndex % 2 === 0 ? "bg-background" : "bg-muted/10"}
              `}
            >
              <TableCell className="py-3 px-4">
                <div className="inline-flex items-center justify-center min-w-[2.5rem] h-6 px-2 bg-muted/60 text-[10px] font-mono text-muted-foreground rounded-md">
                  #{rowIndex + 1}
                </div>
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="h-4 w-48 bg-muted animate-pulse rounded hidden lg:block" />
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableComponent>
    </div>
  );
}
