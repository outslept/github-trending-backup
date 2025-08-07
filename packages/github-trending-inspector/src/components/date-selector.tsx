import { useNavigate } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

import { Calendar } from '../components/ui/calendar';
import { useMetadata } from '../hooks/use-trending-data';

export function DateSelector({ selectedDate }: { selectedDate: Date }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const navigate = useNavigate();
  const { data: metadata } = useMetadata();

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return;
      void navigate({
        to: '/$date',
        params: { date: date.toLocaleDateString('sv-SE') }
      });
    },
    [navigate],
  );

  const isDateAvailable = useCallback(
    (date: Date) => {
      const year = date.getFullYear().toString();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return metadata.years[year]?.[month]?.includes(day) ?? false;
    },
    [metadata],
  );

  const displaySelectedDate = isDateAvailable(selectedDate) ? selectedDate : undefined;

  return (
    <Calendar
      mode="single"
      selected={displaySelectedDate}
      onSelect={handleDateSelect}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      disabled={(date) => !isDateAvailable(date)}
      className="w-full"
      classNames={{
        today: "text-accent-foreground"
      }}
    />
  );
}
