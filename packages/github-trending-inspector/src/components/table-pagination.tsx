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
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t">
      <PaginationInfo stats={stats} />
      <PaginationControls pagination={pagination} />
    </div>
  )
}

function PaginationInfo({ stats }: { stats: any }) {
  const { totalFilteredRows, firstItemOnPage, lastItemOnPage } = stats

  return (
    <div className="text-xs text-muted-foreground">
      {totalFilteredRows > 0
        ? `${firstItemOnPage}-${lastItemOnPage} of ${totalFilteredRows}`
        : 'No repositories'}
    </div>
  )
}

function PaginationControls({ pagination }: { pagination: any }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">
        {pagination.pageIndex + 1}
        {' '}
        of
        {pagination.pageCount}
      </span>
      <button
        className="h-6 w-6 border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-colors"
        onClick={pagination.previousPage}
        disabled={!pagination.canPreviousPage}
      >
        <ChevronLeft className="h-3 w-3" />
      </button>
      <button
        className="h-6 w-6 border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-colors"
        onClick={pagination.nextPage}
        disabled={!pagination.canNextPage}
      >
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  )
}
