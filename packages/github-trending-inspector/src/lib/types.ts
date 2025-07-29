export interface Repository {
  rank: number;
  repo: string;
  desc: string;
  stars: number;
  forks: number;
  today: number;
}

export interface LanguageGroup {
  language: string;
  repos: Repository[];
}

export interface TrendingResponse {
  month: string;
  repositories: Record<string, LanguageGroup[]>;
  pagination?: {
    page: number;
    totalPages: number;
  };
}

export interface TrendingMonthResponse extends TrendingResponse {
  pagination: {
    page: number;
    totalPages: number;
  };
}

export interface MetadataResponse {
  month: string;
  availableDates: string[];
  totalDays: number;
}

export interface GitHubFile {
  name: string;
  download_url: string;
}

export interface CachedTrendingData {
  data: LanguageGroup[];
  timestamp: number;
}
