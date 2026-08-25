import { useEffect, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Input } from './ui/input';
import { cn, isValidIsoDate } from '../lib/utils';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAvailable = (d: Date) => {
    const year = String(d.getFullYear());
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return metadata?.years[year]?.[month]?.includes(day) ?? false;
  };

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
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
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

      {isOpen && (
        <div className="absolute z-50 mt-2 p-2 bg-popover ring-1 ring-border rounded-md text-popover-foreground shadow-md">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={(date) => !isAvailable(date)}
            startMonth={bounds.startMonth}
            endMonth={bounds.endMonth}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
