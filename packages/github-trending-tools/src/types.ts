export interface Repository {
  rank: number;
  repo: string;
  desc: string;
  stars: number | null;
  forks: number | null;
  today: number | null;
}

export interface LanguageGroup {
  language: string;
  repos: Repository[];
}

export interface TrendingMonthData {
  month: string;
  days: Record<string, LanguageGroup[]>;
}

export interface MetadataFile {
  lastUpdated: string;
  years: Record<string, Record<string, string[]>>;
}
