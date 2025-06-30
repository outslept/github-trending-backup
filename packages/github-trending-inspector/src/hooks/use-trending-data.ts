import { useSuspenseQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../lib/constants";
import type { LanguageGroup } from "../lib/types";

export function useTrendingData(date: string) {
  return useSuspenseQuery({
    queryKey: ["trending-data", date],
    queryFn: async (): Promise<LanguageGroup[]> => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error("Invalid date format. Expected YYYY-MM-DD");
      }

      const res = await fetch(`${API_BASE_URL}/trending/${date}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("DATE_NOT_FOUND");
        }
        throw new Error(`Failed to fetch data: ${res.status}`);
      }

      const data = await res.json();
      const repositories = data?.repositories || {};
      const day = date.slice(8);
      return repositories[day] || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useMonthData(month: string) {
  return useSuspenseQuery({
    queryKey: ["month-dates", month],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE_URL}/trending/metadata?month=${month}`,
      );
      if (!res.ok) throw new Error("Failed to fetch dates");
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
  });
}
