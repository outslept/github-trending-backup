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
import { useMediaQuery } from './use-media-query'

function filterRepos(repos: Repository[], searchTerm: string): Repository[] {
  const term = searchTerm.trim().toLowerCase()
  if (!term) return repos
  return repos.filter(
    (repo) =>
      repo.repo.toLowerCase().includes(term) ||
      repo.desc.toLowerCase().includes(term)
  )
}

export function useTable(repos: Repository[], columns: ColumnDef<Repository>[]) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const pageSize = isMobile ? 5 : 10

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'rank', desc: false },
  ])
  const [globalFilter, setGlobalFilter] = useState('')

  const filteredRepos = useMemo(
    () => filterRepos(repos, globalFilter),
    [repos, globalFilter]
  )

  const table = useReactTable({
    data: filteredRepos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    initialState: { pagination: { pageSize } },
  })

  const rowCount = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = table.getPageCount()
  const firstItemOnPage = rowCount === 0 ? 0 : pageIndex * pageSize + 1
  const lastItemOnPage =
    rowCount === 0 ? 0 : Math.min(firstItemOnPage + pageSize - 1, rowCount)

  return {
    table,
    state: {
      globalFilter,
      sorting,
      pagination: table.getState().pagination,
    },
    paginationStats: {
      totalFilteredRows: rowCount,
      pageCount,
      firstItemOnPage,
      lastItemOnPage,
    },
    pagination: {
      pageIndex,
      pageCount,
      canPreviousPage: table.getCanPreviousPage(),
      canNextPage: table.getCanNextPage(),
      previousPage: () => table.previousPage(),
      nextPage: () => table.nextPage(),
    },
    updateGlobalFilter: (value: string) => {
      setGlobalFilter(value)
    },
    isMobile,
  }
}
