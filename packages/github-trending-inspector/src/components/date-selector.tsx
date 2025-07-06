import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar } from "../components/ui/calendar";
import { useMonthData } from "../hooks/use-trending-data";
import { API_BASE_URL } from "../lib/constants";

export function DateSelector({ selectedDate }: { selectedDate: Date }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const monthString = useMemo(
    () =>
      `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`,
    [currentMonth],
  );

  const { data: monthData } = useMonthData(monthString);
  const availableDates = monthData?.availableDates ?? [];

  useEffect(() => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);

    [prev, next].forEach((month) => {
      const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
      queryClient.prefetchQuery({
        queryKey: ["month-dates", monthStr],
        queryFn: async () => {
          const res = await fetch(
            `${API_BASE_URL}/trending/metadata?month=${monthStr}`,
          );
          if (!res.ok) throw new Error("Failed to fetch dates");
          return res.json();
        },
      });
    });
  }, [currentMonth, queryClient]);

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date == null) return;
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      navigate({ to: "/$date", params: { date: dateStr } });
    },
    [navigate],
  );

  const isDateAvailable = useCallback(
    (date: Date) => {
      const dayStr = String(date.getDate()).padStart(2, "0");
      const dateMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (dateMonth !== monthString) return false;
      return availableDates.includes(dayStr);
    },
    [monthString, availableDates],
  );

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDateSelect}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      disabled={(date) => !isDateAvailable(date)}
      className="w-full"
    />
  );
}
