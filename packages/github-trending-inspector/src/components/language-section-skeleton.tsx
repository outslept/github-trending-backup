import { useMediaQuery } from "../hooks/use-media-query";
import { TableHeader } from "./table-header";
import { TablePagination } from "./table-pagination";
import {
  DesktopViewSkeleton,
  MobileViewSkeleton,
} from "./table-views-skeleton";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface LanguageSectionSkeletonProps {
  language: string;
  repoCount: number;
}

export function LanguageSectionSkeleton({
  language,
  repoCount,
}: LanguageSectionSkeletonProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  const skeletonStats = {
    totalFilteredRows: repoCount,
    firstItemOnPage: 1,
    lastItemOnPage: Math.min(10, repoCount),
  };

  const skeletonPagination = {
    pageIndex: 0,
    pageCount: Math.ceil(repoCount / 10),
    canPreviousPage: false,
    canNextPage: repoCount > 10,
    previousPage: () => {},
    nextPage: () => {},
  };

  return (
    <section className="border border-border/60 rounded-xl bg-background shadow-sm">
      <TableHeader
        language={language}
        repoCount={repoCount}
        globalFilter=""
        onFilterChange={() => {}}
        isLoading={true}
      />

      <div className="overflow-hidden">
        {isMobile ? (
          <MobileViewSkeleton />
        ) : (
          <ScrollArea className="w-full">
            <div className="min-w-[800px]">
              <DesktopViewSkeleton />
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>

      <TablePagination
        stats={skeletonStats}
        pagination={skeletonPagination}
        isLoading={true}
      />
    </section>
  );
}
