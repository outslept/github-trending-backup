import { useState } from 'react';
import { ArrowRight, CalendarDays, CornerDownLeft, Dices, Sparkles } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn, isValidIsoDate } from '../lib/utils';
import {
  getRandomDateFromMetadata,
  isDateAvailableInMetadata,
  lastAvailableDateFromMetadata,
} from '../lib/trending-metadata';
import type { MetadataFile } from '../lib/types';

interface DatePickerDropdownProps {
  bounds: { startMonth?: Date; endMonth?: Date };
  metadata?: MetadataFile;
  onNavigate: (iso: string) => void;
}

export function DatePickerDropdown({ bounds, metadata, onNavigate }: DatePickerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateInput, setDateInput] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const latestDate = lastAvailableDateFromMetadata(metadata);

  const isAvailable = (d: Date) =>
    !!metadata && isDateAvailableInMetadata(metadata, d.toLocaleDateString('sv-SE'));

  const submitIso = (raw: string) => {
    const iso = raw.trim();
    if (!isValidIsoDate(iso)) {
      setDateError('Use YYYY-MM-DD format (e.g. 2025-02-14)');
      return;
    }
    if (metadata && !isDateAvailableInMetadata(metadata, iso)) {
      setDateError(`No archive snapshot available for ${iso}`);
      return;
    }
    setDateError(null);
    onNavigate(iso);
  };

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const iso = date.toLocaleDateString('sv-SE');
      setDateInput(iso);
      setDateError(null);
      setIsOpen(false);
      onNavigate(iso);
    }
  };

  const handleRandomDate = () => {
    const randomIso = getRandomDateFromMetadata(metadata);
    if (randomIso) {
      setDateInput(randomIso);
      setDateError(null);
      onNavigate(randomIso);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitIso(dateInput);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-xl border bg-background p-1.5 shadow-xs transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out)] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30',
          dateError ? 'border-destructive focus-within:border-destructive' : 'border-border',
        )}
      >
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <Tooltip>
            <TooltipTrigger
              render={
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open calendar"
                      className="size-8 shrink-0 text-muted-foreground hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground"
                    >
                      <CalendarDays className="size-4" />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent side="top">Browse calendar</TooltipContent>
          </Tooltip>

          <PopoverContent className="w-auto p-2" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              disabled={(date) => !isAvailable(date)}
              startMonth={bounds.startMonth}
              endMonth={bounds.endMonth}
              defaultMonth={bounds.endMonth}
            />
          </PopoverContent>
        </Popover>

        <input
          type="text"
          inputMode="numeric"
          value={dateInput}
          onChange={(e) => {
            setDateInput(e.target.value);
            if (dateError) setDateError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={latestDate ? `Jump to date (${latestDate})...` : 'YYYY-MM-DD'}
          className="h-8 flex-1 min-w-0 bg-transparent px-1.5 font-mono text-sm text-foreground placeholder:font-sans placeholder:text-muted-foreground outline-none"
        />

        {dateInput.trim().length > 0 ? (
          <Button
            size="sm"
            onClick={() => submitIso(dateInput)}
            className="h-8 gap-1.5 px-3 font-medium"
          >
            <span>Inspect</span>
            <CornerDownLeft className="size-3.5 opacity-80" />
          </Button>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRandomDate}
                    className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Dices className="size-3.5" />
                    <span className="hidden sm:inline">Surprise me</span>
                  </Button>
                }
              />
              <TooltipContent side="top">Jump to a random archived day</TooltipContent>
            </Tooltip>

            {latestDate && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onNavigate(latestDate)}
                className="h-8 gap-1.5 px-3 text-xs font-medium"
              >
                <Sparkles className="size-3" />
                <span>Latest</span>
                <ArrowRight className="size-3 opacity-70" />
              </Button>
            )}
          </div>
        )}
      </div>

      {dateError && (
        <p className="px-2 font-mono text-xs text-destructive animate-stagger-in">{dateError}</p>
      )}
    </div>
  );
}
