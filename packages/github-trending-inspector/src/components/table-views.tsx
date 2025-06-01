import type { Repository } from '$/lib/types'
import { flexRender } from '@tanstack/react-table'
import { ExternalLink, Search } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

function MobileCard({ repo }: { repo: Repository }) {
  return (
    <div className="p-3 border-b last:border-b-0 hover:bg-muted/20 md:hidden">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-4 bg-muted text-[10px] font-mono text-muted-foreground flex items-center justify-center flex-shrink-0">
          #
          {repo.rank}
        </div>
        <a
          href={`https://github.com/${repo.repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary min-w-0"
        >
          <span className="truncate">{repo.repo}</span>
          <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 flex-shrink-0" />
        </a>
      </div>
      {repo.desc && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {repo.desc}
        </p>
      )}
      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
        <span>{repo.stars}</span>
        <span>{repo.forks}</span>
        <span className={repo.today > 0 ? 'text-green-600 dark:text-green-400' : ''}>{repo.today}</span>
      </div>
    </div>
  )
}

export function MobileView({ rows }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 text-muted-foreground p-8">
        <Search className="size-4" />
        <p className="text-xs">No repositories found</p>
      </div>
    )
  }

  return (
    <>
      {rows.map(row => (
        <MobileCard key={row.id} repo={row.original} />
      ))}
    </>
  )
}

export function DesktopView({ table, columns }) {
  return (
    <Table className="hidden md:table">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup: any) => (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header: any) => (
              <TableHead key={header.id}>
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
          ? table.getRowModel().rows.map(row => (
              <TableRow key={row.id} className="hover:bg-muted/20">
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className="py-2.5 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground p-8">
                    <Search className="size-4" />
                    <p className="text-xs">No repositories found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
      </TableBody>
    </Table>
  )
}
