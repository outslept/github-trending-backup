import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
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
    const filePath = join(process.cwd(), '..', '..', `${date}.md`)

    console.log('Reading file:', filePath)

    const content = await readFile(filePath, 'utf-8')
    const repos = parseMarkdownContent(content)

    console.log(`Found ${repos.length} repositories`)

    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (session?.user) {
      console.log('User is authenticated, fetching starred repos')

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
            throw new Error(`GitHub API error: ${starredResponse.statusText}`)
          }

          const starredRepos: GithubRepo[] = await starredResponse.json()
          console.log(`Found ${starredRepos.length} starred repositories`)

          repos.forEach(repo => {
            repo.isStarred = starredRepos.some(
              starred => starred.full_name === repo.title
            )
          })
        } catch (error) {
          console.error('Error fetching starred repos:', error)
        }
      } else {
        console.log('No GitHub token found for user')
      }
    }

    return NextResponse.json(repos)
  } catch (error) {
    console.error('Error in trending API:', error)

    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      const { date } = await context.params
      return NextResponse.json({
        error: 'No data found for this date',
        details: `File not found: ${date}.md`
      }, { status: 404 })
    }

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
        console.error('Error parsing line:', line, error)
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
    console.error('Error parsing repo info:', repoInfo, error)
  }
  return ['', '']
}
