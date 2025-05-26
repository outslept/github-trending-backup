'use client'

import type { Repository, TableState } from '$/lib/types'
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'

export function useTableData(repos: Repository[], columns: any[], tableState: TableState, handlers: any) {
  const table = useReactTable({
    data: repos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: handlers.updateSorting,
    onColumnVisibilityChange: handlers.updateColumnVisibility,
    onGlobalFilterChange: handlers.updateGlobalFilter,
    onPaginationChange: handlers.updatePagination,
    state: {
      sorting: tableState.sorting,
      columnVisibility: tableState.columnVisibility,
      globalFilter: tableState.globalFilter,
      pagination: tableState.pagination,
    },
    initialState: {
      sorting: [{ id: 'rank', desc: false }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  })

  const stats = useMemo(() => {
    const totalFilteredRows = table.getFilteredRowModel().rows.length
    const currentPageRows = table.getRowModel().rows.length
    const firstItemOnPage = totalFilteredRows === 0 ? 0 : tableState.pagination.pageIndex * tableState.pagination.pageSize + 1
    const lastItemOnPage = totalFilteredRows === 0 ? 0 : Math.min(firstItemOnPage + currentPageRows - 1, totalFilteredRows)

    return { totalFilteredRows, currentPageRows, firstItemOnPage, lastItemOnPage }
  }, [table, tableState.pagination])

  return { table, stats }
}
