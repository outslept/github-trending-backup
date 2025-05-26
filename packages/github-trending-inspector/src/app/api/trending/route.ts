/* eslint-disable unused-imports/no-unused-vars */
import type { LanguageGroup, Repository } from '$/lib/types'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const month = searchParams.get('month')
  const calendar = searchParams.get('calendar')

  if (date)
    return handleDateRequest(date)
  if (month)
    return handleMonthRequest(month)
  if (calendar)
    return handleCalendarRequest()

  return Response.json({ error: 'Missing parameters' }, { status: 400 })
}

async function getTrendingData(date: string): Promise<Repository[] | null> {
  try {
    const [year, month] = date.split('-')
    const url = `https://raw.githubusercontent.com/outslept/github-trending-backup/master/data/${year}/${month}/${date}.md`

    const response = await fetch(url)
    if (!response.ok)
      return null

    const mdContent = await response.text()
    const repos = parseMdToRepositories(mdContent)
    return repos
  }
  catch (error) {
    return null
  }
}

async function getMonthData(month: string) {
  try {
    const [year, monthNum] = month.split('-')
    const url = `https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year}/${monthNum}`

    const response = await fetch(url)
    if (!response.ok)
      throw new Error('Month not found')

    const files = await response.json()
    const mdFiles = files.filter((file: any) => file.name.endsWith('.md'))
    const dates = mdFiles.map((file: any) => file.name.replace('.md', ''))

    let totalRepos = 0
    const languageCount: Record<string, number> = {}

    // Process limited files for performance
    for (const file of mdFiles.slice(0, 10)) {
      try {
        const fileResponse = await fetch(file.download_url)
        const content = await fileResponse.text()
        const repos = parseMdToRepositories(content)

        if (repos) {
          totalRepos += repos.length
          repos.forEach((repo) => {
            languageCount[repo.language] = (languageCount[repo.language] || 0) + 1
          })
        }
      }
      catch {
        continue
      }
    }

    const topLanguages = Object.entries(languageCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([lang]) => lang)

    return {
      dates: dates.sort(),
      totalRepos,
      topLanguages,
    }
  }
  catch (error) {
    throw new Error('Failed to read month data')
  }
}

async function getCalendarData() {
  try {
    const dataUrl = `https://api.github.com/repos/outslept/github-trending-backup/contents/data`
    const response = await fetch(dataUrl)
    const years = await response.json()

    if (!Array.isArray(years)) {
      throw new TypeError('Invalid years data structure')
    }

    const calendarData: Record<string, any> = {}

    for (const year of years) {
      const yearUrl = `https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year.name}`
      const yearResponse = await fetch(yearUrl)
      const months = await yearResponse.json()

      if (!Array.isArray(months))
        continue

      for (const month of months) {
        const monthKey = `${year.name}-${month.name}`
        const monthUrl = `https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year.name}/${month.name}`
        const monthResponse = await fetch(monthUrl)
        const files = await monthResponse.json()

        if (!Array.isArray(files))
          continue

        const mdFiles = files.filter((file: any) => file.name.endsWith('.md'))
        const dates = mdFiles.map((file: any) => file.name.replace('.md', ''))

        let totalRepos = 0
        for (const file of mdFiles.slice(0, 5)) {
          try {
            const fileResponse = await fetch(file.download_url)
            const content = await fileResponse.text()
            const repos = parseMdToRepositories(content)
            if (repos)
              totalRepos += repos.length
          }
          catch {
            continue
          }
        }

        calendarData[monthKey] = {
          dates: dates.sort(),
          summary: {
            totalDays: dates.length,
            repoCount: totalRepos,
          },
        }
      }
    }

    return calendarData
  }
  catch (error) {
    throw new Error('Failed to read calendar data')
  }
}

