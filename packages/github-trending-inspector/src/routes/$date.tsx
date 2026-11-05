import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Suspense, useMemo, useState } from 'react';

import { AppSidebar } from '../components/app-sidebar';
import { DatePageSkeleton } from '../components/date-page-skeleton';
import { DailyTrending } from '../components/daily-trending';
import { ScrollToTop } from '../components/scroll-to-top';
import { SidebarDatePicker } from '../components/sidebar-date-picker';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';

import {
  fetchTrendingMetadata,
  isDateAvailableInMetadata,
  lastAvailableDateFromMetadata,
} from '../lib/trending-metadata';
import { useTrendingByDate } from '../hooks/use-trending-data';
import { filterRepos } from '../hooks/use-table';
import { useDebounce } from '../hooks/use-debounce';
import { useActiveSection } from '../hooks/use-active-section';
import { isValidIsoDate, slugify } from '../lib/utils';

export const Route = createFileRoute('/$date')({
  beforeLoad: async ({ params }) => {
    const { date } = params;

    if (!isValidIsoDate(date)) return;

    try {
      const meta = await fetchTrendingMetadata();

      if (!isDateAvailableInMetadata(meta, date)) {
        const latest = lastAvailableDateFromMetadata(meta);

        if (latest && latest !== date) {
          throw redirect({
            to: '/$date',
            params: { date: latest },
            replace: true,
          });
        }
      }
    } catch {}
  },
  component: DatePage,
});

function DatePageContent({ date }: { date: string }) {
  const navigate = useNavigate();
  const { data: languageGroups } = useTrendingByDate(date);

  const [globalFilterInput, setGlobalFilterInput] = useState('');
  const globalFilter = useDebounce(globalFilterInput, 250);

  const navigateToDate = (iso: string) => {
    navigate({
      to: '/$date',
      params: { date: iso },
    });
  };

  const filteredGroups = useMemo(() => {
    return languageGroups
      .map((group) => ({
        ...group,
        repos: filterRepos(group.repos, globalFilter),
      }))
      .filter((group) => group.repos.length > 0);
  }, [languageGroups, globalFilter]);

  const sectionIds = useMemo(
    () => filteredGroups.map((g) => slugify(g.language)),
    [filteredGroups],
  );
  const activeId = useActiveSection(sectionIds);

  return (
    <SidebarProvider>
      <AppSidebar
        date={date}
        filteredGroups={filteredGroups}
        globalFilterInput={globalFilterInput}
        setGlobalFilterInput={setGlobalFilterInput}
        navigateToDate={navigateToDate}
        activeId={activeId}
      />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-3 border-b border-border/60 bg-background/85 px-4 backdrop-blur-md md:hidden">
          <SidebarTrigger />
          <SidebarDatePicker
            date={date}
            onDateChange={navigateToDate}
            className="max-w-[220px]"
          />
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {filteredGroups.length} lang
          </span>
        </header>

        <div className="container mx-auto flex-1 px-4 py-6 pb-20 md:pb-8 max-w-6xl">
          <DailyTrending groups={filteredGroups} globalFilter={globalFilter} />
        </div>
      </SidebarInset>
      <ScrollToTop />
    </SidebarProvider>
  );
}

function DatePage() {
  const { date } = Route.useParams();

  return (
    <Suspense fallback={<DatePageSkeleton />}>
      <DatePageContent date={date} />
    </Suspense>
  );
}
