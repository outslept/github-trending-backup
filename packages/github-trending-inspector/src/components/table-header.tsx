import { Code, Hash, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import { languageIcons } from '../lib/language-icons';
import { cn, formatNumber, slugify } from '../lib/utils';

interface TableHeaderProps {
  language: string;
  repoCount: number;
  totalStarsToday: number;
  isFiltered?: boolean;
}

export function TableHeader({
  language,
  repoCount,
  totalStarsToday,
  isFiltered,
}: TableHeaderProps) {
  const [imageError, setImageError] = useState(false);
  const languageId = slugify(language);
  const iconSrc = languageIcons[language.toLowerCase()];

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 bg-muted/25 px-4 py-2.5">
      <a
        href={`#${languageId}`}
        className="group/title inline-flex items-center gap-2.5 rounded-md py-0.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-6 items-center justify-center rounded-md border border-border/60 bg-background shadow-2xs">
          {iconSrc && !imageError ? (
            <img
              src={iconSrc}
              alt={language}
              width={14}
              height={14}
              onError={() => setImageError(true)}
              className="size-3.5"
            />
          ) : (
            <Code className="size-3.5 text-muted-foreground" />
          )}
        </span>

        <h2 className="text-sm font-semibold tracking-tight text-foreground">{language}</h2>

        <span
          className={cn(
            'inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium tabular-nums',
            isFiltered
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {formatNumber(repoCount)}
        </span>

        <Hash className="size-3.5 text-muted-foreground/50 opacity-0 -translate-x-1 transition-[opacity,transform] duration-150 ease-[var(--ease-out)] group-hover/title:opacity-100 group-hover/title:translate-x-0" />
      </a>

      {totalStarsToday > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="size-3.5 text-emerald-500" />
          <span className="font-mono font-medium tabular-nums text-foreground">
            +{formatNumber(totalStarsToday)}
          </span>
          <span className="hidden sm:inline text-muted-foreground/70">stars today</span>
        </div>
      )}
    </div>
  );
}
