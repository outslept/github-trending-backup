import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Flame, GitFork, Star, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { useMetadata, useTrendingByDate } from '../hooks/use-trending-data';
import { useFluidHover } from '../hooks/use-fluid-hover';
import { GITHUB_BASE_URL, lastAvailableDateFromMetadata } from '../lib/trending-metadata';
import { languageIcons } from '../lib/language-icons';
import type { LanguageGroup, Repository } from '../lib/types';
import { cn, formatHumanDate, formatNumber } from '../lib/utils';

const TOP_LANGS_LIMIT = 4;
const TOP_REPOS_LIMIT = 6;

interface TopRepoItem {
  rank: number;
  repo: string;
  desc: string;
  stars: number | null;
  forks: number | null;
  today: number | null;
  language: string;
}

function computeTopLanguages(groups: LanguageGroup[]): string[] {
  const bestLangs: string[] = [];
  const bestTotals: number[] = [];
  let count = 0;

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const lang = group.language;
    if (lang.length === 7 && lang.toLowerCase() === 'unknown') continue;

    const repos = group.repos;
    let totalToday = 0;
    for (let j = 0; j < repos.length; j++) {
      totalToday += repos[j].today ?? 0;
    }

    if (count === TOP_LANGS_LIMIT && totalToday <= bestTotals[TOP_LANGS_LIMIT - 1]) {
      continue;
    }

    let insertIdx = count < TOP_LANGS_LIMIT ? count++ : TOP_LANGS_LIMIT - 1;
    while (insertIdx > 0 && bestTotals[insertIdx - 1] < totalToday) {
      bestLangs[insertIdx] = bestLangs[insertIdx - 1];
      bestTotals[insertIdx] = bestTotals[insertIdx - 1];
      insertIdx--;
    }
    bestLangs[insertIdx] = lang;
    bestTotals[insertIdx] = totalToday;
  }

  const result = ['all'];
  for (let i = 0; i < count; i++) {
    result.push(bestLangs[i]);
  }
  return result;
}

function computeTopRepos(groups: LanguageGroup[], selectedLang: string): TopRepoItem[] {
  const bestRepos: Repository[] = [];
  const bestLangs: string[] = [];
  const bestToday: number[] = [];
  let count = 0;

  const matchAll = selectedLang === 'all';

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    if (!matchAll && group.language !== selectedLang) continue;

    const repos = group.repos;
    const lang = group.language;

    for (let j = 0; j < repos.length; j++) {
      const r = repos[j];
      const today = r.today ?? 0;

      // Fast path: skip if top-6 is full and current repo cannot beat the 6th item
      if (count === TOP_REPOS_LIMIT && today <= bestToday[TOP_REPOS_LIMIT - 1]) {
        continue;
      }

      // Deduplicate against current top candidates (at most 6 comparisons, no Set allocation)
      const repoName = r.repo;
      let existingIdx = -1;
      for (let k = 0; k < count; k++) {
        if (bestRepos[k].repo === repoName) {
          existingIdx = k;
          break;
        }
      }

      if (existingIdx !== -1) {
        if (today <= bestToday[existingIdx]) continue;
        let idx = existingIdx;
        while (idx > 0 && bestToday[idx - 1] < today) {
          bestRepos[idx] = bestRepos[idx - 1];
          bestLangs[idx] = bestLangs[idx - 1];
          bestToday[idx] = bestToday[idx - 1];
          idx--;
        }
        bestRepos[idx] = r;
        bestLangs[idx] = lang;
        bestToday[idx] = today;
        continue;
      }

      let insertIdx = count < TOP_REPOS_LIMIT ? count++ : TOP_REPOS_LIMIT - 1;
      while (insertIdx > 0 && bestToday[insertIdx - 1] < today) {
        bestRepos[insertIdx] = bestRepos[insertIdx - 1];
        bestLangs[insertIdx] = bestLangs[insertIdx - 1];
        bestToday[insertIdx] = bestToday[insertIdx - 1];
        insertIdx--;
      }
      bestRepos[insertIdx] = r;
      bestLangs[insertIdx] = lang;
      bestToday[insertIdx] = today;
    }
  }

  const result: TopRepoItem[] = [];
  for (let i = 0; i < count; i++) {
    const r = bestRepos[i];
    result.push({
      rank: r.rank,
      repo: r.repo,
      desc: r.desc,
      stars: r.stars,
      forks: r.forks,
      today: r.today,
      language: bestLangs[i],
    });
  }
  return result;
}

