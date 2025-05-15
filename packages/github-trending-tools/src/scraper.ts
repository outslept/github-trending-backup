import type { GitHubLanguage } from './languages'
import type { Repository } from './types'
import { load } from 'cheerio'
import { ofetch } from 'ofetch'
import { getLanguageUrlParam } from './languages'
import { fetchOptions } from './utils/config'
import { logger } from './utils/logger'

export async function scrapeLanguage(language: GitHubLanguage, maxRetries = 3): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 2000 * 1.5 ** attempt + Math.random() * 1000))
        logger.info(`Retry ${attempt} for ${language}`)
      }

      const response = await ofetch(`https://github.com/trending/${getLanguageUrlParam(language)}`, {
        ...fetchOptions,
        responseType: 'text',
      })

      const $ = load(response)
      const repos: Repository[] = []

      $('.Box-row').each((i, elem) => {
        const repoURL = $(elem).find('h2 a').attr('href') ?? ''

        let stars = '0'
        let forks = '0'
        $(elem).find('a.Link--muted.d-inline-block.mr-3').each((_, sel) => {
          const label = $(sel).find('svg').attr('aria-label')
          if (label === 'star')
            stars = $(sel).text().trim()
          else if (label === 'fork')
            forks = $(sel).text().trim()
        })

        repos.push({
          rank: i + 1,
          title: repoURL.substring(1).replace(/\s/g, ''),
          url: `https://github.com${repoURL}`,
          description: $(elem).find('p.col-9').text().trim() || 'No description',
          stars: stars || '0',
          forks: forks || '0',
          todayStars: $(elem).find('span.d-inline-block.float-sm-right').text().trim() || 'N/A',
        })
      })

      await new Promise(r => setTimeout(r, 500 + Math.random() * 500))

      return repos.length
        ? `## ${language}\n\n| # | Repository | Description | Stars | Forks | Today |\n| --- | --- | --- | --- | --- | --- |\n${
          repos.map(r => `| ${r.rank} | [${r.title}](${r.url}) | ${r.description.length > 100 ? `${r.description.slice(0, 97)}...` : r.description} | ${r.stars} | ${r.forks} | ${r.todayStars} |\n`).join('')
        }`
        : `## ${language}\n\nNo trending repositories found.\n`
    }
    catch (error) {
      if (attempt === maxRetries) {
        logger.error(`Failed to scrape ${language}: ${error}`)
        return `## ${language}\n\nFailed to scrape.\n`
      }
      logger.warn(`Retry ${attempt + 1}/${maxRetries} for ${language}: ${error}`)
    }
  }
  return `## ${language}\n\nFailed to scrape.\n`
}
