import type { Repository } from '$/lib/types'
import { flexRender } from '@tanstack/react-table'
import { ExternalLink, Search } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

export function MobileView({ rows }: { rows: any[] }) {
  if (rows.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="block md:hidden">
      {rows.map(row => (
        <MobileCard key={row.id} repo={row.original} />
      ))}
    </div>
  )
}

export function DesktopView({ table, columns }: { table: any, columns: any[] }) {
  return (
    <div className="hidden md:block w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header: any) => (
                <TableHead key={header.id} className="py-3 whitespace-nowrap">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0
            ? (
                table.getRowModel().rows.map((row: any) => (
                  <TableRow key={row.id} className="hover:bg-muted/20 transition-colors">
                    {row.getVisibleCells().map((cell: any) => (
                      <TableCell key={cell.id} className="py-2.5 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
            : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-20 text-center">
                    <EmptyState />
                  </TableCell>
                </TableRow>
              )}
        </TableBody>
      </Table>
    </div>
  )
}

function MobileCard({ repo }: { repo: Repository }) {
  return (
    <div className="p-3 border-b last:border-b-0 hover:bg-muted/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-4 bg-muted text-[10px] font-mono text-muted-foreground flex items-center justify-center">
              #
              {repo.rank}
            </div>
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <span className="truncate">{repo.title}</span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </a>
          </div>
          {repo.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {repo.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span>{repo.stars}</span>
            <span>{repo.forks}</span>
            <span className={Number.parseInt(repo.starsToday) > 0 ? 'text-green-600 dark:text-green-400' : ''}>{repo.starsToday}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 text-muted-foreground p-8">
      <Search className="h-4 w-4" />
      <p className="text-xs">No repositories found</p>
    </div>
  )
}
