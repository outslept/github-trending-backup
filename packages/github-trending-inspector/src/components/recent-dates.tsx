import { Button } from './ui/button';

interface RecentDatesProps {
  dates: string[];
  onSelect: (date: string) => void;
}

export function RecentDates({ dates, onSelect }: RecentDatesProps) {
  if (dates.length === 0) return null;

  return (
    <div className="flex flex-col w-full items-center gap-2 pt-4 mt-2 border-t border-border/60">
      <div className="flex flex-wrap justify-center gap-1.5">
        {dates.map((date) => (
          <Button key={date} size="xs" variant="secondary" onClick={() => onSelect(date)}>
            {date}
          </Button>
        ))}
      </div>
    </div>
  );
}
