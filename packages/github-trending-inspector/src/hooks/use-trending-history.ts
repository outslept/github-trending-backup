import { useCallback, useEffect, useState } from 'react';

const HISTORY_KEY = 'trending_history';
const MAX_HISTORY = 5;

export function useTrendingHistory() {
  const [recentDates, setRecentDates] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setRecentDates(JSON.parse(raw));
    } catch {}
  }, []);

  const addDate = useCallback((iso: string) => {
    if (!iso) return;
    setRecentDates((prev) => {
      const next = [iso, ...prev.filter((d) => d !== iso)].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { recentDates, addDate };
}
