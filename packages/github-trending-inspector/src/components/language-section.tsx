import { useMemo } from 'react';

import { useMediaQuery } from '../hooks/use-media-query';
import { useTable } from '../hooks/use-table';
import type { LanguageGroup } from '../lib/types';

import { createColumns } from './table-columns';
import { TableHeader } from './table-header';
import { TablePagination } from './table-pagination';
import { DesktopView, MobileView } from './table-views';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

const MOBILE_BREAKPOINT = '(max-width: 767px)';
const MIN_TABLE_WIDTH = 767;

const columns = createColumns();

function generateSectionId(language: string): string {
  return language.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function LanguageSection({ group }: { group: LanguageGroup }) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const { table, state, paginationStats, pagination, updateGlobalFilter } =
    useTable(group.repos, columns);

  const sectionId = generateSectionId(group.language);
  const tableRows = table.getRowModel().rows;

  return (
    <section
      id={sectionId}
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
          <MobileView rows={tableRows} />
        ) : (
          <ScrollArea className="w-full">
            <div style={{ minWidth: `${MIN_TABLE_WIDTH}px` }}>
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
