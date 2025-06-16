import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { API_BASE_URL } from "../lib/constants";

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function CalendarSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => (
          <div
            key={`weekday-${index}`}
            className="text-[10px] font-medium text-muted-foreground/60 p-2 text-center tracking-tight"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }, (_, i) => (
          <motion.div
            key={i}
            className="size-8 bg-muted/30 rounded-md"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.02,
            }}
          />
        ))}
      </div>
    </div>
  );
}

async function fetchMonthData(month: string) {
  const res = await fetch(`${API_BASE_URL}/trending/metadata?month=${month}`);
  if (!res.ok) throw new Error("Failed to fetch dates");
  return res.json();
}

export function DateSelector({ selectedDate }: { selectedDate: Date }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  const { data: monthData, isPending } = useQuery({
    queryKey: ["month-dates", currentMonth],
    queryFn: () => fetchMonthData(currentMonth),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  });

  const currentMonthNum = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonthNum + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonthNum, 1).getDay();
  const availableDates = monthData?.availableDates || [];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthNum - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthNum + 1, 1));
  };

  const isDateAvailable = (date: number) => {
    const dayStr = String(date).padStart(2, "0");
    return availableDates.includes(dayStr);
  };

  const isDateSelected = (date: number) => {
    return (
      selectedDate.getDate() === date &&
      selectedDate.getMonth() === currentMonthNum &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const handleDateClick = (date: number) => {
    if (isDateAvailable(date)) {
      const dateStr = `${currentYear}-${String(currentMonthNum + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
      navigate({ to: "/$date", params: { date: dateStr } });
    }
  };

  return (
    <motion.div
      className="px-6 py-5 border-b border-border/40 bg-background flex-shrink-0"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <motion.button
          onClick={goToPreviousMonth}
          className="size-8 flex items-center justify-center rounded-lg transition-colors duration-150 ease-out hover:bg-muted/60 text-muted-foreground hover:text-foreground"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentMonth}
            className="text-center"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              {monthNames[currentMonthNum]} {currentYear}
            </h3>
            <p className="text-xs text-muted-foreground tracking-tight mt-0.5">
              {availableDates.length} days available
            </p>
          </motion.div>
        </AnimatePresence>

        <motion.button
          onClick={goToNextMonth}
          className="size-8 flex items-center justify-center rounded-lg transition-colors duration-150 ease-out hover:bg-muted/60 text-muted-foreground hover:text-foreground"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {isPending ? (
          <CalendarSkeleton />
        ) : (
          <motion.div
            key={currentMonth}
            className="space-y-2"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, index) => (
                <div
                  key={`weekday-${index}`}
                  className="text-[10px] font-medium text-muted-foreground/60 p-2 text-center tracking-tight"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={`empty-${i}`} className="size-8" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => {
                const date = i + 1;
                const available = isDateAvailable(date);
                const selected = isDateSelected(date);

                return (
                  <motion.button
                    key={`date-${date}`}
                    onClick={() => handleDateClick(date)}
                    disabled={!available}
                    className={`
                      size-8 text-xs font-medium flex items-center justify-center rounded-lg relative
                      transition-colors duration-150 ease-out tracking-tight
                      ${
                        available
                          ? selected
                            ? "text-primary-foreground"
                            : "text-foreground hover:text-foreground"
                          : "text-muted-foreground/25 cursor-not-allowed"
                      }
                    `}
                    whileHover={available ? { scale: 1.05 } : {}}
                    whileTap={available ? { scale: 0.95 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ transitionDelay: `${i * 8}ms` }}
                  >
                    {selected && (
                      <motion.div
                        className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                        layoutId="selected-date"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                    {available && !selected && (
                      <motion.div
                        className="absolute inset-0 bg-muted/60 rounded-lg opacity-0"
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}
                    <span className="relative z-10">{date}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
