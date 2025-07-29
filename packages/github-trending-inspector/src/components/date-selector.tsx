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
      if (date == null) return;
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      void navigate({ to: '/$date', params: { date: dateStr } });
    },
    [navigate],
  );

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);

  const isDateAvailable = useCallback(
    (date: Date) => {
      const year = date.getFullYear().toString();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return metadata.years[year]?.[month]?.includes(day) ?? false;
    },
    [metadata],
  );

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDateSelect}
      month={currentMonth}
      onMonthChange={handleMonthChange}
      disabled={(date) => !isDateAvailable(date)}
      className="w-full"
    />
  );
}
