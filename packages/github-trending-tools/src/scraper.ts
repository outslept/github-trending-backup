import { load } from 'cheerio'
import { ofetch } from 'ofetch'
import type { Repository } from './types'
import { fetchOptions } from './utils/config'
import { logger } from './utils/logger'

export async function scrapeLanguageWithRetry(language: string, maxRetries = 3): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = 2000 * 1.5 ** attempt + Math.floor(Math.random() * 1000)
        await new Promise(r => setTimeout(r, delay))
        logger.info(`Retry attempt ${attempt} for ${language}`)
      }

      const result = await scrapeLanguage(language)
      logger.success(`Successfully scraped ${language}`)

      await new Promise(r => setTimeout(r, 500 + Math.floor(Math.random() * 500)))

      return result
    }
    catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        logger.warn(`Retrying ${language} (${attempt + 1}/${maxRetries}): ${err.message}`)
      }
      else {
        logger.error(`Failed to scrape ${language} after ${maxRetries + 1} attempts: ${err.message}`)
        return `## ${language}\n\nFailed to scrape this language after multiple attempts.\n`
      }
    }
  }
  return `## ${language}\n\nFailed to scrape this language.\n`
}

export async function scrapeLanguage(language: string): Promise<string> {
  let result = `## ${language}\n\n`
  let urlParam: string

  switch (language) {
    case 'C#':
      urlParam = 'c%23'
      break
    case 'C++':
      urlParam = 'c%2B%2B'
      break
    case 'F#':
      urlParam = 'f%23'
      break
    default:
      urlParam = language.toLowerCase()
  }

  try {
    const response = await ofetch(`https://github.com/trending/${urlParam}`, {
      ...fetchOptions,
      responseType: 'text',
    })

    const $ = load(response)
    let repoCount = 0
    const repos: Repository[] = []

    $('.Box-row').each((i, elem) => {
      try {
        const description = $(elem).find('p.col-9').text().trim()
        const repoURL = $(elem).find('h2 a').attr('href') || ''
        const title = repoURL.substring(1)
        const url = `https://github.com${repoURL}`

        let stars = '0'
        let forks = '0'
        let todayStars = ''

        $(elem).find('a.Link--muted.d-inline-block.mr-3').each((i, contentSelection) => {
          const iconLabel = $(contentSelection).find('svg').attr('aria-label')
          if (iconLabel === 'star') {
            stars = $(contentSelection).text().trim()
          }
          else if (iconLabel === 'fork') {
            forks = $(contentSelection).text().trim()
          }
        })

        const todayStarsText = $(elem).find('span.d-inline-block.float-sm-right').text().trim()
        if (todayStarsText) {
          todayStars = todayStarsText.replace(/\s+/g, ' ')
        }

        repos.push({
          rank: i + 1,
          title: title.replace(/\s/g, ''),
          url,
          description: description.trim() || 'No description provided',
          stars: stars.trim() || '0',
          forks: forks.trim() || 'No forks',
          todayStars: todayStars || 'N/A',
        })

        repoCount++
      }
      catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error))
        logger.error(`Error processing repo ${i} for ${language}:`, err)
      }
    })

    if (repoCount === 0) {
      result += `No trending repositories found for ${language} today.\n`
    }
    else {
      result += `| # | Repository | Description | Stars | Forks | Today |\n`
      result += `| --- | --- | --- | --- | --- | --- |\n`

      for (const repo of repos) {
        const shortDescription = repo.description.length > 100
          ? `${repo.description.substring(0, 97)}...`
          : repo.description

        result += `| ${repo.rank} | [${repo.title}](${repo.url}) | ${shortDescription} | ${repo.stars} | ${repo.forks} | ${repo.todayStars} |\n`
      }
    }

    return result
  }
  catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error(`Error scraping ${language}:`, err.message)
    return `## ${language}\n\nError: Could not retrieve data for this language. ${err.message}\n`
  }
}
