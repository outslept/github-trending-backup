import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  stats: {
    totalFilteredRows: number;
    firstItemOnPage: number;
    lastItemOnPage: number;
  };
  pagination: {
    pageIndex: number;
    pageCount: number;
    canPreviousPage: boolean;
    canNextPage: boolean;
    previousPage: () => void;
    nextPage: () => void;
  };
}

export const TablePagination = ({
  stats,
  pagination,
}: TablePaginationProps) => {
  const { totalFilteredRows, firstItemOnPage, lastItemOnPage } = stats;
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
        <div className="text-sm text-muted-foreground tracking-tight">
          {totalFilteredRows > 0 ? (
            <>
              Showing{" "}
              <span className="font-medium text-foreground">
                {firstItemOnPage}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {lastItemOnPage}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {totalFilteredRows.toLocaleString()}
              </span>{" "}
              repositories
            </>
          ) : (
            "No repositories found"
          )}
        </div>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground tracking-tight">
            <span>Page</span>
            <span className="font-medium text-foreground">{pageIndex + 1}</span>
            <span>of</span>
            <span className="font-medium text-foreground">{pageCount}</span>
          </div>

          <div className="flex items-center gap-1 ml-2">
            <button
              className={`
                size-8 flex items-center justify-center rounded-lg border border-border/60
                transition-all duration-200 ease-out
                ${
                  canPreviousPage
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-border hover:scale-105 active:scale-95"
                    : "text-muted-foreground/30 cursor-not-allowed"
                }
              `}
              onClick={previousPage}
              disabled={!canPreviousPage}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              className={`
                size-8 flex items-center justify-center rounded-lg border border-border/60
                transition-all duration-200 ease-out
                ${
                  canNextPage
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-border hover:scale-105 active:scale-95"
                    : "text-muted-foreground/30 cursor-not-allowed"
                }
              `}
              onClick={nextPage}
              disabled={!canNextPage}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
