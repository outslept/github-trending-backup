import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Star, TrendingUp } from 'lucide-react'

import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { useMetadata, useTrendingByDate } from '../hooks/use-trending-data'
import { lastAvailableDateFromMetadata } from '../shared/metadata'
import { languageIcons } from '../lib/language-icons'
import { formatNumber } from '../lib/format'
import { GITHUB_BASE_URL } from '../lib/urls'
import type { Repository } from '../lib/types'

type RepoWithLang = Repository & { language: string }

export function TopReposSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Skeleton className="h-6 w-32 mx-auto" />
      <div className="relative flex flex-col gap-2 w-full pb-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
            <Skeleton className="h-5 w-8 shrink-0" />
            <div className="size-4 shrink-0">
              <Skeleton className="size-4" />
            </div>
            <div className="flex flex-1 flex-col gap-1.5 min-w-0">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex gap-4 shrink-0">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
        ))}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function TopReposBlock() {
  const { data: metadata } = useMetadata()
  const latestDate = useMemo(() => lastAvailableDateFromMetadata(metadata), [metadata])

  if (!latestDate) return null

  const { data: groups } = useTrendingByDate(latestDate)

  const topRepos = useMemo(() => {
    return groups
      .flatMap((g) => g.repos.map((r) => ({ ...r, language: g.language })))
      .sort((a, b) => (b.today ?? 0) - (a.today ?? 0))
      .slice(0, 4) as RepoWithLang[]
  }, [groups])

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative flex flex-col gap-2 w-full pb-12">
        {topRepos.map((repo) => {
          const iconSrc = languageIcons[repo.language.toLowerCase()]
          return (
            <a
              key={repo.repo}
              href={`${GITHUB_BASE_URL}/${repo.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="font-mono text-sm tabular-nums text-muted-foreground shrink-0">
                  #{repo.rank}
                </span>
                {iconSrc ? (
                  <img src={iconSrc} alt={repo.language} width={16} height={16} className="shrink-0" />
                ) : (
                  <div className="size-4 shrink-0" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">
                    {repo.repo}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {repo.desc || 'no description available'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3" />
                  <span className="font-mono tabular-nums">{formatNumber(repo.stars)}</span>
                </div>
                {repo.today != null && repo.today > 0 && (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="size-3" />
                    <span className="font-mono tabular-nums">+{formatNumber(repo.today)}</span>
                  </div>
                )}
              </div>
            </a>
          )
        })}

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent" />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <Button variant="outline" size="sm" asChild className="bg-background shadow-sm">
            <Link to="/$date" params={{ date: latestDate }}>
              View full day →
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
