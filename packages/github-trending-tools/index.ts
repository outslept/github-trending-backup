import type { GitHubLanguage } from './src/languages'
import type { ScraperConfig } from './src/types'
import { join } from 'pathe'
import { scrapeLanguageWithRetry } from './src/scraper'
import { defaultConfig } from './src/utils/config'
import { archiveFiles, ensureDirectoryExists, getMonthlyFolder, writeMarkDown } from './src/utils/file'
import { logger } from './src/utils/logger'

function generateTableOfContents(languages: GitHubLanguage[]): string {
  let toc = '## Table of Contents\n\n'
  languages.forEach((lang) => {
    const anchor = lang.toLowerCase().replace(/\W/g, '-')
    toc += `- [${lang}](#${anchor})\n`
  })
  return `${toc}\n`
}

function getOutputPath(config: ScraperConfig, date: string): string {
  return config.archiveConfig.monthlyFolders
    ? join(getMonthlyFolder(config.outputDir), `${date}.md`)
    : join(config.outputDir, `${date}.md`)
}

export async function main(config: ScraperConfig = defaultConfig): Promise<void> {
  const date = new Date().toISOString().slice(0, 10)

  logger.start('Starting GitHub trending scraper')

  if (new Date().getDate() === 1 && config.archiveConfig.enabled) {
    try {
      await archiveFiles(config.outputDir)
      logger.success('Monthly archive completed')
    }
    catch (err: any) {
      logger.error('Monthly archive failed:', err.message)
    }
  }

  let content = `# GitHub Trending - ${date}\n\n`
  content += generateTableOfContents(config.languages)

  logger.info('Scraping repositories for all languages...')
  const results = await Promise.all(
    config.languages.map(lang =>
      scrapeLanguageWithRetry(lang, config.retryConfig.maxRetries),
    ),
  )

  content += results.join('\n')

  const outputPath = getOutputPath(config, date)
  ensureDirectoryExists(config.outputDir)
  writeMarkDown(outputPath, content)

  logger.success('Scraping completed successfully')
}

main()
