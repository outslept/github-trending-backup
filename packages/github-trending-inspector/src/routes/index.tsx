import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Suspense, useMemo } from 'react';
import { Archive } from 'lucide-react';

import { TopReposBlock, TopReposSkeleton } from '../components/top-repos-block';
import { DatePickerDropdown } from '../components/date-picker-dropdown';
import { RecentDates } from '../components/recent-dates';

import { useMetadata } from '../hooks/use-trending-data';
import { useTrendingHistory } from '../hooks/use-trending-history';
import { formatNumber, isValidIsoDate } from '../lib/utils';
import {
  getAllAvailableDatesFromMetadata,
  getDateBoundsFromMetadata,
  lastAvailableDateFromMetadata,
} from '../lib/trending-metadata';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const { data: metadata } = useMetadata();
  const { recentDates, addDate } = useTrendingHistory();

  const bounds = useMemo(() => getDateBoundsFromMetadata(metadata), [metadata]);
  const totalDays = useMemo(
    () => getAllAvailableDatesFromMetadata(metadata).length,
    [metadata],
  );
  const latestDate = useMemo(() => lastAvailableDateFromMetadata(metadata), [metadata]);

  const navigateToDate = (iso: string) => {
    if (!isValidIsoDate(iso)) return;
    addDate(iso);
    navigate({ to: '/$date', params: { date: iso } });
  };

  return (
    <div className="relative flex min-h-svh flex-col bg-background px-4 py-8 sm:py-14">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8">
        <header className="flex flex-col items-start gap-4">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
              <Archive className="size-3.5 text-foreground/80" />
              <span className="font-mono tabular-nums text-foreground font-medium">
                {formatNumber(totalDays)}
              </span>
              <span>archived snapshots</span>
              {latestDate && (
                <>
                  <span className="text-border">•</span>
                  <span className="font-mono text-[11px] tabular-nums">up to {latestDate}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <img
              src="/daily.png"
              alt="GitHub Trending Inspector"
              className="size-12 sm:size-14 shrink-0 object-contain"
            />
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                GitHub Trending Inspector
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Time machine for open-source momentum. Jump to any date, browse the calendar, or
                roll the dice.
              </p>
            </div>
          </div>
        </header>

        <section className="flex flex-col gap-2.5">
          <DatePickerDropdown bounds={bounds} metadata={metadata} onNavigate={navigateToDate} />
          <RecentDates dates={recentDates} onSelect={navigateToDate} />
        </section>

        <Suspense fallback={<TopReposSkeleton />}>
          <TopReposBlock />
        </Suspense>

        <footer className="mt-auto flex items-center justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground/70">
          <span>Not affiliated with GitHub</span>
          <span className="font-mono">YYYY-MM-DD</span>
        </footer>
      </main>
    </div>
  );
}
