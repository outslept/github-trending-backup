import type { NextRequest } from 'next/server'

interface Repository {
  rank: number
  repo: string
  desc: string
  stars: number
  forks: number
  today: number
}

interface LanguageGroup {
  language: string
  repos: Repository[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ params: string[] }> },
) {
  const searchParams = new URL(request.url).searchParams
  const paramsValue = await params

  if (!paramsValue.params?.length) {
    return Response.json({ error: 'Month parameter is required' }, { status: 400 })
  }

  const isSpecificDate = paramsValue.params.length === 3 || paramsValue.params[0].split('-').length === 3
  const month = isSpecificDate ? paramsValue.params.join('-').split('-').slice(0, 2).join('-') : paramsValue.params[0]
  const specificDate = isSpecificDate ? paramsValue.params.join('-') : null

  try {
    const [year, monthNum] = month.split('-')
    const response = await fetch(`https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year}/${monthNum}`)

    if (!response.ok)
      throw new Error('Month not found')

    const files = (await response.json()).filter(file => file.name.endsWith('.md'))

    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '5')

    const mdFiles = specificDate ? files.filter(file => file.name === `${specificDate}.md`) : files.slice((page - 1) * limit, page * limit)

    if (specificDate && !mdFiles.length) {
      return Response.json({ error: 'Date not found' }, { status: 404 })
    }

    const repositories: Record<string, LanguageGroup[]> = {}

    for (const file of mdFiles) {
      const languageGroups = parseMdToLanguageGroups(await (await fetch(file.download_url)).text())
      if (languageGroups.length > 0) {
        repositories[file.name.replace('.md', '').split('-')[2]] = languageGroups
      }
    }

    return Response.json({
      month,
      repositories,
      ...(!specificDate && {
        pagination: {
          page,
          totalPages: Math.ceil(files.length / limit),
        },
      }),
    })
  }
  catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch data',
      },
      { status: 500 },
    )
  }
}

function parseMdToLanguageGroups(mdContent: string): LanguageGroup[] {
  const languageGroups: LanguageGroup[] = []
  let currentLanguage = 'Unknown'
  let currentRepos: Repository[] = []
  let inTable = false

  for (const line of mdContent.split('\n')) {
    const trimmedLine = line.trim()

    if (trimmedLine.startsWith('## ') && !trimmedLine.includes('Table of Contents')) {
      if (currentRepos.length > 0) {
        languageGroups.push({ language: currentLanguage, repos: currentRepos })
      }
      currentLanguage = trimmedLine.replace('## ', '').trim()
      currentRepos = []
      inTable = false
      continue
    }

    if (!inTable && trimmedLine.startsWith('| # | Repository |')) {
      inTable = true
      continue
    }

    if (inTable && trimmedLine.startsWith('| ') && trimmedLine.endsWith(' |')) {
      const columns = trimmedLine.split('|').map(col => col.trim()).filter(Boolean)
      if (columns.length < 6)
        continue

      const repoMatch = columns[1].match(/\[([^\]]+)\]\(([^)]+)\)/)
      if (!repoMatch)
        continue

      const starsMatch = columns[3].match(/[\d,]+/)
      const forksMatch = columns[4].match(/[\d,]+/)
      const todayMatch = columns[5].match(/(\d+)\s+stars?\s+today/i)

      currentRepos.push({
        rank: Number.parseInt(columns[0]) || currentRepos.length + 1,
        repo: repoMatch[1].trim(),
        desc: columns[2].trim() || 'No description',
        stars: starsMatch ? Number.parseInt(starsMatch[0].replace(/,/g, '')) : 0,
        forks: forksMatch ? Number.parseInt(forksMatch[0].replace(/,/g, '')) : 0,
        today: todayMatch ? Number.parseInt(todayMatch[1]) : 0,
      })
    }

    if (inTable && (!trimmedLine || trimmedLine.startsWith('#'))) {
      inTable = false
    }
  }

  if (currentRepos.length > 0) {
    languageGroups.push({ language: currentLanguage, repos: currentRepos })
  }

  return languageGroups
}
