'use client'

import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import type { LanguageGroup, Repository } from '../types'
import { Card, CardContent, CardHeader } from '$/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '$/components/ui/table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { motion } from 'motion/react'
import { useState } from 'react'
import { createColumns } from '../columns'
import { languageIcons } from '../constants'
import { Header } from './header'
import { Pagination } from './pagination'

interface LanguageSectionProps {
  group: LanguageGroup
  session: any
}

export function LanguageSection({ group, session }: Readonly<LanguageSectionProps>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [showSearch, setShowSearch] = useState(false)

  const columns = createColumns(async (repo: Repository) => {
    const response = await fetch('/api/github/star', {
      method: repo.isStarred ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoName: repo.title }),
    })
    if (!response.ok)
      throw new Error('Failed to toggle star')
  }, session)

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  const languageIcon = languageIcons[group.language.toLowerCase()] || '/icons/file.svg'
  const languageAnchor = group.language.toLowerCase().replace(/\s+/g, '-')

  return (
    <Card id={languageAnchor} className="relative group scroll-mt-20">
      <CardHeader className="space-y-0 pb-2">
        <Header
          group={group}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          table={table}
          languageIcon={languageIcon}
        />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length
                ? (
                    table.getRowModel().rows.map(row => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.2,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className="group/row"
                      >
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))
                  )
                : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </div>
        <Pagination table={table} language={group.language} />
      </CardContent>
    </Card>
  )
}
