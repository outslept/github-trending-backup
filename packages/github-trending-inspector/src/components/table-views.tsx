import { useEffect, useState } from 'react';
import { flexRender, type Row, type Table } from '@tanstack/react-table';
import { ArrowUpRight, GitFork, Search, Star, TrendingUp } from 'lucide-react';

import type { Repository } from '../lib/types';
import { cn, formatNumber } from '../lib/utils';
import { useFluidHover } from '../hooks/use-fluid-hover';

import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { GITHUB_BASE_URL } from '../lib/trending-metadata';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}

function MobileCard({ repo }: { repo: Repository }) {
  const [avatarError, setAvatarError] = useState(false);
  const [owner, name] = repo.repo.split('/');
  const avatarUrl = owner ? `${GITHUB_BASE_URL}/${owner}.png?size=40` : null;
  const hasToday = repo.today != null && repo.today > 0;

  return (
    <a
      href={`${GITHUB_BASE_URL}/${repo.repo}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block px-4 py-3.5 transition-colors duration-150 ease-[var(--ease-out)] active:bg-muted/60"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              'inline-flex shrink-0 items-center justify-center font-mono text-xs tabular-nums',
              repo.rank <= 3
                ? 'size-5 rounded-md bg-foreground/8 font-semibold text-foreground ring-1 ring-inset ring-foreground/12'
                : 'text-muted-foreground/70',
            )}
          >
            {repo.rank <= 3 ? repo.rank : `#${repo.rank}`}
          </span>

          {avatarUrl && !avatarError && (
            <img
              src={avatarUrl}
              alt=""
              width={16}
              height={16}
              loading="lazy"
              onError={() => setAvatarError(true)}
              className="size-4 shrink-0 rounded-full bg-muted ring-1 ring-border/60"
            />
          )}

          <span className="truncate text-sm">
            {name ? (
              <>
                <span className="text-muted-foreground">{owner}</span>
                <span className="mx-0.5 text-muted-foreground/40">/</span>
                <span className="font-medium text-foreground group-hover:underline underline-offset-4">
                  {name}
                </span>
              </>
            ) : (
              <span className="font-medium text-foreground">{repo.repo}</span>
            )}
          </span>
        </div>

        <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/60" />
      </div>

      {repo.desc && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {repo.desc}
        </p>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
            <Star className="size-3" />
            {formatNumber(repo.stars)}
          </span>
          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
            <GitFork className="size-3" />
            {formatNumber(repo.forks)}
          </span>
        </div>

        {hasToday && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-xs font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="size-3" />+{formatNumber(repo.today)}
          </span>
        )}
      </div>
    </a>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2.5 py-12 text-muted-foreground">
      <div className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-muted/30">
        <Search className="size-4" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">No repositories match filter</p>
        <p className="text-xs text-muted-foreground">Try adjusting your search query</p>
      </div>
    </div>
  );
}

interface MobileViewProps {
  rows: Row<Repository>[];
}

export function MobileView({ rows }: MobileViewProps) {
  if (rows.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="divide-y divide-border/50">
      {rows.map((row) => (
        <MobileCard key={row.id} repo={row.original} />
      ))}
    </div>
  );
}

interface DesktopViewProps {
  table: Table<Repository>;
}

export function DesktopView({ table }: DesktopViewProps) {
  const rows = table.getRowModel().rows;
  const headerGroups = table.getHeaderGroups();
  const visibleColumnCount = table.getVisibleFlatColumns().length;

  const { indicatorRef, onItemPointerEnter, onContainerPointerLeave, hideIndicator } =
    useFluidHover<HTMLTableRowElement>();

  // Reset indicator if rows change (pagination/sorting/filtering)
  useEffect(() => {
    hideIndicator();
  }, [rows, hideIndicator]);

  return (
    <TableComponent
        className="table-fixed"
        overlay={
          <div
            ref={indicatorRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden opacity-0 will-change-[transform,height,opacity] bg-muted/60 dark:bg-muted/35 [@media(hover:hover)_and_(pointer:fine)]:block"
          />
        }
      >
      <TableHeader className="bg-muted/15">
        {headerGroups.map((headerGroup) => (
          <TableRow key={headerGroup.id} className="border-border/60">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className={cn(header.column.columnDef.meta?.className)}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody onPointerLeave={onContainerPointerLeave}>
        {rows.length > 0 ? (
          rows.map((row) => (
            <TableRow
              key={row.id}
              onPointerEnter={onItemPointerEnter}
              className="group/row border-border/40"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.className)}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={visibleColumnCount} className="h-32 text-center">
              <EmptyState />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </TableComponent>
  );
}
