import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import type {
  LanguageGroup,
  TrendingResponse,
  TrendingMonthResponse,
  MetadataFile,
} from '../lib/types';

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const getApiUrl = (endpoint: string) => {
  return import.meta.env.PROD
    ? `/api/trending/${endpoint}`
    : `http://localhost:3001/api/trending/${endpoint}`;
};

const API_ERRORS = {
  INVALID_DATE_FORMAT: 'Invalid date format. Expected YYYY-MM-DD',
  DATE_NOT_FOUND: 'Date not found',
  MONTH_FETCH_FAILED: 'Failed to fetch month data',
  DATA_FETCH_FAILED: 'Failed to fetch data',
  METADATA_FETCH_FAILED: 'Failed to fetch metadata',
} as const;

export function useTrendingData(date: string) {
  const queryClient = useQueryClient();
  const month = date.slice(0, 7);
  const day = date.slice(8);

  useEffect(() => {
    const monthQueryKey = ['trending-month', month];
    const existingMonthData = queryClient.getQueryData(monthQueryKey);

    if (existingMonthData == null) {
      void queryClient.prefetchQuery({
        queryKey: monthQueryKey,
        queryFn: async () => {
          const res = await fetch(getApiUrl(month));
          if (!res.ok) throw new Error(`${API_ERRORS.MONTH_FETCH_FAILED}: ${res.status}`);

          const { repositories } = await res.json() as TrendingMonthResponse;

          Object.entries(repositories).forEach(([day, dayData]) => {
            queryClient.setQueryData(['trending-data', `${month}-${day.padStart(2, '0')}`], dayData);
          });

          return repositories;
        },
        staleTime: 1000 * 60 * 60 * 12,
      });
    }
  }, [month, queryClient]);

  return useSuspenseQuery({
    queryKey: ['trending-data', date],
    queryFn: async (): Promise<LanguageGroup[]> => {
      if (!DATE_FORMAT_REGEX.test(date)) {
        throw new Error(API_ERRORS.INVALID_DATE_FORMAT);
      }

      const monthData = queryClient.getQueryData(['trending-month', month]);
      if (monthData != null && typeof monthData === 'object' && day in monthData) {
        return (monthData as Record<string, LanguageGroup[]>)[day];
      }

      const res = await fetch(getApiUrl(date));
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(API_ERRORS.DATE_NOT_FOUND);
        }
        throw new Error(`${API_ERRORS.DATA_FETCH_FAILED}: ${res.status}`);
      }

      const { repositories } = await res.json() as TrendingResponse;
      return repositories[day] ?? [];
    },
    staleTime: 1000 * 60 * 60 * 12,
  });
}

export function useMetadata() {
  return useSuspenseQuery({
    queryKey: ['metadata'],
    queryFn: async (): Promise<MetadataFile> => {
      const res = await fetch(
        'https://raw.githubusercontent.com/outslept/github-trending-backup/master/data/metadata.json',
      );
      if (!res.ok) throw new Error(API_ERRORS.METADATA_FETCH_FAILED);
      return res.json() as Promise<MetadataFile>;
    },
    staleTime: 1000 * 60 * 60,
  });
}
