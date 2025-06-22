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
