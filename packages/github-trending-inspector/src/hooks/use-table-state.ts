'use client'

import type { TableState } from '$/lib/types'
import type { SortingState, VisibilityState } from '@tanstack/react-table'
import { useState } from 'react'

export function useTableState(initialState?: Partial<TableState>) {
  const [state, setState] = useState<TableState>({
    sorting: [{ id: 'rank', desc: false }],
    columnVisibility: {},
    globalFilter: '',
    pagination: { pageIndex: 0, pageSize: 10 },
    ...initialState,
  })

  return {
    state,
    updateSorting: (updaterOrValue: SortingState | ((arg0: SortingState) => SortingState)) => setState(prev => ({
      ...prev,
      sorting: typeof updaterOrValue === 'function' ? updaterOrValue(prev.sorting) : updaterOrValue,
    })),
    updateColumnVisibility: (updaterOrValue: VisibilityState | ((arg0: VisibilityState) => VisibilityState)) => setState(prev => ({
      ...prev,
      columnVisibility: typeof updaterOrValue === 'function' ? updaterOrValue(prev.columnVisibility) : updaterOrValue,
    })),
    updateGlobalFilter: (updaterOrValue: string | ((arg0: string) => string)) => setState(prev => ({
      ...prev,
      globalFilter: typeof updaterOrValue === 'function' ? updaterOrValue(prev.globalFilter) : updaterOrValue,
      pagination: { ...prev.pagination, pageIndex: 0 },
    })),
    updatePagination: (updaterOrValue: { pageIndex: number, pageSize: number } | ((arg0: { pageIndex: number, pageSize: number }) => { pageIndex: number, pageSize: number })) => setState(prev => ({
      ...prev,
      pagination: typeof updaterOrValue === 'function' ? updaterOrValue(prev.pagination) : updaterOrValue,
    })),
  }
}
