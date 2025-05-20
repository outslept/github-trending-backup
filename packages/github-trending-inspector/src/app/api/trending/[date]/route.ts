import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

interface Repository {
  rank: number
  title: string
  url: string
  description: string
  stars: string
  forks: string
  language: string
  isStarred?: boolean
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ date: string }> },
) {
  try {
    const { date } = await context.params

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({
        error: 'Invalid date format',
        details: 'Date should be in YYYY-MM-DD format',
      }, { status: 400 })
    }

    const [year, month] = date.split('-')
    const githubFilePath = `${year}/${month}/${date}.md`
    const githubRawUrl = `https://raw.githubusercontent.com/outslept/github-trending-backup/master/data/${githubFilePath}`

    const response = await fetch(githubRawUrl)

    if (!response.ok) {
      return NextResponse.json({
        error: 'No data found for this date',
        details: `File not found: ${date}.md`,
      }, { status: 404 })
    }

    const content = await response.text()
    const repos = parseMarkdownContent(content)

    if (!repos.length) {
      return NextResponse.json({
        error: 'No repositories found',
        details: 'The file was empty or had invalid format',
      }, { status: 404 })
    }

    repos.forEach((repo) => {
      repo.isStarred = false
    })

    const apiResponse = NextResponse.json(repos)
    apiResponse.headers.set('Cache-Control', 'no-store')
    return apiResponse
  }
  catch (error) {
    console.error('Unhandled error in trending API:', error)
    return NextResponse.json({
      error: 'Failed to fetch trending data',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

function parseMarkdownContent(content: string): Repository[] {
  const repos: Repository[] = []
  const lines = content.split('\n')
  let currentLanguage = ''

  for (const line of lines) {
    if (line.startsWith('## ')) {
      currentLanguage = line.replace('## ', '').trim()
      continue
    }

    if (line.startsWith('|') && !line.startsWith('| #') && !line.startsWith('| ---')) {
      try {
        const [_, rank, repoInfo, description, stars, forks, today] = line.split('|').map(s => s.trim())
        const [title, url] = parseRepoInfo(repoInfo)

        if (title && url) {
          repos.push({
            language: currentLanguage,
            rank: Number.parseInt(rank) || 0,
            title,
            url,
            description: description || 'No description provided',
            stars: stars || '0',
            forks: forks || '0',
            isStarred: false,
          })
        }
      }
      catch (error) {
        console.error('Error parsing line:', { line, error })
        continue
      }
    }
  }

  return repos
}

function parseRepoInfo(repoInfo: string): [string, string] {
  try {
    const match = repoInfo.match(/\[(.*?)\]\((.*?)\)/)
    if (match) {
      const [_, title, url] = match
      return [title.trim(), url.trim()]
    }
  }
  catch (error) {
    console.error('Error parsing repo info:', { repoInfo, error })
  }
  return ['', '']
}
