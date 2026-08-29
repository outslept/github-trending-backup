import type { AriaAttributes } from 'react';
import type { ColumnDef, Column } from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

import { cn, formatNumber } from '../lib/utils';
import type { Repository } from '../lib/types';
import { GITHUB_BASE_URL } from '../lib/trending-metadata';

function RankCell({ rank }: { rank: number }) {
  return (
    <span className="font-mono text-sm tabular-nums text-muted-foreground">
      #{formatNumber(rank)}
    </span>
  );
}

function RepoCell({ repo }: { repo: string }) {
  return (
    <a
      href={`${GITHUB_BASE_URL}/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
    >
      {repo}
      <ExternalLink className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}

function DescriptionCell({ description }: { description: string }) {
  return (
    <p className="hidden max-w-md text-sm text-muted-foreground lg:block">
      {description || 'no description available'}
    </p>
  );
}

function NumberCell({ value }: { value: number | null }) {
  return (
    <span className="block text-right font-mono text-sm tabular-nums text-muted-foreground">
      {formatNumber(value)}
    </span>
  );
}

function TodayCell({ value }: { value: number | null }) {
  const isPositive = value != null && value > 0;

  return (
    <span
      className={cn(
        'block text-right font-mono text-sm tabular-nums',
        isPositive ? 'font-medium text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
      )}
    >
      {isPositive ? `+${formatNumber(value)}` : formatNumber(value)}
    </span>
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
        column.toggleSorting(false);
        break;
      case 'asc':
        column.toggleSorting(true);
        break;
      default:
        column.clearSorting();
    }
  };

  return (
    <button
      type="button"
      onClick={handleSort}
      aria-label={`sort by ${label}`}
      aria-sort={ariaSort as AriaAttributes['aria-sort']}
      className={cn('group flex items-center gap-1', align === 'right' && 'flex-row-reverse')}
    >
      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
        {label}
      </span>
      <span className="flex items-center justify-center size-3">
        {sortDirection === 'asc' && <ChevronUp className="size-3 text-primary" />}
        {sortDirection === 'desc' && <ChevronDown className="size-3 text-primary" />}
      </span>
    </button>
  );
}

function StaticHeader({ label }: { label: string }) {
  return (
    <span className="hidden text-xs font-medium text-muted-foreground lg:inline">{label}</span>
  );
}

export function buildRepoColumns(): ColumnDef<Repository>[] {
  return [
    {
      accessorKey: 'rank',
      header: ({ column }) => <SortableHeader column={column} label="rank" />,
      cell: ({ row }) => <RankCell rank={row.original.rank} />,
    },
    {
      accessorKey: 'repo',
      header: ({ column }) => <SortableHeader column={column} label="repository" />,
      cell: ({ row }) => <RepoCell repo={row.original.repo} />,
    },
    {
      accessorKey: 'desc',
      header: () => <StaticHeader label="description" />,
      cell: ({ row }) => <DescriptionCell description={row.original.desc} />,
      enableSorting: false,
    },
    {
      accessorKey: 'stars',
      header: ({ column }) => <SortableHeader column={column} label="stars" align="right" />,
      cell: ({ row }) => <NumberCell value={row.original.stars} />,
    },
    {
      accessorKey: 'forks',
      header: ({ column }) => <SortableHeader column={column} label="forks" align="right" />,
      cell: ({ row }) => <NumberCell value={row.original.forks} />,
    },
    {
      accessorKey: 'today',
      header: ({ column }) => <SortableHeader column={column} label="today" align="right" />,
      cell: ({ row }) => <TodayCell value={row.original.today} />,
    },
  ];
}
