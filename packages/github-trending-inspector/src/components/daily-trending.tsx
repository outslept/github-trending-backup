"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { AlertCircle, Database, Loader2 } from "lucide-react";
import { useTrendingData } from "../hooks/use-trending-data";
import { LanguageSection } from "./language-section";

function StateContainer({
  icon: Icon,
  iconColor,
  title,
  description,
  subtitle,
  className = "border",
}: {
  icon: any;
  iconColor: string;
  title: string;
  description: string;
  subtitle?: string;
  className?: string;
}) {
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
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <div
          key={groupIndex}
          className="border border-border/60 rounded-xl bg-background shadow-sm h-[800px] flex flex-col"
        >
          <div className="px-6 py-4 border-b border-border/40 bg-muted/20 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background border border-border/60 shadow-sm">
                  <div className="size-5 bg-muted animate-pulse rounded" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-6 w-8 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>
              <div className="h-9 w-64 bg-muted animate-pulse rounded" />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6 py-4">
            <Loader2 className="size-8 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">
              Loading repositories...
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/40 bg-muted/10 flex-shrink-0">
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="flex items-center gap-1 ml-2">
                <div className="size-8 bg-muted animate-pulse rounded-lg" />
                <div className="size-8 bg-muted animate-pulse rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DailyTrending({ date }: { date: string }) {
  const { state, groups, error } = useTrendingData(date);

  const virtualizer = useWindowVirtualizer({
    count: groups.length,
    estimateSize: () => 50,
    overscan: 2,
    measureElement: (element) => {
      if (!element) return 50;
      return element.getBoundingClientRect().height;
    },
  });

  if (state === "loading") {
    return <LoadingSkeleton />;
  }

  if (state === "error") {
    return (
      <StateContainer
        icon={AlertCircle}
        iconColor="bg-destructive/10"
        title="Something went wrong"
        description={error || "Unknown error occurred"}
        subtitle="Please try refreshing the page or selecting a different date"
      />
    );
  }

  if (state === "date-unavailable" || state === "empty") {
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
        width: "100%",
        position: "relative",
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
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
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
