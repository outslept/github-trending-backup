import { useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Input } from './ui/input';
import { Popover, PopoverContent } from './ui/popover';
import { cn, isValidIsoDate } from '../lib/utils';
import { isDateAvailableInMetadata } from '../lib/trending-metadata';
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
  const anchorRef = useRef<HTMLDivElement>(null);

  const isAvailable = (d: Date) =>
    !!metadata && isDateAvailableInMetadata(metadata, d.toLocaleDateString('sv-SE'));

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const iso = date.toLocaleDateString('sv-SE');
      setDateInput(iso);
      setIsOpen(false);
      onNavigate(iso);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const iso = dateInput.trim();
      if (isValidIsoDate(iso)) {
        setDateError(null);
        onNavigate(iso);
      } else {
        setDateError('Invalid date format. Use YYYY-MM-DD.');
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} anchor={anchorRef}>
      <div className="relative w-full" ref={anchorRef}>
        <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
        <Input
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Enter date (YYYY-MM-DD)"
          className={cn(
            'pl-10 h-11 w-full rounded-md',
            dateError && 'ring-destructive focus-visible:ring-destructive/20',
          )}
        />
      </div>

      {dateError && (
        <p className="mt-1 font-mono text-xs text-destructive text-center">{dateError}</p>
      )}

      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => !isAvailable(date)}
          startMonth={bounds.startMonth}
          endMonth={bounds.endMonth}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
