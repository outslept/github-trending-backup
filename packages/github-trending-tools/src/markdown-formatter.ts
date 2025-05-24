import type { Repository, ScrapingResult } from './types'
import type { GitHubLanguage } from './utils/languages'

export class MarkdownFormatter {
  formatResults(results: readonly ScrapingResult[], date: string): string {
    const toc = this.generateToc(results.map(r => r.language))
    const sections = results.map(result => this.formatSection(result)).join('\n')

    return `# GitHub Trending - ${date}\n\n${toc}${sections}`
  }

  private generateToc(languages: readonly GitHubLanguage[]): string {
    const links = languages
      .map(lang => `- [${lang}](#${this.createAnchor(lang)})`)
      .join('\n')

    return `## Table of Contents\n\n${links}\n\n`
  }

  private formatSection(result: ScrapingResult): string {
    if (!result.success) {
      return `## ${result.language}\n\nFailed to scrape: ${result.error || 'Unknown error'}\n`
    }

    if (result.repositories.length === 0) {
      return `## ${result.language}\n\nNo trending repositories found.\n`
    }

    const header = `## ${result.language}\n\n`
    const tableHeader = '| # | Repository | Description | Stars | Forks | Today |\n| --- | --- | --- | --- | --- | --- |\n'
    const rows = result.repositories
      .map(repo => this.formatTableRow(repo))
      .join('')

    return `${header}${tableHeader}${rows}\n`
  }

  private formatTableRow(repo: Repository): string {
    const description = repo.description.length > 100
      ? `${repo.description.slice(0, 97)}...`
      : repo.description

    return `| ${repo.rank} | [${repo.title}](${repo.url}) | ${description} | ${repo.stars} | ${repo.forks} | ${repo.todayStars} |\n`
  }

  private createAnchor(text: string): string {
    return text.toLowerCase().replace(/\W/g, '-')
  }
}
