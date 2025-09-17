import { useMediaQuery } from '../hooks/use-media-query'
import { useTable } from '../hooks/use-table'
import type { LanguageGroup } from '../lib/types'
import { slugify } from '../lib/slug'

import { buildRepoColumns } from './table-columns'
import { TableHeader } from './table-header'
import { TablePagination } from './table-pagination'
import { DesktopView, MobileView } from './table-views'
import { ScrollArea, ScrollBar } from './ui/scroll-area'

const MOBILE_BREAKPOINT = '(max-width: 767px)'
const MIN_TABLE_WIDTH = 767

const columns = buildRepoColumns()

export function LanguageSection ({ group }: { group: LanguageGroup }) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const { table, state, paginationStats, pagination, updateGlobalFilter } =
    useTable(group.repos, columns)

  const sectionId = slugify(group.language)
  const tableRows = table.getRowModel().rows

  return (
    <section
      id={sectionId}
      className='border border-border/60 rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow duration-300'
    >
      <TableHeader
        language={group.language}
        repoCount={group.repos.length}
        globalFilter={state.globalFilter}
        onFilterChange={updateGlobalFilter}
      />

      <div className='overflow-hidden'>
        {isMobile
          ? (
            <MobileView rows={tableRows} />
            )
          : (
            <ScrollArea className='w-full'>
              <div style={{ minWidth: `${MIN_TABLE_WIDTH}px` }}>
                <DesktopView table={table} />
              </div>
              <ScrollBar orientation='horizontal' />
            </ScrollArea>
            )}
      </div>

      <TablePagination stats={paginationStats} pagination={pagination} />
    </section>
  )
}
