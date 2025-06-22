"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { AlertCircle, Database, type LucideIcon } from "lucide-react";
import { useTrendingData } from "../hooks/use-trending-data";
import type { LanguageGroup } from "../lib/types";
import { LanguageSection } from "./language-section";
import { LanguageSectionSkeleton } from "./language-section-skeleton";

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
  className = "border",
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
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function createSkeletonGroups(count = 3): LanguageGroup[] {
  return Array.from({ length: count }, (_, index) => ({
    language: `Language ${index + 1}`,
    repos: Array.from({ length: 10 }, (_, repoIndex) => ({
      rank: repoIndex + 1,
      repo: `skeleton/repo-${repoIndex + 1}`,
      desc: "Loading repository description...",
      stars: 0,
      forks: 0,
      today: 0,
    })),
  }));
}

export function DailyTrending({ date }: { date: string }) {
  const {
    data: groups = [],
    isLoading,
    error,
    isError,
  } = useTrendingData(date);

  const displayGroups = isLoading ? createSkeletonGroups() : groups;

  const virtualizer = useWindowVirtualizer({
    count: displayGroups.length,
    estimateSize: () => 800,
    overscan: 2,
    measureElement: (element) => {
      if (!element) return 800;
      return element.getBoundingClientRect().height;
    },
  });

  if (isError && error?.message === "DATE_NOT_FOUND") {
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

  if (isError) {
    return (
      <StateContainer
        icon={AlertCircle}
        iconColor="bg-destructive/10"
        title="Something went wrong"
        description={error?.message || "Unknown error occurred"}
        subtitle="Please try refreshing the page or selecting a different date"
      />
    );
  }

  if (!isLoading && groups.length === 0) {
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
        const group = displayGroups[virtualItem.index];
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
              {isLoading ? (
                <LanguageSectionSkeleton
                  language={group.language}
                  repoCount={10}
                />
              ) : (
                <LanguageSection group={group} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
