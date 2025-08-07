import { ChevronLeft, ChevronRight } from 'lucide-react';

import { formatNumber } from '../lib/format';
import { cn } from '../lib/utils';

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

function HighlightedNumber({ value }: { value: number }) {
  return (
    <span className="font-medium text-foreground">
      {formatNumber(value)}
    </span>
  );
}

function PaginationButton({
  onClick,
  disabled,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        'size-8 flex items-center justify-center rounded-lg border border-border/60 transition-all duration-200 ease-out',
        disabled
          ? 'text-muted-foreground/30 cursor-not-allowed'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-border hover:scale-105 active:scale-95'
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      <Icon className="size-4" />
    </button>
  );
}

function StatsDisplay({ stats }: { stats: PaginationStats }) {
  const { totalFilteredRows, firstItemOnPage, lastItemOnPage } = stats;

  if (totalFilteredRows === 0) {
    return (
      <div className="text-sm text-muted-foreground tracking-tight">
        No repositories found
      </div>
    );
  }

  return (
    <div className="text-sm text-muted-foreground tracking-tight">
      Showing <HighlightedNumber value={firstItemOnPage} /> to{' '}
      <HighlightedNumber value={lastItemOnPage} /> of{' '}
      <HighlightedNumber value={totalFilteredRows} /> repositories
    </div>
  );
}

function PageInfo({ pageIndex, pageCount }: { pageIndex: number; pageCount: number }) {
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground tracking-tight">
      <span>Page</span>
      <HighlightedNumber value={pageIndex + 1} />
      <span>of</span>
      <HighlightedNumber value={pageCount} />
    </div>
  );
}

export function TablePagination({ stats, pagination }: TablePaginationProps) {
  const {
    pageIndex,
    pageCount,
    canPreviousPage,
    canNextPage,
    previousPage,
    nextPage,
  } = pagination;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/40 bg-muted/10">
      <div className="flex items-center gap-2">
        <StatsDisplay stats={stats} />
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <PageInfo pageIndex={pageIndex} pageCount={pageCount} />

          <div className="flex items-center gap-1 ml-2">
            <PaginationButton
              onClick={previousPage}
              disabled={!canPreviousPage}
              icon={ChevronLeft}
              label="Previous page"
            />
            <PaginationButton
              onClick={nextPage}
              disabled={!canNextPage}
              icon={ChevronRight}
              label="Next page"
            />
          </div>
        </div>
      )}
    </div>
  );
}
