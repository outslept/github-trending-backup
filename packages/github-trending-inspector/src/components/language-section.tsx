import { useMediaQuery } from '../hooks/use-media-query'
import { useTable } from '../hooks/use-table'
import type { LanguageGroup } from '../lib/types'
import { slugify } from '../lib/slug'

import { buildRepoColumns } from './table-columns'
import { TableHeader } from './table-header'
import { TablePagination } from './table-pagination'
import { DesktopView, MobileView } from './table-views'

const MOBILE_BREAKPOINT = '(max-width: 767px)'

const columns = buildRepoColumns()

interface LanguageSectionProps {
  group: LanguageGroup
  globalFilter: string
}

export function LanguageSection({ group, globalFilter }: LanguageSectionProps) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const { table, paginationStats, pagination } = useTable(
    group.repos,
    columns,
    globalFilter
  )

  const sectionId = slugify(group.language)
  const tableRows = table.getRowModel().rows

  return (
    <section
      id={sectionId}
      className="mb-6 pb-6 border-b border-border/40 last:mb-0 last:pb-0 last:border-b-0"
    >
      <TableHeader language={group.language} repoCount={group.repos.length} />

      {isMobile ? (
        <MobileView rows={tableRows} />
      ) : (
        <DesktopView table={table} />
      )}

      <TablePagination stats={paginationStats} pagination={pagination} />
    </section>
  )
}