function parseMdToRepositories(mdContent: string): Repository[] | null {
  try {
    const lines = mdContent.split('\n')
    const repos: Repository[] = []
    let currentLanguage = 'Unknown'
    let inTable = false
    let rank = 1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Detect language headers (## Language)
      if (line.startsWith('## ') && !line.includes('Table of Contents')) {
        currentLanguage = line.replace('## ', '').trim()
        inTable = false
        rank = 1
        continue
      }

      // Detect table start
      if (line.startsWith('| # | Repository |')) {
        inTable = true
        continue
      }

      // Skip table separator
      if (line.startsWith('| --- |')) {
        continue
      }

      // Parse table rows
      if (inTable && line.startsWith('| ') && line.endsWith(' |')) {
        const columns = line.split('|').map(col => col.trim()).filter(col => col)

        if (columns.length >= 6) {
          // #, Repository, Description, Stars, Forks, Today
          const [rankStr, repoCell, description, starsCell, forksCell, todayCell] = columns

          // Extract repository name and URL from markdown link
          const repoMatch = repoCell.match(/\[([^\]]+)\]\(([^)]+)\)/)
          if (repoMatch) {
            const [, name, url] = repoMatch

            const starsMatch = starsCell.match(/[\d,]+/)
            const forksMatch = forksCell.match(/[\d,]+/)
            const todayMatch = todayCell.match(/(\d+)\s+stars?\s+today/i)

            const stars = starsMatch ? starsMatch[0] : '0'
            const forks = forksMatch ? forksMatch[0] : '0'
            const starsToday = todayMatch ? todayMatch[1] : '0'

            repos.push({
              name: name.trim(),
              rank: rank++,
              title: name.trim(),
              url: url.trim(),
              description: description.trim() || 'No description',
              stars,
              forks,
              starsToday,
              language: currentLanguage,
            })
          }
        }
      }

      // Reset table flag when we hit an empty line or new section
      if (inTable && (line === '' || line.startsWith('#'))) {
        inTable = false
      }
    }

    return repos.length > 0 ? repos : null
  }
  catch (error) {
    return null
  }
}

function groupRepositoriesByLanguage(repos: Repository[]): LanguageGroup[] {
  const languageOrder = new Map<string, number>()
  const languageGroups = new Map<string, LanguageGroup>()

  repos.forEach((repo, index) => {
    if (!languageOrder.has(repo.language)) {
      languageOrder.set(repo.language, index)
    }

    if (!languageGroups.has(repo.language)) {
      languageGroups.set(repo.language, {
        language: repo.language,
        repos: [],
      })
    }
    languageGroups.get(repo.language)!.repos.push(repo)
  })

  const grouped = Array.from(languageGroups.values())
    .sort((a, b) => {
      const orderA = languageOrder.get(a.language) || 0
      const orderB = languageOrder.get(b.language) || 0
      return orderA - orderB
    })

  return grouped
}

async function handleDateRequest(date: string) {
  try {
    const data = await getTrendingData(date)

    if (!data) {
      return Response.json({ date, available: false })
    }

    const grouped = groupRepositoriesByLanguage(data)

    return Response.json({
      date,
      available: true,
      data: grouped,
      metadata: {
        totalRepos: data.length,
        languages: [...new Set(data.map(r => r.language))],
        lastUpdated: new Date().toISOString(),
      },
    })
  }
  catch (error) {
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

async function handleMonthRequest(month: string) {
  try {
    const monthData = await getMonthData(month)

    return Response.json({
      month,
      availableDates: monthData.dates,
      summary: {
        totalDays: monthData.dates.length,
        totalRepos: monthData.totalRepos,
        topLanguages: monthData.topLanguages,
      },
    })
  }
  catch (error) {
    return Response.json({ error: 'Failed to fetch month data' }, { status: 500 })
  }
}

async function handleCalendarRequest() {
  try {
    const calendarData = await getCalendarData()
    return Response.json(calendarData)
  }
  catch (error) {
    return Response.json({ error: 'Failed to fetch calendar data' }, { status: 500 })
  }
}
