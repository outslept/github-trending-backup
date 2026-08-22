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
  month: string; // "YYYY-MM"
  days: Record<string, LanguageGroup[]>; // "DD" -> группы
}

export interface MetadataFile {
  lastUpdated: string; // "YYYY-MM-DD"
  years: Record<string, Record<string, string[]>>; // year -> month -> days
}
