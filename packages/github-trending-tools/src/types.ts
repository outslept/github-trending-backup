export interface Repository {
  rank: number
  title: string
  url: string
  description: string
  stars: string
  forks: string
  todayStars: string
}

export interface ScraperConfig {
  languages: string[]
  outputDir: string
  archiveConfig: {
    enabled: boolean
    monthlyFolders: boolean
  }
  retryConfig: {
    maxRetries: number
    baseDelay: number
    maxDelay: number
  }
}
