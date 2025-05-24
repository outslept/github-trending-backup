import type { ScraperConfig, ScrapingResult } from './types'
import type { GitHubLanguage } from './utils/languages'
import { fetchWithRetry } from './client'
import { parseRepositories } from './html-parser'
import { getLanguageUrlParam } from './utils/languages'
import { logger } from './utils/logger'

export class GitHubScraper {
  constructor(private readonly retryConfig: ScraperConfig['retryConfig']) {}

  async scrapeLanguage(language: GitHubLanguage): Promise<ScrapingResult> {
    try {
      const url = `https://github.com/trending/${getLanguageUrlParam(language)}`
      const html = await fetchWithRetry(url, this.retryConfig)
      const repositories = parseRepositories(html)

      // Rate limiting
      await this.delay(500 + Math.random() * 500)

      return {
        language,
        repositories: [...repositories],
        success: true,
      }
    }
    catch (error) {
      logger.error(`Failed to scrape ${language}:`, error)
      return {
        language,
        repositories: [],
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
