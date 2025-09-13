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
}

export interface MetadataFile {
  lastUpdated: string;
  years: Record<string, Record<string, string[]> | undefined>;
}

export interface GitHubFile {
  name: string;
  download_url: string;
}
