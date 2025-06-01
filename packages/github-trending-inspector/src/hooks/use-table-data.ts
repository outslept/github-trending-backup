'use client'

import type { Repository, TableState } from '$/lib/types'
import type { ColumnDef } from '@tanstack/react-table'
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

export function useTableData(repos: Repository[], columns: ColumnDef<Repository>[], tableState: TableState, handlers: { state?: TableState, updateSorting: any, updateColumnVisibility: any, updateGlobalFilter: any, updatePagination: any }) {
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
    state: tableState,
    initialState: {
      sorting: [{ id: 'rank', desc: false }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  })

  const totalFilteredRows = table.getFilteredRowModel().rows.length
  const firstItemOnPage = totalFilteredRows === 0 ? 0 : tableState.pagination.pageIndex * tableState.pagination.pageSize + 1

  return {
    table,
    stats: {
      totalFilteredRows,
      firstItemOnPage,
      lastItemOnPage: totalFilteredRows === 0 ? 0 : Math.min(firstItemOnPage + table.getRowModel().rows.length - 1, totalFilteredRows),
    },
  }
}
