import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../lib/constants";
import type { TrendingData } from "../lib/types";

export function useTrendingData(date: string): TrendingData {
  const query = useQuery({
    queryKey: ["trending-data", date],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/trending/${date}`);
      if (!res.ok) {
        throw new Error(
          res.status === 404
            ? "DATE_NOT_FOUND"
            : `Failed to fetch data: ${res.status}`,
        );
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  if (query.error) {
    return {
      state:
        query.error.message === "DATE_NOT_FOUND" ? "date-unavailable" : "error",
      groups: [],
      error: query.error.message,
    };
  }

  if (query.isLoading) {
    return { state: "loading", groups: [] };
  }

  const repositories =
    query.data?.repositories?.[Object.keys(query.data?.repositories || {})[0]];

  return {
    state: repositories?.length > 0 ? "success" : "empty",
    groups: repositories || [],
  };
}