export function TopReposSkeleton() {
  return (
    <div className="flex w-full flex-col rounded-xl border border-border bg-card/40 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-6 w-32 rounded-md" />
      </div>
      <div className="divide-y divide-border/50">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Skeleton className="size-4 shrink-0 rounded-sm" />
              <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopReposContent({ latestDate }: { latestDate: string }) {
  const { data: groups } = useTrendingByDate(latestDate);
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const { indicatorRef, onItemPointerEnter, onContainerPointerLeave, hideIndicator } =
    useFluidHover<HTMLAnchorElement>();

  useEffect(() => {
    hideIndicator();
  }, [selectedLang, hideIndicator]);

  const topLanguages = useMemo(() => computeTopLanguages(groups), [groups]);
  const topRepos = useMemo(() => computeTopRepos(groups, selectedLang), [groups, selectedLang]);

  return (
    <section className="flex w-full flex-col rounded-xl border border-border bg-card/30 shadow-2xs overflow-hidden">
      <div className="flex flex-col gap-2.5 border-b border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-amber-500 shrink-0" />
          <h2 className="text-xs font-medium tracking-tight text-foreground">
            Top movers on{' '}
            <span className="font-mono text-muted-foreground">{formatHumanDate(latestDate)}</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {topLanguages.map((lang) => {
            const active = selectedLang === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLang(lang)}
                className={cn(
                  'rounded-md px-2 py-0.5 text-xs font-medium transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.96]',
                  active
                    ? 'bg-foreground text-background shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {lang === 'all' ? 'All' : lang}
              </button>
            );
          })}
        </div>
      </div>

      <div
        key={selectedLang}
        onPointerLeave={onContainerPointerLeave}
        className="relative divide-y divide-border/50"
      >
        <div
          ref={indicatorRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden opacity-0 will-change-[transform,height,opacity] bg-muted/60 dark:bg-muted/35 [@media(hover:hover)_and_(pointer:fine)]:block"
        />
        {topRepos.map((repo, index) => {
          const iconSrc = languageIcons[repo.language.toLowerCase()];
          return (
            <a
              key={repo.repo}
              href={`${GITHUB_BASE_URL}/${repo.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              onPointerEnter={onItemPointerEnter}
              style={{ animationDelay: `${index * 45}ms` }}
              className="animate-stagger-in group relative z-10 flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="w-5 font-mono text-xs tabular-nums text-muted-foreground/70 shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {iconSrc ? (
                  <img
                    src={iconSrc}
                    alt={repo.language}
                    width={16}
                    height={16}
                    className="size-4 shrink-0"
                  />
                ) : (
                  <span className="size-4 shrink-0 rounded-full bg-muted" />
                )}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground truncate group-hover:underline underline-offset-4">
                      {repo.repo}
                    </span>
                    <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 -translate-y-0.5 translate-x-0.5 transition-[opacity,transform] duration-150 ease-[var(--ease-out)] group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {repo.desc || 'No description provided'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3" />
                  <span className="font-mono tabular-nums">{formatNumber(repo.stars)}</span>
                </div>
                <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                  <GitFork className="size-3" />
                  <span className="font-mono tabular-nums">{formatNumber(repo.forks)}</span>
                </div>
                {repo.today != null && repo.today > 0 && (
                  <div className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="size-3" />
                    <span className="font-mono tabular-nums">+{formatNumber(repo.today)}</span>
                  </div>
                )}
              </div>
            </a>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-border/60 bg-muted/15 px-4 py-2.5">
        <span className="text-xs text-muted-foreground">
          {groups.length} languages archived for this day
        </span>
        <Button
          variant="ghost"
          size="xs"
          render={
            <Link to="/$date" params={{ date: latestDate }}>
              Explore full day →
            </Link>
          }
          className="font-medium text-foreground hover:bg-muted"
        />
      </div>
    </section>
  );
}

export function TopReposBlock() {
  const { data: metadata } = useMetadata();
  const latestDate = useMemo(() => lastAvailableDateFromMetadata(metadata), [metadata]);

  if (!latestDate) return null;

  return <TopReposContent latestDate={latestDate} />;
}
