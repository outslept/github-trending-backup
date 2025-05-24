import type { Repository } from './types'
import { parse } from 'node-html-parser'

export function parseRepositories(html: string): readonly Repository[] {
  const root = parse(html)
  const repositories: Repository[] = []

  const rows = root.querySelectorAll('.Box-row')

  rows.forEach((row, index) => {
    const linkElement = row.querySelector('h2 a')
    const repoURL = linkElement?.getAttribute('href') ?? ''

    if (!repoURL)
      return

    let stars = '0'
    let forks = '0'

    row.querySelectorAll('a.Link--muted.d-inline-block.mr-3').forEach((link) => {
      const svg = link.querySelector('svg')
      const label = svg?.getAttribute('aria-label')
      const value = link.text.trim()

      if (label === 'star')
        stars = value
      else if (label === 'fork')
        forks = value
    })

    const descElement = row.querySelector('p.col-9')
    const todayElement = row.querySelector('span.d-inline-block.float-sm-right')

    repositories.push({
      rank: index + 1,
      title: repoURL.substring(1).replace(/\s/g, ''),
      url: `https://github.com${repoURL}`,
      description: descElement?.text?.trim() || 'No description',
      stars,
      forks,
      todayStars: todayElement?.text?.trim() || 'N/A',
    })
  })

  return repositories
}
