import { NextRequest, NextResponse } from 'next/server'
import { readFile, access } from 'fs/promises'
import { join } from 'path'
import { auth } from '$/lib/auth'
import { db } from '$/db'

interface Repository {
  rank: number
  title: string
  url: string
  description: string
  stars: string
  forks: string
  todayStars: string
  language: string
  isStarred?: boolean
}

interface GithubRepo {
  full_name: string
  description: string
  stargazers_count: number
  language: string
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await context.params

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({
        error: 'Invalid date format',
        details: 'Date should be in YYYY-MM-DD format'
      }, { status: 400 })
    }

    const [year, month] = date.split('-')
    const filePath = join(process.cwd(), '..', '..', 'data', year, month, `${date}.md`)

    try {
      await access(filePath)
    } catch (error) {
      console.error(`File access error for ${filePath}:`, error)
      return NextResponse.json({
        error: 'No data found for this date',
        details: `File not found: ${date}.md`,
        path: filePath
      }, { status: 404 })
    }

    let content: string
    try {
      content = await readFile(filePath, 'utf-8')
    } catch (error) {
      console.error(`File read error for ${filePath}:`, error)
      return NextResponse.json({
        error: 'Failed to read file',
        details: error instanceof Error ? error.message : 'Unknown error',
        path: filePath
      }, { status: 500 })
    }

    const repos = parseMarkdownContent(content)
    if (!repos.length) {
      return NextResponse.json({
        error: 'No repositories found',
        details: 'The file was empty or had invalid format'
      }, { status: 404 })
    }

    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (session?.user) {
      const account = await db.query.account.findFirst({
        where: (account, { eq, and }) => and(
          eq(account.userId, session.user.id),
          eq(account.providerId, 'github')
        )
      })

      if (account?.accessToken) {
        try {
          const starredResponse = await fetch('https://api.github.com/user/starred?per_page=100', {
            headers: {
              Authorization: `Bearer ${account.accessToken}`,
              Accept: 'application/vnd.github.v3+json'
            }
          })

          if (!starredResponse.ok) {
            console.error('GitHub API error:', {
              status: starredResponse.status,
              statusText: starredResponse.statusText
            })
            const errorText = await starredResponse.text()
            console.error('GitHub API error response:', errorText)
            throw new Error(`GitHub API error: ${starredResponse.statusText}`)
          }

          const responseText = await starredResponse.text()
          let starredRepos: GithubRepo[]
          try {
            starredRepos = JSON.parse(responseText)
          } catch (error) {
            console.error('Failed to parse GitHub response:', responseText)
            throw new Error('Invalid GitHub API response')
          }

          repos.forEach(repo => {
            repo.isStarred = starredRepos.some(
              starred => starred.full_name === repo.title
            )
          })
        } catch (error) {
          console.error('Error fetching starred repos:', error)
          repos.forEach(repo => {
            repo.isStarred = false
          })
        }
      }
    }

    const response = NextResponse.json(repos)
    response.headers.set('Cache-Control', 'no-store')
    return response

  } catch (error) {
    console.error('Unhandled error in trending API:', error)
    return NextResponse.json({
      error: 'Failed to fetch trending data',
      details: error instanceof Error ? error.message : 'Unknown error'
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
            rank: parseInt(rank) || 0,
            title,
            url,
            description: description || 'No description provided',
            stars: stars || '0',
            forks: forks || '0',
            todayStars: today || 'N/A',
            isStarred: false
          })
        }
      } catch (error) {
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
  } catch (error) {
    console.error('Error parsing repo info:', { repoInfo, error })
  }
  return ['', '']
}
