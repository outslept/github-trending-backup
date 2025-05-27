import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TablePaginationProps {
  stats: {
    totalFilteredRows: number
    firstItemOnPage: number
    lastItemOnPage: number
  }
  pagination: {
    pageIndex: number
    pageCount: number
    canPreviousPage: boolean
    canNextPage: boolean
    previousPage: () => void
    nextPage: () => void
  }
}

export function TablePagination({ stats, pagination }: TablePaginationProps) {
  const { totalFilteredRows, firstItemOnPage, lastItemOnPage } = stats
  const { pageIndex, pageCount, canPreviousPage, canNextPage, previousPage, nextPage } = pagination

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t">
      <div className="text-xs text-muted-foreground">
        {totalFilteredRows > 0
          ? `${firstItemOnPage}-${lastItemOnPage} of ${totalFilteredRows}`
          : 'No repositories'}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {pageIndex + 1}
          {' '}
          of
          {pageCount}
        </span>
        <button
          className="size-6 border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-colors"
          onClick={previousPage}
          disabled={!canPreviousPage}
        >
          <ChevronLeft className="size-3" />
        </button>
        <button
          className="size-6 border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-colors"
          onClick={nextPage}
          disabled={!canNextPage}
        >
          <ChevronRight className="size-3" />
        </button>
      </div>
    </div>
  )
}
