import type { ScraperConfig, ScrapingResult } from './types'
import { join } from 'node:path'
import { MarkdownFormatter } from './markdown-formatter'
import { GitHubScraper } from './scraper'
import { FileSystem } from './utils/fs'
import { logger } from './utils/logger'

export class TrendingService {
  private readonly scraper: GitHubScraper
  private readonly formatter: MarkdownFormatter
  private readonly fileSystem: FileSystem

  constructor(private readonly config: ScraperConfig) {
    this.scraper = new GitHubScraper(config.retryConfig)
    this.formatter = new MarkdownFormatter()
    this.fileSystem = new FileSystem()
  }

  async generateReport(): Promise<void> {
    const date = new Date().toISOString().slice(0, 10)

    this.handleArchiving()

    logger.info(`Scraping ${this.config.languages.length} languages with concurrency ${this.config.concurrency}`)

    const results = await this.scrapeLanguagesConcurrently()
    const markdown = this.formatter.formatResults(results, date)

    const outputPath = this.getOutputPath(date)
    this.fileSystem.ensureDirectory(this.config.outputDir)
    this.fileSystem.writeFile(outputPath, markdown)

    this.logResults(results)
  }

  private handleArchiving(): void {
    if (new Date().getDate() === 1 && this.config.archiveConfig.enabled) {
      try {
        this.fileSystem.archiveCurrentMonthFiles(this.config.outputDir)
      }
      catch (error) {
        logger.error('Archive failed:', error)
      }
    }
  }

  private async scrapeLanguagesConcurrently(): Promise<readonly ScrapingResult[]> {
    const results: ScrapingResult[] = []

    for (let i = 0; i < this.config.languages.length; i += this.config.concurrency) {
      const batch = this.config.languages.slice(i, i + this.config.concurrency)
      const batchResults = await Promise.all(
        batch.map(language => this.scraper.scrapeLanguage(language)),
      )
      results.push(...batchResults)
    }

    return results
  }

  private getOutputPath(date: string): string {
    return this.config.archiveConfig.monthlyFolders
      ? join(this.fileSystem.getMonthlyDirectory(this.config.outputDir), `${date}.md`)
      : join(this.config.outputDir, `${date}.md`)
  }

  private logResults(results: readonly ScrapingResult[]): void {
    const successful = results.filter(r => r.success).length
    const failed = results.length - successful

    logger.success(`Completed: ${successful} successful, ${failed} failed`)

    if (failed > 0) {
      const failedLanguages = results
        .filter(r => !r.success)
        .map(r => r.language)
        .join(', ')
      logger.warn(`Failed languages: ${failedLanguages}`)
    }
  }
}
