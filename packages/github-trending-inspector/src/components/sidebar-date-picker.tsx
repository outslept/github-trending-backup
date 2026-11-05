import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

import { useMetadata } from '../hooks/use-trending-data';
import {
  getAdjacentDatesFromMetadata,
  getDateBoundsFromMetadata,
  isDateAvailableInMetadata,
} from '../lib/trending-metadata';
import { cn, formatHumanDate } from '../lib/utils';

interface SidebarDatePickerProps {
  date: string;
  onDateChange: (iso: string) => void;
  isIcon?: boolean;
  className?: string;
}

export function SidebarDatePicker({
  date,
  onDateChange,
  isIcon = false,
  className,
}: SidebarDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => {
    const [y, m] = date.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  // Sync calendar month when URL date changes
  useEffect(() => {
    const [y, m] = date.split('-').map(Number);
    if (y && m) {
      setMonth(new Date(y, m - 1, 1));
    }
  }, [date]);

  const { data: metadata } = useMetadata();
  const selectedDate = new Date(`${date}T00:00:00`);

  const isAvailable = (d: Date) =>
    !!metadata && isDateAvailableInMetadata(metadata, d.toLocaleDateString('sv-SE'));

  const bounds = useMemo(() => getDateBoundsFromMetadata(metadata), [metadata]);
  const { prevDate, nextDate } = useMemo(
    () => getAdjacentDatesFromMetadata(metadata, date),
    [metadata, date],
  );

  if (isIcon) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger
            render={
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Change date"
                    className={cn(
                      'size-8 shrink-0 bg-background shadow-2xs aria-expanded:bg-muted',
                      className,
                    )}
                  >
                    <CalendarDays className="size-4 text-muted-foreground" />
                  </Button>
                }
              />
            }
          />
          <TooltipContent side="right">{formatHumanDate(date)}</TooltipContent>
        </Tooltip>

        <PopoverContent className="w-auto p-2" align="start" side="right">
          <Calendar
            mode="single"
            selected={selectedDate}
            month={month}
            onMonthChange={setMonth}
            disabled={(d) => !isAvailable(d)}
            startMonth={bounds.startMonth}
            endMonth={bounds.endMonth}
            onSelect={(d) => {
              if (!d || !isAvailable(d)) return;
              onDateChange(d.toLocaleDateString('sv-SE'));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div
      className={cn(
        'flex h-8 w-full items-center rounded-lg border border-border/80 bg-background p-0.5 shadow-2xs',
        className,
      )}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              disabled={!prevDate}
              onClick={() => prevDate && onDateChange(prevDate)}
              aria-label="Previous available day"
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] hover:bg-muted hover:text-foreground active:scale-[0.94] disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="size-3.5" />
            </button>
          }
        />
        <TooltipContent side="bottom">
          {prevDate ? `Previous: ${prevDate}` : 'Oldest snapshot'}
        </TooltipContent>
      </Tooltip>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="flex h-7 flex-1 min-w-0 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium text-foreground transition-[background-color,transform] duration-150 ease-[var(--ease-out)] hover:bg-muted active:scale-[0.98] aria-expanded:bg-muted"
            >
              <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate tabular-nums">{formatHumanDate(date)}</span>
            </button>
          }
        />

        <PopoverContent className="w-auto p-2" align="center">
          <Calendar
            mode="single"
            selected={selectedDate}
            month={month}
            onMonthChange={setMonth}
            disabled={(d) => !isAvailable(d)}
            startMonth={bounds.startMonth}
            endMonth={bounds.endMonth}
            onSelect={(d) => {
              if (!d || !isAvailable(d)) return;
              onDateChange(d.toLocaleDateString('sv-SE'));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              disabled={!nextDate}
              onClick={() => nextDate && onDateChange(nextDate)}
              aria-label="Next available day"
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] hover:bg-muted hover:text-foreground active:scale-[0.94] disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="size-3.5" />
            </button>
          }
        />
        <TooltipContent side="bottom">
          {nextDate ? `Next: ${nextDate}` : 'Latest snapshot'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
