import { History } from 'lucide-react';
import { Button } from './ui/button';

interface RecentDatesProps {
  dates: string[];
  onSelect: (date: string) => void;
}

export function RecentDates({ dates, onSelect }: RecentDatesProps) {
  if (dates.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      <span className="inline-flex items-center gap-1 pr-1 text-xs text-muted-foreground select-none">
        <History className="size-3" />
        <span>Recent:</span>
      </span>
      {dates.map((date) => (
        <Button
          key={date}
          size="xs"
          variant="outline"
          onClick={() => onSelect(date)}
          className="font-mono text-[11px] tabular-nums text-muted-foreground hover:text-foreground"
        >
          {date}
        </Button>
      ))}
    </div>
  );
}
