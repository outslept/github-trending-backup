import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import type { Repository } from '../lib/types'

export function filterRepos(repos: Repository[], searchTerm: string): Repository[] {
  const term = searchTerm.trim().toLowerCase()
  if (!term) return repos
  return repos.filter(
    (repo) =>
      repo.repo.toLowerCase().includes(term) ||
      repo.desc.toLowerCase().includes(term)
  )
}

export function useTable(
  repos: Repository[],
  columns: ColumnDef<Repository>[],
  globalFilter: string,
  isMobile: boolean,
  onPageChange?: () => void
) {
  const pageSize = isMobile ? 5 : 10

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'rank', desc: false },
  ])

  const filteredRepos = useMemo(
    () => filterRepos(repos, globalFilter),
    [repos, globalFilter]
  )

  const table = useReactTable({
    data: filteredRepos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  const rowCount = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = table.getPageCount()
  const firstItemOnPage = rowCount === 0 ? 0 : pageIndex * pageSize + 1
  const lastItemOnPage =
    rowCount === 0 ? 0 : Math.min(firstItemOnPage + pageSize - 1, rowCount)

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next') table.nextPage()
    else table.previousPage()
    onPageChange?.()
  }

  return {
    table,
    paginationStats: {
      totalFilteredRows: rowCount,
      firstItemOnPage,
      lastItemOnPage,
    },
    pagination: {
      pageIndex,
      pageCount,
      canPreviousPage: table.getCanPreviousPage(),
      canNextPage: table.getCanNextPage(),
      previousPage: () => handlePageChange('prev'),
      nextPage: () => handlePageChange('next'),
    },
  }
}
