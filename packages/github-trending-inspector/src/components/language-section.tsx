'use client'

import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table'
import type { LanguageGroup, Repository } from '../lib/types'
import { Badge } from '$/components/ui/badge'
import { Button } from '$/components/ui/button'
import { Card, CardContent, CardHeader } from '$/components/ui/card'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '$/components/ui/dropdown-menu'
import { Input } from '$/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$/components/ui/table'
import { exportToCsv, exportToJson } from '$/lib/export'
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, FileJson, FileText, Hash, Search, Settings, Star, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { languageIcons } from '../lib/constants'
import { ColumnHeader } from './daily-trending'

export function LanguageSection({ group }: { group: LanguageGroup }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [showSearch, setShowSearch] = useState(false)
  const [isDataReady, setIsDataReady] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const columns: ColumnDef<Repository>[] = [
    {
      accessorKey: 'rank',
      header: ({ column }) => (
        <ColumnHeader
          title="Rank"
          type="number"
          isSortable
          sortDirection={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => <div className="tabular-nums">{row.getValue('rank')}</div>,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <ColumnHeader
          title="Repository"
          type="string"
          isSortable
          sortDirection={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <a
          href={row.original.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-foreground/90 hover:text-primary transition-colors duration-200"
        >
          <span className="hover:underline underline-offset-4">{row.getValue('title')}</span>
        </a>
      ),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <ColumnHeader
          title="Description"
          type="text"
          isSortable
          sortDirection={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <div className="max-w-[500px]">
          <p className="truncate text-muted-foreground/70 hover:text-muted-foreground transition-colors duration-200">
            {row.getValue('description')}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'stars',
      header: ({ column }) => (
        <ColumnHeader
          title="Stars"
          type="number"
          isSortable
          sortDirection={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => <div className="tabular-nums">{row.getValue('stars')}</div>,
    },
  ]

  const table = useReactTable({
    data: group.repos,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters, columnVisibility },
  })

  useEffect(() => {
    const timer = setTimeout(() => setIsDataReady(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showSearch) {
      inputRef.current?.focus()
    }
  }, [showSearch])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false)
        table.getColumn('title')?.setFilterValue('')
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showSearch, table])

  const languageIcon = languageIcons[group.language.toLowerCase()] || '/icons/file.svg'
  const languageAnchor = group.language.toLowerCase().replace(/\s+/g, '-')

  return (
    <Card id={languageAnchor} className="w-full overflow-hidden">
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="flex items-center gap-2 font-medium cursor-pointer hover:bg-muted/50 hover:border-border/80 transition-all duration-200"
          >
            <div className="relative w-4 h-4">
              <img src={languageIcon} alt={group.language} className="h-4 w-4 opacity-80 hover:opacity-100 transition-all duration-300" loading="lazy" />
            </div>
            <span className="hidden sm:inline">{group.language}</span>
            <span className="font-mono text-xs text-muted-foreground/80 sm:ml-1">{group.repos.length}</span>
          </Badge>

          <div className="flex items-center gap-2">
            {showSearch
              ? (
                  <div className="relative flex items-center">
                    <Input
                      ref={inputRef}
                      placeholder="Search..."
                      value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
                      onChange={event => table.getColumn('title')?.setFilterValue(event.target.value)}
                      className="h-8 w-[120px] sm:w-[150px] lg:w-[250px] pl-7 pr-7 text-sm"
                    />
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/70" />
                    <button
                      onClick={() => {
                        setShowSearch(false)
                        table.getColumn('title')?.setFilterValue('')
                      }}
                      className="absolute right-2 p-1 rounded-full hover:bg-muted/50 transition-colors duration-200"
                    >
                      <X className="h-3 w-3 text-muted-foreground/70" />
                    </button>
                  </div>
                )
              : (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="p-1.5 rounded-full hover:bg-muted/50 transition-colors duration-200"
                  >
                    <Search className="h-4 w-4 text-muted-foreground/70" />
                  </button>
                )}

            <div className="w-px h-6 bg-border/50 mx-2" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-full hover:bg-muted/50 transition-colors duration-200">
                  <Settings className="h-4 w-4 text-muted-foreground/70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel className="text-xs font-medium">Table Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => exportToJson(group.repos, `${group.language}-repos.json`)}
                  className="cursor-pointer hover:text-primary transition-colors"
                >
                  <FileJson className="mr-2 h-4 w-4" />
                  Export to JSON
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportToCsv(group.repos, `${group.language}-repos.csv`)}
                  className="cursor-pointer hover:text-primary transition-colors"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-medium">Toggle Columns</DropdownMenuLabel>
                {table.getAllColumns().map((column) => {
                  if (column.id === 'title')
                    return null

                  let Icon
                  switch (column.id) {
                    case 'rank':
                      Icon = Hash
                      break
                    case 'description':
                      Icon = FileText
                      break
                    case 'stars':
                      Icon = Star
                      break
                    default:
                      Icon = FileText
                  }

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(!!value)}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                    </DropdownMenuCheckboxItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isDataReady && table.getRowModel().rows?.length
                ? (
                    table.getRowModel().rows.map(row => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )
                : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        {isDataReady ? 'No results.' : ''}
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </div>

        {table.getPageCount() > 1 && (
          <div className="flex justify-end py-4">
            <div className="flex items-center gap-2 sm:gap-6">
              <span className="text-xs sm:text-sm text-muted-foreground/80 tabular-nums">
                <span className="hidden sm:inline">Page </span>
                {table.getState().pagination.pageIndex + 1}
                /
                {table.getPageCount()}
              </span>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8 sm:h-9 sm:w-auto sm:px-4 hover:bg-muted/50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8 sm:h-9 sm:w-auto sm:px-4 hover:bg-muted/50 disabled:hover:bg-transparent"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
