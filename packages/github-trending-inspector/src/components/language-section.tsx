import { useMediaQuery } from "../hooks/use-media-query";
import { useTable } from "../hooks/use-table";
import type { LanguageGroup } from "../lib/types";

import { createColumns } from "./table-columns";
import { TableHeader } from "./table-header";
import { TablePagination } from "./table-pagination";
import { DesktopView, MobileView } from "./table-views";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

const columns = createColumns();

export function LanguageSection({ group }: { group: LanguageGroup }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { table, state, paginationStats, pagination, updateGlobalFilter } =
    useTable(group.repos, columns);

  return (
    <section
      // eslint-disable-next-line unicorn/prefer-string-replace-all
      id={group.language.toLowerCase().replace(/[^a-z0-9]/g, "")}
      className="border border-border/60 rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <TableHeader
        language={group.language}
        repoCount={group.repos.length}
        globalFilter={state.globalFilter}
        onFilterChange={updateGlobalFilter}
      />

      <div className="overflow-hidden">
        {isMobile ? (
          <MobileView rows={table.getRowModel().rows} />
        ) : (
          <ScrollArea className="w-full">
            <div className="min-w-[800px]">
              <DesktopView table={table} columns={columns} />
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>

      <TablePagination stats={paginationStats} pagination={pagination} />
    </section>
  );
}
