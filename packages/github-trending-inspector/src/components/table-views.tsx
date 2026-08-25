import { flexRender, type Row, type Table } from '@tanstack/react-table'
import { ExternalLink, GitFork, Search, Star, TrendingUp } from 'lucide-react'

import type { Repository } from '../lib/types'
import { cn, formatNumber } from '../lib/utils'

import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { GITHUB_BASE_URL } from '../lib/trending-metadata'

function StatItem({ icon: Icon, value }: {
  icon: typeof Star
  value: number | null
}) {
  const isPos = value != null && value > 0
  return (
    <span className="flex items-center gap-1">
      <Icon
        className={cn(
          'size-3',
          isPos ? 'text-emerald-500' : 'text-muted-foreground'
        )}
      />
      <span
        className={cn(
          'font-mono text-sm tabular-nums',
          isPos
            ? 'font-medium text-emerald-600 dark:text-emerald-400'
            : 'text-muted-foreground'
        )}
      >
        {isPos ? `+${formatNumber(value)}` : formatNumber(value)}
      </span>
    </span>
  )
}

function MobileCard({ repo }: { repo: Repository }) {
  return (
    <a
      href={`${GITHUB_BASE_URL}/${repo.repo}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block py-3 border-b border-border/40 last:border-b-0 hover:bg-muted/40 transition-colors -mx-1 px-1 rounded-md"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          #{repo.rank}
        </span>
        <span className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 group-hover:underline">
          {repo.repo}
          <ExternalLink className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </div>
      {repo.desc && (
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {repo.desc}
        </p>
      )}
      <div className="mt-2 flex items-center gap-4">
        <StatItem icon={Star} value={repo.stars} />
        <StatItem icon={GitFork} value={repo.forks} />
        <StatItem icon={TrendingUp} value={repo.today} />
      </div>
    </a>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
      <Search className="size-5" />
      <div className="text-center">
        <p className="mb-1 text-sm font-medium text-foreground">
          no repositories found
        </p>
        <p className="text-sm text-muted-foreground">
          try adjusting your search criteria
        </p>
      </div>
    </div>
  )
}

interface MobileViewProps {
  rows: Row<Repository>[]
}

export function MobileView({ rows }: MobileViewProps) {
  if (rows.length === 0) {
    return <EmptyState />
  }

  return (
    <div>
      {rows.map((row) => (
        <MobileCard key={row.id} repo={row.original} />
      ))}
    </div>
  )
}

interface DesktopViewProps {
  table: Table<Repository>
}

export function DesktopView({ table }: DesktopViewProps) {
  const rows = table.getRowModel().rows
  const headerGroups = table.getHeaderGroups()
  const visibleColumnCount = table.getVisibleFlatColumns().length

  return (
    <div>
      <TableComponent>
        <TableHeader className="sticky top-0 z-10 bg-background">
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-border/40 hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="px-3 py-2 text-xs font-medium text-muted-foreground">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-border/40 odd:bg-muted/5"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-3 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={visibleColumnCount} className="h-32 text-center">
                <EmptyState />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </TableComponent>
    </div>
  )
}
