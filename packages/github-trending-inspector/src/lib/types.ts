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

export interface TrendingData {
  state: "loading" | "date-unavailable" | "error" | "empty" | "success";
  groups: LanguageGroup[];
  error?: string;
}
