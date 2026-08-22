import { ChevronLeft, ChevronRight } from 'lucide-react'

import { formatNumber } from '../lib/format'

interface PaginationStats {
  totalFilteredRows: number
  firstItemOnPage: number
  lastItemOnPage: number
}

interface PaginationControls {
  pageIndex: number
  pageCount: number
  canPreviousPage: boolean
  canNextPage: boolean
  previousPage: () => void
  nextPage: () => void
}

interface TablePaginationProps {
  stats: PaginationStats
  pagination: PaginationControls
}

export function TablePagination({ stats, pagination }: TablePaginationProps) {
  const { totalFilteredRows, firstItemOnPage, lastItemOnPage } = stats
  const {
    pageIndex,
    pageCount,
    canPreviousPage,
    canNextPage,
    previousPage,
    nextPage,
  } = pagination

  return (
    <div className="flex flex-col items-center justify-between gap-4 pt-4 sm:flex-row">
      <div className="text-sm tracking-tight text-muted-foreground">
        {totalFilteredRows === 0
          ? 'no repositories found'
          : (
            <>
              showing <span className="font-medium text-foreground">{formatNumber(firstItemOnPage)}</span> to{' '}
              <span className="font-medium text-foreground">{formatNumber(lastItemOnPage)}</span> of{' '}
              <span className="font-medium text-foreground">{formatNumber(totalFilteredRows)}</span> repositories
            </>
          )}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm tracking-tight text-muted-foreground">
            <span>page</span>
            <span className="font-medium text-foreground">{pageIndex + 1}</span>
            <span>of</span>
            <span className="font-medium text-foreground">{pageCount}</span>
          </div>

          <div className="ml-2 flex items-center gap-1">
            <button
              type="button"
              aria-label="previous page"
              onClick={previousPage}
              disabled={!canPreviousPage}
              className="flex items-center justify-center size-8 text-muted-foreground border border-border/60 rounded-lg transition-colors hover:bg-muted/60 hover:text-foreground disabled:cursor-not-allowed disabled:text-muted-foreground/30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              type="button"
              aria-label="next page"
              onClick={nextPage}
              disabled={!canNextPage}
              className="flex items-center justify-center size-8 text-muted-foreground border border-border/60 rounded-lg transition-colors hover:bg-muted/60 hover:text-foreground disabled:cursor-not-allowed disabled:text-muted-foreground/30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
