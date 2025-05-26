import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get('limit') || '10')
  const page = Number.parseInt(searchParams.get('page') || '1')

  try {
    const commits = await getRecentCommits(limit, page)

    return Response.json({
      commits,
      pagination: {
        page,
        limit,
        total: commits.length,
        hasMore: commits.length === limit,
      },
    })
  }
  catch (error) {
    console.error('[COMMITS] Error:', error instanceof Error ? error.message : 'Unknown error')
    return Response.json(
      { error: 'Failed to fetch commits' },
      { status: 500 },
    )
  }
}

async function getRecentCommits(limit: number, page: number) {
  const response = await fetch(
    `https://api.github.com/repos/outslept/github-trending-backup/commits?per_page=${limit}&page=${page}`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Trending-Inspector',
      },
      next: { revalidate: 300 },
    },
  )

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const commits = await response.json()

  return commits.map((commit: { sha: any, commit: { message: any, author: { name: any, date: any } }, author: { login: any, avatar_url: any } }) => ({
    sha: commit.sha,
    commit: {
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        date: commit.commit.author.date,
      },
    },
    author: {
      login: commit.author?.login || commit.commit.author.name,
      avatar_url: commit.author?.avatar_url || null,
    },
  }))
}
