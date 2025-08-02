import { createFileRoute, redirect } from '@tanstack/react-router';
import { Suspense } from 'react';

import { AppSidebar } from '../components/app-sidebar';
import { DailyTrending } from '../components/daily-trending';
import { TrendingSkeleton } from '../components/skeletons';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
import type { MetadataFile } from '../lib/types';

async function getMetadata(): Promise<MetadataFile> {
  const res = await fetch('https://raw.githubusercontent.com/outslept/github-trending-backup/master/data/metadata.json');
  if (!res.ok) throw new Error('Failed to fetch metadata');
  return res.json() as Promise<MetadataFile>;
}

async function getLastAvailableDate(): Promise<string> {
  try {
    const { years } = await getMetadata();
    for (const year of Object.keys(years).sort().reverse()) {
      const yearData = years[year];
      if (!yearData) continue;

      for (const month of Object.keys(yearData).sort().reverse()) {
        const days = yearData[month];
        if (days.length) {
          return `${year}-${month}-${days.sort().reverse()[0]}`;
        }
      }
    }
  } catch { /* ignore */ }
  return new Date().toLocaleDateString('sv-SE'); // yyyy-mm-dd
}

async function isDateAvailable(date: string): Promise<boolean> {
  try {
    const { years } = await getMetadata();
    const [year, month, day] = date.split('-');
    return years[year]?.[month]?.includes(day) ?? false;
  } catch {
    return false;
  }
}

export const Route = createFileRoute('/$date')({
  validateSearch: (search) => search,
  beforeLoad: async ({ params }) => {
    const { date } = params;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !(await isDateAvailable(date))) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/$date', params: { date: await getLastAvailableDate() } });
    }
  },
  component: DatePage,
});

function DatePage() {
  const { date } = Route.useParams();

  return (
    <SidebarProvider defaultOpen={true} style={{ '--sidebar-width': '18rem', '--sidebar-width-mobile': '18rem' } as React.CSSProperties}>
      <AppSidebar selectedDate={new Date(date)} />
      <SidebarInset>
        <div className="w-[85%] max-w-none mx-auto py-6">
          <Suspense fallback={<TrendingSkeleton />}>
            <DailyTrending date={date} />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
