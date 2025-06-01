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

  return {
    state,
    updateSorting: updaterOrValue => setState(prev => ({
      ...prev,
      sorting: typeof updaterOrValue === 'function' ? updaterOrValue(prev.sorting) : updaterOrValue,
    })),
    updateColumnVisibility: updaterOrValue => setState(prev => ({
      ...prev,
      columnVisibility: typeof updaterOrValue === 'function' ? updaterOrValue(prev.columnVisibility) : updaterOrValue,
    })),
    updateGlobalFilter: updaterOrValue => setState(prev => ({
      ...prev,
      globalFilter: typeof updaterOrValue === 'function' ? updaterOrValue(prev.globalFilter) : updaterOrValue,
      pagination: { ...prev.pagination, pageIndex: 0 },
    })),
    updatePagination: updaterOrValue => setState(prev => ({
      ...prev,
      pagination: typeof updaterOrValue === 'function' ? updaterOrValue(prev.pagination) : updaterOrValue,
    })),
  }
}
