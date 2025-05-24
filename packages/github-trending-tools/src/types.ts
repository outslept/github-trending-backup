import type { GitHubLanguage } from './utils/languages'

export interface Repository {
  readonly rank: number
  readonly title: string
  readonly url: string
  readonly description: string
  readonly stars: string
  readonly forks: string
  readonly todayStars: string
}

export interface ScrapingResult {
  readonly language: GitHubLanguage
  readonly repositories: Repository[]
  readonly success: boolean
  readonly error?: string
}

export interface ScraperConfig {
  readonly languages: GitHubLanguage[]
  readonly outputDir: string
  readonly concurrency: number
  readonly retryConfig: {
    readonly maxRetries: number
    readonly baseDelay: number
    readonly maxDelay: number
  }
  readonly archiveConfig: {
    readonly enabled: boolean
    readonly monthlyFolders: boolean
  }
}
