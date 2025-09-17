import type { ColumnDef, Column } from '@tanstack/react-table'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { formatNumber } from '../lib/format'
import { GITHUB_BASE_URL } from '../lib/urls'
import { cn } from '../lib/utils'
import type { Repository } from '../lib/types'

function TypeBadge ({ type }: { type: string }) {
  return (
    <span className='text-[10px] text-muted-foreground/50 font-mono px-1 py-0.5 bg-muted/40 rounded group-hover:bg-muted/60 transition-colors'>
      {type}
    </span>
  )
}

function RankCell ({ rank }: { rank: number }) {
  return (
    <div className='inline-flex items-center justify-center min-w-[2.5rem] h-6 px-2 bg-muted/60 text-[10px] font-mono text-muted-foreground rounded-md hover:bg-muted transition-colors'>
      #{formatNumber(rank)}
    </div>
  )
}

function RepoCell ({ repo }: { repo: string }) {
  return (
    <a
      href={`${GITHUB_BASE_URL}/${repo}`}
      target='_blank'
      rel='noopener noreferrer'
      className='group inline-flex items-center gap-2 min-w-0 max-w-[240px] text-sm font-medium text-foreground hover:text-primary transition-colors duration-200'
    >
      <span className='truncate'>{repo}</span>
      <div className='size-1 rounded-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200' />
    </a>
  )
}

function DescriptionCell ({ description }: { description: string }) {
  return (
    <p className='hidden lg:block max-w-md text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 leading-relaxed truncate'>
      {description || 'No description available'}
    </p>
  )
}

function NumberCell ({ value }: { value: number }) {
  return (
    <span className='font-mono text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 tracking-tight'>
      {formatNumber(value)}
    </span>
  )
}

function TodayCell ({ value }: { value: number }) {
  const isPositive = value > 0

  return (
    <div className='flex items-center gap-2'>
      <span
        className={cn(
          'font-mono text-sm transition-colors duration-200 tracking-tight',
          isPositive
            ? 'text-emerald-600 dark:text-emerald-400 font-medium'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {isPositive ? `+${formatNumber(value)}` : formatNumber(value)}
      </span>
      {isPositive && (
        <div className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
      )}
    </div>
  )
}

function SortableHeader ({
  column,
  label,
  type,
}: {
  column: Column<Repository>;
  label: string;
  type: string;
}) {
  const sortDirection = column.getIsSorted()
  const ariaSort =
    sortDirection === 'asc'
      ? 'ascending'
      : sortDirection === 'desc'
        ? 'descending'
        : 'none'

  const handleSort = () => {
    switch (sortDirection) {
      case false:
        column.toggleSorting(false)
        break
      case 'asc':
        column.toggleSorting(true)
        break
      default:
        column.clearSorting()
    }
  }

  return (
    <button
      type='button'
      onClick={handleSort}
      aria-label={`Sort by ${label}`}
      aria-sort={ariaSort as React.AriaAttributes['aria-sort']}
      className='group flex items-center gap-2 hover:text-foreground transition-colors duration-200 -ml-2 pl-2 pr-1 py-1 rounded-md hover:bg-muted/50'
    >
      <div className='flex items-center gap-1.5'>
        <span className='text-sm font-medium text-muted-foreground group-hover:text-foreground tracking-tight'>
          {label}
        </span>
        <TypeBadge type={type} />
      </div>

      <div className='size-4 flex items-center justify-center'>
        {sortDirection === 'asc' && (
          <ChevronUp className='size-3 text-primary' />
        )}
        {sortDirection === 'desc' && (
          <ChevronDown className='size-3 text-primary' />
        )}
        {sortDirection === false && (
          <div className='flex flex-col gap-0.5'>
            <ChevronUp className='size-2 text-muted-foreground/30' />
            <ChevronDown className='size-2 text-muted-foreground/30' />
          </div>
        )}
      </div>
    </button>
  )
}

function StaticHeader ({ label }: { label: string }) {
  return (
    <div className='items-center gap-1.5 hidden lg:flex'>
      <span className='text-sm font-medium text-muted-foreground tracking-tight'>
        {label}
      </span>
      <TypeBadge type='string' />
    </div>
  )
}

export function buildRepoColumns (): ColumnDef<Repository>[] {
  return [
    {
      accessorKey: 'rank',
      header: ({ column }) => (
        <SortableHeader column={column} label='rank' type='number' />
      ),
      cell: ({ row }) => <RankCell rank={row.original.rank} />,
      enableSorting: true,
      size: 80,
    },
    {
      accessorKey: 'repo',
      header: ({ column }) => (
        <SortableHeader column={column} label='repository' type='string' />
      ),
      cell: ({ row }) => <RepoCell repo={row.original.repo} />,
      enableSorting: true,
    },
    {
      accessorKey: 'desc',
      header: () => <StaticHeader label='description' />,
      cell: ({ row }) => <DescriptionCell description={row.original.desc} />,
      enableSorting: false,
    },
    {
      accessorKey: 'stars',
      header: ({ column }) => (
        <SortableHeader column={column} label='stars' type='number' />
      ),
      cell: ({ row }) => <NumberCell value={row.original.stars} />,
      enableSorting: true,
      size: 100,
    },
    {
      accessorKey: 'forks',
      header: ({ column }) => (
        <SortableHeader column={column} label='forks' type='number' />
      ),
      cell: ({ row }) => <NumberCell value={row.original.forks} />,
      enableSorting: true,
      size: 100,
    },
    {
      accessorKey: 'today',
      header: ({ column }) => (
        <SortableHeader column={column} label='today' type='number' />
      ),
      cell: ({ row }) => <TodayCell value={row.original.today} />,
      enableSorting: true,
      size: 120,
    },
  ]
}
