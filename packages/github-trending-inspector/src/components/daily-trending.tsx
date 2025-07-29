import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Database, type LucideIcon } from 'lucide-react';

import { useTrendingData } from '../hooks/use-trending-data';

import { LanguageSection } from './language-section';

interface StateContainerProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  subtitle?: string;
  className?: string;
}

function StateContainer({
  icon: Icon,
  iconColor,
  title,
  description,
  subtitle,
  className = 'border',
}: StateContainerProps) {
  return (
    <div className={`w-full bg-background ${className}`}>
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8">
        <div className={`p-3 ${iconColor}`}>
          <Icon className="size-8" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {description}
          </p>
          {Boolean(subtitle) && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function DailyTrending({ date }: { date: string }) {
  const { data: groups } = useTrendingData(date);

  const virtualizer = useWindowVirtualizer({
    count: groups.length,
    estimateSize: () => 800,
    overscan: 2,
    measureElement: (element) => {
      return element.getBoundingClientRect().height;
    },
  });

  if (groups.length === 0) {
    return (
      <StateContainer
        icon={Database}
        iconColor="bg-muted/50"
        title="No data available"
        description="No trending repositories found for this date. Try selecting a different date from the calendar."
        className="border border-dashed"
      />
    );
  }

  return (
    <div
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {virtualizer.getVirtualItems().map((virtualItem) => {
        const group = groups[virtualItem.index];
        return (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
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
