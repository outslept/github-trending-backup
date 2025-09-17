import { ChevronLeft, ChevronRight } from 'lucide-react'

import { formatNumber } from '../lib/format'
import { cn } from '../lib/utils'

interface PaginationStats {
  totalFilteredRows: number;
  firstItemOnPage: number;
  lastItemOnPage: number;
}

interface PaginationControls {
  pageIndex: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  previousPage: () => void;
  nextPage: () => void;
}

interface TablePaginationProps {
  stats: PaginationStats;
  pagination: PaginationControls;
}

export function TablePagination ({ stats, pagination }: TablePaginationProps) {
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
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/40 bg-muted/10'>
      <div className='text-sm text-muted-foreground tracking-tight'>
        {totalFilteredRows === 0
          ? 'No repositories found'
          : (
            <>
              Showing <span className='font-medium text-foreground'>{formatNumber(firstItemOnPage)}</span> to{' '}
              <span className='font-medium text-foreground'>{formatNumber(lastItemOnPage)}</span> of{' '}
              <span className='font-medium text-foreground'>{formatNumber(totalFilteredRows)}</span> repositories
            </>
            )}
      </div>

      {pageCount > 1 && (
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1 text-sm text-muted-foreground tracking-tight'>
            <span>Page</span>
            <span className='font-medium text-foreground'>{pageIndex + 1}</span>
            <span>of</span>
            <span className='font-medium text-foreground'>{pageCount}</span>
          </div>

          <div className='flex items-center gap-1 ml-2'>
            <button
              type='button'
              aria-label='Previous page'
              onClick={previousPage}
              disabled={!canPreviousPage}
              className={cn(
                'size-8 flex items-center justify-center rounded-lg border border-border/60 transition-all duration-200 ease-out',
                !canPreviousPage
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-border hover:scale-105 active:scale-95'
              )}
            >
              <ChevronLeft className='size-4' />
            </button>

            <button
              type='button'
              aria-label='Next page'
              onClick={nextPage}
              disabled={!canNextPage}
              className={cn(
                'size-8 flex items-center justify-center rounded-lg border border-border/60 transition-all duration-200 ease-out',
                !canNextPage
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-border hover:scale-105 active:scale-95'
              )}
            >
              <ChevronRight className='size-4' />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}