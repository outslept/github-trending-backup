import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Suspense, useMemo } from 'react';

import { TopReposBlock, TopReposSkeleton } from '../components/top-repos-block';
import { DatePickerDropdown } from '../components/date-picker-dropdown';
import { RecentDates } from '../components/recent-dates';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

import { useMetadata } from '../hooks/use-trending-data';
import { useTrendingHistory } from '../hooks/use-trending-history';
import { isValidIsoDate } from '../lib/utils';
import { getDateBoundsFromMetadata } from '../lib/trending-metadata';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const { data: metadata } = useMetadata();
  const { recentDates, addDate } = useTrendingHistory();

  const bounds = useMemo(() => getDateBoundsFromMetadata(metadata), [metadata]);

  const navigateToDate = (iso: string) => {
    if (!isValidIsoDate(iso)) return;
    addDate(iso);
    navigate({ to: '/$date', params: { date: iso } });
  };

  return (
    <div className="relative flex min-h-svh flex-col bg-background px-4 py-6">
      <main className="flex flex-1 flex-col items-center justify-start w-full max-w-md mx-auto gap-10 pt-10">
        <header className="flex flex-col items-center gap-5 text-center">
          <img src="/daily.png" alt="Daily trending" className="size-40 object-contain" />
          <div className="space-y-2.5">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Github Trending Inspector
            </h1>
            <p className="max-w-md text-sm text-muted-foreground mx-auto leading-relaxed">
              Archive of trending GitHub repositories. Enter a date, pick a day in the calendar, or
              try your luck.
            </p>
          </div>
        </header>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="mb-8 mx-auto">
            <TabsTrigger value="search">Search Archive</TabsTrigger>
            <TabsTrigger value="top">Top Today</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="flex flex-col items-center gap-4 w-full">
              <DatePickerDropdown bounds={bounds} metadata={metadata} onNavigate={navigateToDate} />
              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>Enter a date in YYYY-MM-DD format to inspect what was trending.</p>
                <p>Use the calendar to browse only available days.</p>
                <p>Or jump back to a date from your recent history below.</p>
              </div>
              <RecentDates dates={recentDates} onSelect={navigateToDate} />
            </div>
          </TabsContent>

          <TabsContent value="top">
            <Suspense fallback={<TopReposSkeleton />}>
              <TopReposBlock />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
