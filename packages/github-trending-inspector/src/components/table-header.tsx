import { Code } from 'lucide-react';
import { useState } from 'react';

import { languageIcons } from '../lib/language-icons';
import { cn, formatNumber, slugify } from '../lib/utils';

interface TableHeaderProps {
  language: string;
  repoCount: number;
  isFiltered?: boolean;
}

export function TableHeader({ language, repoCount, isFiltered }: TableHeaderProps) {
  const [imageError, setImageError] = useState(false);
  const languageId = slugify(language);
  const iconSrc = languageIcons[language.toLowerCase()];

  return (
    <div className="scroll-mt-16 pb-3">
      <a
        href={`#${languageId}`}
        className="inline-flex items-center gap-2 rounded-md px-2 py-1 -mx-2 transition-colors hover:bg-muted"
      >
        <span className="flex size-5 items-center justify-center">
          {iconSrc && !imageError ? (
            <img
              src={iconSrc}
              alt={language}
              width={20}
              height={20}
              onError={() => setImageError(true)}
            />
          ) : (
            <Code className="size-5 text-muted-foreground" />
          )}
        </span>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{language}</h2>
        <span
          className={cn(
            'font-mono text-xs tabular-nums',
            isFiltered ? 'text-amber-500 dark:text-amber-400' : 'text-muted-foreground/70',
          )}
        >
          {formatNumber(repoCount)}
        </span>
      </a>
    </div>
  );
}
