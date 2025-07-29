import { useSuspenseQuery } from '@tanstack/react-query';

import { API_BASE_URL } from '../lib/constants';
import type { LanguageGroup } from '../lib/types';

const CACHE_KEY = 'trending-data';
const CACHE_DURATION = 1000 * 60 * 60 * 24;

function getCachedTrendingData(date: string): LanguageGroup[] | null {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}-${date}`);
    if (cached == null) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }

    localStorage.removeItem(`${CACHE_KEY}-${date}`);
  } catch {
    /** ignore */
  }
  return null;
}

function setCachedTrendingData(date: string, data: LanguageGroup[]): void {
  try {
    localStorage.setItem(
      `${CACHE_KEY}-${date}`,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    );
  } catch {
    /** ignore */
  }
}

export function useTrendingData(date: string) {
  return useSuspenseQuery({
    queryKey: ['trending-data', date],
    queryFn: async (): Promise<LanguageGroup[]> => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error('Invalid date format. Expected YYYY-MM-DD');
      }

      const cachedData = getCachedTrendingData(date);
      if (cachedData != null) {
        return cachedData;
      }

      const res = await fetch(`${API_BASE_URL}/trending/${date}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('DATE_NOT_FOUND');
        }
        throw new Error(`Failed to fetch data: ${res.status}`);
      }

      const data = await res.json();
      const repositories = data?.repositories ?? {};
      const day = date.slice(8);
      const result = repositories[day] ?? [];

      setCachedTrendingData(date, result);

      return result;
    },
    staleTime: 1000 * 60 * 60 * 12,
  });
}

export function useMonthData(month: string) {
  return useSuspenseQuery({
    queryKey: ['month-dates', month],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE_URL}/trending/metadata?month=${month}`,
      );
      if (!res.ok) throw new Error('Failed to fetch dates');
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
  });
}
