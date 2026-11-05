import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '../lib/utils';
import type { useTable } from '../hooks/use-table';

interface TablePaginationProps {
  stats: ReturnType<typeof useTable>['paginationStats'];
  pagination: ReturnType<typeof useTable>['pagination'];
}

export function TablePagination({ stats, pagination }: TablePaginationProps) {
  const { totalFilteredRows, firstItemOnPage, lastItemOnPage } = stats;
  const { pageIndex, pageCount, canPreviousPage, canNextPage, previousPage, nextPage } = pagination;

  return (
    <div className="flex items-center justify-between gap-4 border-t border-border/60 bg-muted/15 px-4 py-2">
      <div className="text-xs text-muted-foreground tabular-nums">
        {totalFilteredRows === 0 ? (
          '0 repositories'
        ) : (
          <>
            Showing{' '}
            <span className="font-mono font-medium text-foreground">
              {formatNumber(firstItemOnPage)}–{formatNumber(lastItemOnPage)}
            </span>{' '}
            of{' '}
            <span className="font-mono font-medium text-foreground">
              {formatNumber(totalFilteredRows)}
            </span>
          </>
        )}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            <span className="font-medium text-foreground">{pageIndex + 1}</span>
            <span className="mx-1 text-muted-foreground/40">/</span>
            <span>{pageCount}</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              onClick={previousPage}
              disabled={!canPreviousPage}
              className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground shadow-2xs transition-[transform,background-color,color] duration-150 ease-[var(--ease-out)] hover:bg-muted hover:text-foreground active:scale-[0.95] disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
            </button>

            <button
              type="button"
              aria-label="Next page"
              onClick={nextPage}
              disabled={!canNextPage}
              className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground shadow-2xs transition-[transform,background-color,color] duration-150 ease-[var(--ease-out)] hover:bg-muted hover:text-foreground active:scale-[0.95] disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
