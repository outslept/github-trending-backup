import { useState, type AriaAttributes } from 'react';
import type { ColumnDef, Column } from '@tanstack/react-table';
import { ArrowUpDown, ArrowUpRight, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

import { cn, formatNumber } from '../lib/utils';
import type { Repository } from '../lib/types';
import { GITHUB_BASE_URL } from '../lib/trending-metadata';

function RankCell({ rank }: { rank: number }) {
  const isTopThree = rank <= 3;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-mono text-xs tabular-nums',
        isTopThree
          ? 'size-5 rounded-md bg-foreground/8 font-semibold text-foreground ring-1 ring-inset ring-foreground/12'
          : 'w-5 text-muted-foreground/70',
      )}
    >
      {rank}
    </span>
  );
}

function RepoCell({ repo }: { repo: string }) {
  const [avatarError, setAvatarError] = useState(false);
  const [owner, name] = repo.split('/');
  const avatarUrl = owner ? `${GITHUB_BASE_URL}/${owner}.png?size=40` : null;

  return (
    <a
      href={`${GITHUB_BASE_URL}/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group/repo inline-flex max-w-full items-center gap-2.5 text-sm outline-none focus-visible:underline"
    >
      {avatarUrl && !avatarError ? (
        <img
          src={avatarUrl}
          alt=""
          width={18}
          height={18}
          loading="lazy"
          onError={() => setAvatarError(true)}
          className="size-4.5 shrink-0 rounded-full bg-muted ring-1 ring-border/60 object-cover"
        />
      ) : (
        <span className="size-4.5 shrink-0 rounded-full bg-muted ring-1 ring-border/60" />
      )}

      <span className="truncate">
        {name ? (
          <>
            <span className="text-muted-foreground transition-colors duration-150 group-hover/repo:text-foreground/80">
              {owner}
            </span>
            <span className="mx-0.5 text-muted-foreground/40">/</span>
            <span className="font-medium text-foreground group-hover/repo:underline underline-offset-4">
              {name}
            </span>
          </>
        ) : (
          <span className="font-medium text-foreground group-hover/repo:underline underline-offset-4">
            {repo}
          </span>
        )}
      </span>

      <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 -translate-y-0.5 translate-x-0.5 transition-[opacity,transform] duration-150 ease-[var(--ease-out)] group-hover/repo:opacity-100 group-hover/repo:translate-y-0 group-hover/repo:translate-x-0" />
    </a>
  );
}

function DescriptionCell({ description }: { description: string }) {
  if (!description) {
    return <span className="text-xs italic text-muted-foreground/40">No description</span>;
  }

  return (
    <p
      title={description}
      className="truncate text-sm text-muted-foreground transition-colors duration-150 group-hover/row:text-muted-foreground/90"
    >
      {description}
    </p>
  );
}

function NumberCell({ value }: { value: number | null }) {
  return (
    <span className="block text-right font-mono text-xs tabular-nums text-muted-foreground">
      {formatNumber(value)}
    </span>
  );
}

function TodayCell({ value }: { value: number | null }) {
  const isPositive = value != null && value > 0;

  if (!isPositive) {
    return (
      <span className="block text-right font-mono text-xs tabular-nums text-muted-foreground/50">
        —
      </span>
    );
  }

  return (
    <div className="flex justify-end">
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-xs font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="size-3 shrink-0" />+{formatNumber(value)}
      </span>
    </div>
  );
}

function SortableHeader({
  column,
  label,
  align = 'left',
}: {
  column: Column<Repository>;
  label: string;
  align?: 'left' | 'right';
}) {
  const sortDirection = column.getIsSorted();
  const ariaSort =
    sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none';

  const handleSort = () => {
    switch (sortDirection) {
      case false:
        column.toggleSorting(align === 'right'); // Numeric columns sort desc first!
        break;
      case 'asc':
        column.toggleSorting(true);
        break;
      default:
        column.clearSorting();
    }
  };

  const icon =
    sortDirection === 'asc' ? (
      <ChevronUp className="size-3 text-foreground" />
    ) : sortDirection === 'desc' ? (
      <ChevronDown className="size-3 text-foreground" />
    ) : (
      <ArrowUpDown className="size-3 opacity-0 transition-opacity duration-150 group-hover/sort:opacity-60" />
    );

  return (
    <button
      type="button"
      onClick={handleSort}
      aria-label={`Sort by ${label}`}
      aria-sort={ariaSort as AriaAttributes['aria-sort']}
      className={cn(
        'group/sort inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider transition-[color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97]',
        sortDirection ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        align === 'right' && 'ml-auto flex-row-reverse justify-start',
      )}
    >
      <span>{label}</span>
      <span className="flex size-3 items-center justify-center shrink-0">{icon}</span>
    </button>
  );
}

function StaticHeader({ label }: { label: string }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
  );
}

export function buildRepoColumns(): ColumnDef<Repository>[] {
  return [
    {
      accessorKey: 'rank',
      header: ({ column }) => <SortableHeader column={column} label="#" />,
      cell: ({ row }) => <RankCell rank={row.original.rank} />,
      meta: { className: 'w-14 pr-1' },
    },
    {
      accessorKey: 'repo',
      header: ({ column }) => <SortableHeader column={column} label="Repository" />,
      cell: ({ row }) => <RepoCell repo={row.original.repo} />,
      meta: { className: 'w-[240px] lg:w-[270px] xl:w-[310px] max-w-[240px] lg:max-w-[270px] xl:max-w-[310px]' },
    },
    {
      accessorKey: 'desc',
      header: () => <StaticHeader label="Description" />,
      cell: ({ row }) => <DescriptionCell description={row.original.desc} />,
      enableSorting: false,
      meta: { className: 'hidden lg:table-cell w-auto max-w-0' },
    },
    {
      accessorKey: 'stars',
      header: ({ column }) => <SortableHeader column={column} label="Stars" align="right" />,
      cell: ({ row }) => <NumberCell value={row.original.stars} />,
      meta: { className: 'w-24 text-right' },
    },
    {
      accessorKey: 'forks',
      header: ({ column }) => <SortableHeader column={column} label="Forks" align="right" />,
      cell: ({ row }) => <NumberCell value={row.original.forks} />,
      meta: { className: 'w-24 text-right hidden sm:table-cell' },
    },
    {
      accessorKey: 'today',
      header: ({ column }) => <SortableHeader column={column} label="Today" align="right" />,
      cell: ({ row }) => <TodayCell value={row.original.today} />,
      meta: { className: 'w-28 text-right' },
    },
  ];
}
