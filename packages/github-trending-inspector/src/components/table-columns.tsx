import type { Repository } from '$/lib/types'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function createColumns(): ColumnDef<Repository>[] {
  return [
    {
      accessorKey: 'rank',
      header: ({ column }) => (
        <SortableHeader column={column} label="rank" type="number" />
      ),
      cell: ({ row }) => (
        <div className="w-8 h-6 bg-muted text-xs font-mono text-muted-foreground flex items-center justify-center hover:bg-muted/80">
          #
          {row.getValue('rank')}
        </div>
      ),
      enableSorting: true,
      size: 60,
    },
    {
      accessorKey: 'repo',
      header: ({ column }) => (
        <SortableHeader column={column} label="repository" type="string" />
      ),
      cell: ({ row }) => (
        <a
          href={`https://github.com/${row.getValue('repo')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 max-w-[200px] sm:max-w-none flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary"
        >
          <span className="truncate">{row.getValue('repo')}</span>
        </a>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'desc',
      header: () => (
        <div className="items-center gap-1 hidden lg:flex">
          <span className="text-xs font-medium text-muted-foreground">description</span>
          <span className="text-[10px] text-muted-foreground/60 font-mono">/string</span>
        </div>
      ),
      cell: ({ row }) => (
        <p className="hidden lg:block max-w-md text-xs text-muted-foreground line-clamp-1 hover:text-foreground">
          {row.getValue('desc') || 'No description'}
        </p>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'stars',
      header: ({ column }) => (
        <SortableHeader column={column} label="stars" type="number" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs hover:text-foreground">
          {row.getValue('stars')}
        </span>
      ),
      enableSorting: true,
      size: 80,
    },
    {
      accessorKey: 'forks',
      header: ({ column }) => (
        <SortableHeader column={column} label="forks" type="number" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs hover:text-foreground">
          {row.getValue('forks')}
        </span>
      ),
      enableSorting: true,
      size: 80,
    },
    {
      accessorKey: 'today',
      header: ({ column }) => (
        <SortableHeader column={column} label="today" type="number" />
      ),
      cell: ({ row }) => {
        const today = row.getValue('today') as number
        return (
          <span className={`font-mono text-xs hover:text-foreground ${today > 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
            {today}
          </span>
        )
      },
      enableSorting: true,
      size: 80,
    },
  ]
}

function SortableHeader({ column, label, type }) {
  const sortDirection = column.getIsSorted?.() || false

  return (
    <button
      onClick={() => {
        if (column.toggleSorting) {
          if (!sortDirection) {
            // A→Z, 1→100
            column.toggleSorting(false) // false = asc
          }
          else if (sortDirection === 'asc') {
            // Z→A, 100→1
            column.toggleSorting(true) // true = desc
          }
          else {
            column.clearSorting()
          }
        }
      }}
      className="group flex items-center gap-1 hover:text-foreground"
    >
      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground/60 font-mono">
        /
        {type}
      </span>
      {sortDirection === 'asc' && <ChevronUp className="size-3 text-muted-foreground ml-1" />}
      {sortDirection === 'desc' && <ChevronDown className="size-3 text-muted-foreground ml-1" />}
      {!sortDirection && <div className="size-3 ml-1" />}
    </button>
  )
}
