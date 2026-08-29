import { useSuspenseQuery } from '@tanstack/react-query';
import type { LanguageGroup, TrendingMonthData } from '../lib/types';
import { DATA_BASE_URL, fetchTrendingMetadata } from '../lib/trending-metadata';

async function fetchMonthData(month: string): Promise<TrendingMonthData> {
  const [year] = month.split('-');
  const url = `${DATA_BASE_URL}/${year}/${month}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load data for ${month}`);
  return res.json();
}

function useTrendingMonth(month: string) {
  return useSuspenseQuery({
    queryKey: ['trending-month', month],
    queryFn: () => fetchMonthData(month),
    staleTime: 1000 * 60 * 60 * 12,
    retry: 0,
  });
}

export function useTrendingByDate(date: string) {
  const month = date.slice(0, 7);
  const day = date.slice(8);
  const { data: monthData } = useTrendingMonth(month);
  const result: LanguageGroup[] = monthData?.days[day] ?? [];
  return { data: result };
}

export function useMetadata() {
  return useSuspenseQuery({
    queryKey: ['metadata'],
    queryFn: fetchTrendingMetadata,
    staleTime: 1000 * 60 * 60,
    retry: 0,
  });
}
