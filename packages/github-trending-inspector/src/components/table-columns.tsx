import type { Repository } from '$/lib/types'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function createColumns(): ColumnDef<Repository>[] {
  return [
    {
      accessorKey: 'rank',
      header: ({ column }) => (
        <SortableHeader
          column={column}
          label="rank"
          type="number"
        />
      ),
      cell: ({ row }) => (
        <RankCell rank={row.getValue('rank')} />
      ),
      enableSorting: true,
      size: 60,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <SortableHeader
          column={column}
          label="repository"
          type="string"
        />
      ),
      cell: ({ row }) => (
        <RepositoryCell
          title={row.getValue('title')}
          url={row.original.url}
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'description',
      header: () => (
        <StaticHeader label="description" type="string" className="hidden lg:flex" />
      ),
      cell: ({ row }) => (
        <DescriptionCell description={row.getValue('description')} />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'stars',
      header: ({ column }) => (
        <SortableHeader
          column={column}
          label="stars"
          type="number"
        />
      ),
      cell: ({ row }) => (
        <StarsCell stars={row.getValue('stars')} />
      ),
      enableSorting: true,
      size: 80,
    },
    {
      accessorKey: 'forks',
      header: ({ column }) => (
        <SortableHeader
          column={column}
          label="forks"
          type="number"
        />
      ),
      cell: ({ row }) => (
        <ForksCell forks={row.getValue('forks')} />
      ),
      enableSorting: true,
      size: 80,
    },
    {
      accessorKey: 'starsToday',
      header: ({ column }) => (
        <SortableHeader
          column={column}
          label="today"
          type="number"
        />
      ),
      cell: ({ row }) => (
        <TodayCell starsToday={row.getValue('starsToday')} />
      ),
      enableSorting: true,
      size: 80,
    },
  ]
}

function SortableHeader({ column, label, type }: {
  column: any
  label: string
  type: string
}) {
  const sortDirection = column.getIsSorted?.() || false

  return (
    <button
      onClick={() => {
        if (column.toggleSorting) {
          column.toggleSorting(sortDirection === 'asc')
        }
      }}
      className="group flex items-center gap-1 text-left hover:text-foreground transition-colors"
    >
      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground/60 font-mono">
        /
        {type}
      </span>
      <SortIcon sorted={sortDirection} />
    </button>
  )
}

function StaticHeader({ label, type, className }: {
  label: string
  type: string
  className?: string
}) {
  return (
    <div className={`items-center gap-1 ${className || 'flex'}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground/60 font-mono">
        /
        {type}
      </span>
    </div>
  )
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc')
    return <ChevronUp className="size-3 text-muted-foreground ml-1" />
  if (sorted === 'desc')
    return <ChevronDown className="size-3 text-muted-foreground ml-1" />
  return <ChevronDown className="size-3 opacity-20 ml-1" />
}

function RankCell({ rank }: { rank: number }) {
  return (
    <div className="w-8 h-6 bg-muted text-xs font-mono text-muted-foreground flex items-center justify-center hover:bg-muted/80 transition-colors">
      #
      {rank}
    </div>
  )
}

function RepositoryCell({ title, url }: { title: string, url: string }) {
  return (
    <div className="min-w-0 max-w-[200px] sm:max-w-none">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary transition-colors"
      >
        <span className="truncate">{title}</span>
      </a>
    </div>
  )
}

function DescriptionCell({ description }: { description: string }) {
  return (
    <div className="hidden lg:block max-w-md group">
      <p className="text-xs text-muted-foreground line-clamp-1 group-hover:text-foreground transition-colors">
        {description || 'No description'}
      </p>
    </div>
  )
}

function StarsCell({ stars }: { stars: string }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-xs group hover:text-foreground transition-colors">
      <div className="size-1 rounded-full bg-yellow-400 opacity-60" />
      <span>{stars}</span>
    </div>
  )
}

function ForksCell({ forks }: { forks: string }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-xs group hover:text-foreground transition-colors">
      <div className="size-1 rounded-full bg-muted-foreground opacity-60" />
      <span>{forks}</span>
    </div>
  )
}

function TodayCell({ starsToday }: { starsToday: string }) {
  const todayNum = Number.parseInt(starsToday) || 0

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs group hover:text-foreground transition-colors">
      <div className={`size-1 rounded-full opacity-60 ${todayNum > 0 ? 'bg-green-400' : 'bg-muted-foreground'}`} />
      <span className={todayNum > 0 ? 'text-green-600 dark:text-green-400' : ''}>{starsToday}</span>
    </div>
  )
}
