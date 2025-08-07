import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Database } from 'lucide-react';

import { useTrendingData } from '../hooks/use-trending-data';

import { LanguageSection } from './language-section';

const ESTIMATED_ITEM_HEIGHT = 800;

function EmptyState() {
  return (
    <div className="w-full bg-background border border-dashed">
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8">
        <div className="p-3 bg-muted/50">
          <Database className="size-8" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">No data available</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            No trending repositories found for this date. Try selecting a different date from the calendar.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DailyTrending({ date }: { date: string }) {
  const { data: groups } = useTrendingData(date);

  const virtualizer = useWindowVirtualizer({
    count: groups.length,
    estimateSize: () => ESTIMATED_ITEM_HEIGHT,
    overscan: 2,
    measureElement: (element) => {
      return element.getBoundingClientRect().height;
    },
  });

  if (groups.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className="w-full relative"
      style={{
        height: `${virtualizer.getTotalSize()}px`,
      }}
    >
      {virtualizer.getVirtualItems().map((virtualItem) => {
        const group = groups[virtualItem.index];

        return (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <div className="mb-6">
              <LanguageSection group={group} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
