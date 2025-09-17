import {
  flexRender,
  type Row,
  type Table,
} from '@tanstack/react-table'
import { ExternalLink, GitFork, Search, Star, TrendingUp } from 'lucide-react'

import { formatNumber } from '../lib/format'
import { GITHUB_BASE_URL } from '../lib/urls'
import type { Repository } from '../lib/types'
import { cn } from '../lib/utils'

import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

function StatItem ({ icon: Icon, value, isPositive }: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  isPositive?: boolean;
}) {
  return (
    <div className='flex items-center gap-1.5'>
      <Icon className={cn(
        'size-3',
        isPositive === true ? 'text-emerald-500' : 'text-muted-foreground'
      )}
      />
      <span className={cn(
        'text-sm font-mono tracking-tight',
        isPositive === true
          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
          : 'text-muted-foreground'
      )}
      >
        {isPositive === true && value > 0 ? `+${formatNumber(value)}` : formatNumber(value)}
      </span>
    </div>
  )
}

function RankBadge ({ rank }: { rank: number }) {
  return (
    <div className='inline-flex items-center justify-center min-w-[2rem] h-5 px-1.5 bg-muted/60 text-[10px] font-mono text-muted-foreground rounded'>
      #{rank}
    </div>
  )
}

function RepoLink ({ repo }: { repo: string }) {
  return (
    <a
      href={`${GITHUB_BASE_URL}/${repo}`}
      target='_blank'
      rel='noopener noreferrer'
      className='group flex items-center gap-2 text-base font-medium text-foreground hover:text-primary min-w-0 transition-colors duration-200'
    >
      <span className='truncate tracking-tight'>{repo}</span>
      <ExternalLink className='size-3 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity duration-200' />
    </a>
  )
}

function MobileCard ({ repo }: { repo: Repository }) {
  return (
    <div className='p-4 border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors duration-200'>
      <div className='flex items-start justify-between gap-3 mb-3'>
        <div className='flex items-center gap-2 min-w-0 flex-1'>
          <RankBadge rank={repo.rank} />
          <RepoLink repo={repo.repo} />
        </div>
      </div>

      {repo.desc && (
        <p className='text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed'>
          {repo.desc}
        </p>
      )}

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <StatItem icon={Star} value={repo.stars} />
          <StatItem icon={GitFork} value={repo.forks} />
        </div>
        <StatItem icon={TrendingUp} value={repo.today} isPositive />
      </div>
    </div>
  )
}

function EmptyState () {
  return (
    <div className='flex flex-col items-center gap-3 text-muted-foreground py-12'>
      <div className='p-3 rounded-full bg-muted/40'>
        <Search className='size-5' />
      </div>
      <div className='text-center'>
        <p className='text-sm font-medium text-foreground mb-1'>
          No repositories found
        </p>
        <p className='text-xs text-muted-foreground'>
          Try adjusting your search criteria
        </p>
      </div>
    </div>
  )
}

interface MobileViewProps {
  rows: Row<Repository>[];
}

export function MobileView ({ rows }: MobileViewProps) {
  if (rows.length === 0) {
    return <EmptyState />
  }

  return (
    <div className='md:hidden'>
      {rows.map((row) => (
        <MobileCard key={row.id} repo={row.original} />
      ))}
    </div>
  )
}

interface DesktopViewProps {
  table: Table<Repository>;
}

export function DesktopView ({ table }: DesktopViewProps) {
  const rows = table.getRowModel().rows
  const headerGroups = table.getHeaderGroups()
  const visibleColumnCount = table.getVisibleFlatColumns().length

  return (
    <div className='hidden md:block'>
      <TableComponent>
        <TableHeader>
          {headerGroups.map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className='hover:bg-transparent border-border/40'
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className='py-3 px-4 bg-muted/20'>
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
          {rows.length > 0
            ? (
                rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'hover:bg-muted/30 transition-colors duration-200 border-border/40',
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className='py-3 px-4'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
            : (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className='h-32 text-center'>
                  <EmptyState />
                </TableCell>
              </TableRow>
              )}
        </TableBody>
      </TableComponent>
    </div>
  )
}
