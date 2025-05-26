'use client'

import type { TableState } from '$/lib/types'
import { useState } from 'react'

export function useTableState(initialState?: Partial<TableState>) {
  const [state, setState] = useState<TableState>({
    sorting: [{ id: 'rank', desc: false }],
    columnVisibility: {},
    globalFilter: '',
    pagination: { pageIndex: 0, pageSize: 10 },
    ...initialState,
  })

  const updateSorting = (updaterOrValue: any) => {
    setState(prev => ({
      ...prev,
      sorting: typeof updaterOrValue === 'function' ? updaterOrValue(prev.sorting) : updaterOrValue,
    }))
  }

  const updateColumnVisibility = (updaterOrValue: any) => {
    setState(prev => ({
      ...prev,
      columnVisibility: typeof updaterOrValue === 'function' ? updaterOrValue(prev.columnVisibility) : updaterOrValue,
    }))
  }

  const updateGlobalFilter = (updaterOrValue: any) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(state.globalFilter) : updaterOrValue
    setState(prev => ({
      ...prev,
      globalFilter: newValue,
      pagination: { ...prev.pagination, pageIndex: 0 },
    }))
  }

  const updatePagination = (updaterOrValue: any) => {
    setState(prev => ({
      ...prev,
      pagination: typeof updaterOrValue === 'function' ? updaterOrValue(prev.pagination) : updaterOrValue,
    }))
  }

  return {
    state,
    updateSorting,
    updateColumnVisibility,
    updateGlobalFilter,
    updatePagination,
  }
}
