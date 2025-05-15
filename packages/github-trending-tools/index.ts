import type { GitHubLanguage } from './src/languages'
import type { ScraperConfig } from './src/types'
import { writeFileSync } from 'node:fs'
import { join } from 'pathe'
import { scrapeLanguage } from './src/scraper'
import { defaultConfig } from './src/utils/config'
import { archiveFiles, ensureDir, getMonthlyDir } from './src/utils/file'
import { logger } from './src/utils/logger'

function getToc(languages: GitHubLanguage[]): string {
  return `## Table of Contents\n\n${
    languages.map(l => `- [${l}](#${l.toLowerCase().replace(/\W/g, '-')})\n`).join('')
  }\n`
}

export async function main(config: ScraperConfig = defaultConfig): Promise<void> {
  const date = new Date().toISOString().slice(0, 10)

  if (new Date().getDate() === 1 && config.archiveConfig.enabled) {
    try {
      archiveFiles(config.outputDir)
    }
    catch (err) {
      logger.error('Archive failed:', err)
    }
  }

  const content = await Promise.all(config.languages.map(l => scrapeLanguage(l)))
  const markdown = `# GitHub Trending - ${date}\n\n${getToc(config.languages)}${content.join('\n')}`

  const outPath = config.archiveConfig.monthlyFolders
    ? join(getMonthlyDir(config.outputDir), `${date}.md`)
    : join(config.outputDir, `${date}.md`)

  ensureDir(config.outputDir)
  writeFileSync(outPath, markdown)
  logger.success(`Generated: ${outPath}`)
}
