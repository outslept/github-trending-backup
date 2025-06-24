import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar } from "../components/ui/calendar";
import { Skeleton } from "../components/ui/skeleton";
import { API_BASE_URL } from "../lib/constants";

function CalendarSkeleton() {
  return (
    <div className="group/calendar p-3 w-fit opacity-50 pointer-events-none">
      <Calendar
        mode="single"
        selected={undefined}
        month={new Date()}
        disabled={() => true}
        className="w-full"
        components={{
          DayButton: () => (
            <div className="relative w-full h-full aspect-square select-none group/day">
              <Skeleton className="flex aspect-square h-auto w-full min-w-8 flex-col gap-1 leading-none font-normal rounded-md" />
            </div>
          ),
        }}
      />
    </div>
  );
}

async function fetchMonthData(month: string) {
  const res = await fetch(`${API_BASE_URL}/trending/metadata?month=${month}`);
  if (!res.ok) throw new Error("Failed to fetch dates");
  return res.json();
}

export function DateSelector({ selectedDate }: { selectedDate: Date }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [isVisible, setIsVisible] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const navigate = useNavigate();

  const monthString = useMemo(
    () =>
      `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`,
    [currentMonth],
  );

  const { data: monthData, isPending } = useQuery({
    queryKey: ["month-dates", monthString],
    queryFn: () => fetchMonthData(monthString),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  });

  const availableDates = monthData?.availableDates || [];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    setContentKey((prev) => prev + 1);
  }, [isPending, monthString]);

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return;

      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      navigate({ to: "/$date", params: { date: dateStr } });
    },
    [navigate],
  );

  const handleMonthChange = useCallback((date: Date) => {
    setCurrentMonth(date);
  }, []);

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
    <div
      className={`transform transition-all duration-300 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      <div className="relative overflow-hidden">
        {isPending ? (
          <div
            key={`skeleton-${contentKey}`}
            className="animate-in fade-in-0 duration-200"
          >
            <CalendarSkeleton />
          </div>
        ) : (
          <div
            key={`calendar-${contentKey}`}
            className="animate-in fade-in-0 zoom-in-95 duration-250 ease-out"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={handleMonthChange}
              disabled={(date) => !isDateAvailable(date)}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
