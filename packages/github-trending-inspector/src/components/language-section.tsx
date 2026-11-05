import { useMemo, useRef } from 'react';
import { useMediaQuery } from '../hooks/use-media-query';
import { useTable } from '../hooks/use-table';
import type { LanguageGroup } from '../lib/types';
import { slugify } from '../lib/utils';

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

  const totalStarsToday = useMemo(
    () => group.repos.reduce((sum, r) => sum + (r.today ?? 0), 0),
    [group.repos],
  );

  const sectionId = slugify(group.language);
  const tableRows = table.getRowModel().rows;

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className="scroll-mt-6 overflow-hidden rounded-xl border border-border bg-card/30 shadow-2xs"
    >
      <TableHeader
        language={group.language}
        repoCount={group.repos.length}
        totalStarsToday={totalStarsToday}
        isFiltered={globalFilter !== ''}
      />

      {isMobile ? <MobileView rows={tableRows} /> : <DesktopView table={table} />}

      <TablePagination stats={paginationStats} pagination={pagination} />
    </section>
  );
}
