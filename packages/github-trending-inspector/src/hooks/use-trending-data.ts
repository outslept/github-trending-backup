import { useSuspenseQuery } from '@tanstack/react-query';

import type {
  MetadataFile,
  TrendingResponse,
} from '../lib/types';

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const REQUEST_TIMEOUT = 30000;
const STALE_TIME = 1000 * 60 * 60 * 12;

const getApiUrl = (endpoint: string) => {
  const baseUrl = import.meta.env.PROD ? '/api/trending' : 'http://localhost:3001/api/trending';
  return `${baseUrl}/${endpoint}`;
};

const METADATA_URL = 'https://raw.githubusercontent.com/outslept/github-trending-backup/master/data/metadata.json';

function validateDate(date: string): boolean {
  if (!DATE_FORMAT_REGEX.test(date)) return false;
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.getFullYear() === year &&
         dateObj.getMonth() === month - 1 &&
         dateObj.getDate() === day;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function useMonthData(month: string) {
  return useSuspenseQuery({
    queryKey: ['trending-month', month],
    queryFn: async () => {
      const res = await fetchWithTimeout(getApiUrl(month));
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);

      const data = await res.json() as TrendingResponse;
      return data;
    },
    staleTime: STALE_TIME,
  });
}

export function useTrendingData(date: string) {
  if (!validateDate(date)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  const month = date.slice(0, 7);
  const day = date.slice(8);

  const { data: monthData } = useMonthData(month);
  const result = monthData.repositories[day] ?? [];

  return { data: result };
}

export function useMetadata() {
  return useSuspenseQuery({
    queryKey: ['metadata'],
    queryFn: async (): Promise<MetadataFile> => {
      const res = await fetchWithTimeout(METADATA_URL);
      if (!res.ok) throw new Error('Failed to fetch metadata');

      return res.json() as Promise<MetadataFile>;
    },
    staleTime: 1000 * 60 * 60,
  });
}
