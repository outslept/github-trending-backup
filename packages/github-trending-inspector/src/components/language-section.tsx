import { useRef } from 'react';
import { useMediaQuery } from '../hooks/use-media-query';
import { useTable } from '../hooks/use-table';
import type { LanguageGroup } from '../lib/types';
import { cn, slugify } from '../lib/utils';

import { buildRepoColumns } from './table-columns';
import { TableHeader } from './table-header';
import { TablePagination } from './table-pagination';
import { DesktopView, MobileView } from './table-views';

const MOBILE_BREAKPOINT = '(max-width: 767px)';

const columns = buildRepoColumns();

interface LanguageSectionProps {
  group: LanguageGroup;
  globalFilter: string;
}

export function LanguageSection({ group, globalFilter }: LanguageSectionProps) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const sectionRef = useRef<HTMLElement>(null);

  const handlePageChange = () => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const { table, paginationStats, pagination } = useTable(
    group.repos,
    columns,
    globalFilter,
    isMobile,
    handlePageChange,
  );

  const sectionId = slugify(group.language);
  const tableRows = table.getRowModel().rows;

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className={cn(
        'mb-6 scroll-mt-6 rounded-md p-3 transition-all duration-300',
        'bg-background border border-border',
      )}
    >
      <TableHeader
        language={group.language}
        repoCount={group.repos.length}
        isFiltered={globalFilter !== ''}
      />

      {isMobile ? <MobileView rows={tableRows} /> : <DesktopView table={table} />}

      <TablePagination stats={paginationStats} pagination={pagination} />
    </section>
  );
}
