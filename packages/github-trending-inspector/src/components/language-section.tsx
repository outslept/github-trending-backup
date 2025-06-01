'use client'

import type { LanguageGroup } from '$/lib/types'
import { useMediaQuery } from '$/hooks/use-media-query'
import { useTableData } from '$/hooks/use-table-data'
import { useTableState } from '$/hooks/use-table-state'
import { createColumns } from './table-columns'
import { TableHeader } from './table-header'
import { TablePagination } from './table-pagination'
import { DesktopView, MobileView } from './table-views'
import { ScrollArea, ScrollBar } from './ui/scroll-area'

export function LanguageSection({ group }: { group: LanguageGroup }) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const columns = createColumns()
  const tableState = useTableState()
  const { table, stats } = useTableData(group.repos, columns, tableState.state, tableState)

  return (
    <div id={group.language.toLowerCase()} className="border">
      <TableHeader
        language={group.language}
        repoCount={group.repos.length}
        globalFilter={tableState.state.globalFilter}
        onFilterChange={tableState.updateGlobalFilter}
      />

      {isMobile
        ? (
            <MobileView rows={table.getRowModel().rows} />
          )
        : (
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="min-w-[800px]">
                <DesktopView table={table} columns={columns} />
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}

      <TablePagination
        stats={stats}
        pagination={{
          pageIndex: table.getState().pagination.pageIndex,
          pageCount: table.getPageCount(),
          canPreviousPage: table.getCanPreviousPage(),
          canNextPage: table.getCanNextPage(),
          previousPage: table.previousPage,
          nextPage: table.nextPage,
        }}
      />
    </div>
  )
}
