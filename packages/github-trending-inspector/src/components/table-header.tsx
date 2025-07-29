import { Search, X } from 'lucide-react';

import { languageIcons } from '../lib/constants';
import { formatNumber } from '../lib/format';

import { Input } from './ui/input';

interface TableHeaderProps {
  language: string;
  repoCount: number;
  globalFilter: string;
  onFilterChange: (value: string) => void;
}

export function TableHeader({
  language,
  repoCount,
  globalFilter,
  onFilterChange,
}: TableHeaderProps) {
  const languageId = language.toLowerCase().replace(/[^a-z0-9]/g, '');

  return (
    <div
      id={languageId}
      className="px-6 py-4 border-b border-border/40 bg-muted/20"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-background border border-border/60 shadow-sm">
            <img
              src={languageIcons[language.toLowerCase()]}
              alt={language}
              width={20}
              height={20}
              className="size-5"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">
                {language}
              </h2>
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md">
                <span className="text-xs font-medium tracking-tight">
                  {formatNumber(repoCount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={globalFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="h-9 w-full sm:w-64 pl-10 pr-9 text-sm border-border/60 transition-colors bg-background focus:border-primary/60"
          />
          {globalFilter && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-all duration-200"
              onClick={() => onFilterChange('')}
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
