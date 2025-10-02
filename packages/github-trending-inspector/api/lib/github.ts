import type { LanguageGroup, GitHubFile } from '../../src/lib/types'

export const REPO_OWNER = 'outslept'
export const REPO_NAME = 'github-trending-backup'
export const BRANCH = 'master'
export const DATA_SUBPATH = 'packages/github-trending-data'

export const GITHUB_CONTENTS_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_SUBPATH}`

export function dayFromFileName (name: string): string {
  return name.replace('.md', '').split('-')[2]
}

export function parseNumber (str: string): number {
  const match = /[\d,]+/.exec(str ?? '')
  return match ? parseInt(match[0].replace(/,/g, ''), 10) : 0
}

export function parseTableRow (line: string) {
  const columns = line.split('|').map((c: string) => c.trim()).filter(Boolean)
  if (columns.length < 6) return null
  const repoMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(columns[1])
  if (!repoMatch) return null
  const todayMatch = /(\d+)\s+stars?\s+today/i.exec(columns[5])
  return {
    rank: parseInt(columns[0], 10) || 0,
    repo: repoMatch[1].trim(),
    desc: columns[2].trim() || 'No description',
    stars: parseNumber(columns[3]),
    forks: parseNumber(columns[4]),
    today: todayMatch ? parseInt(todayMatch[1], 10) : 0,
  }
}

export function parseMdToLanguageGroups (md: string): LanguageGroup[] {
  const groups = []
  let language = 'Unknown'
  let repos = []
  let inTable = false

  for (const raw of md.split('\n')) {
    const line = raw.trim()

    if (line.startsWith('## ') && !line.includes('Table of Contents')) {
      if (repos.length) groups.push({ language, repos })
      language = line.replace('## ', '').trim()
      repos = []
      inTable = false
      continue
    }

    if (!inTable && line.startsWith('| # | Repository |')) {
      inTable = true
      continue
    }

    if (inTable && line.startsWith('| ') && line.endsWith(' |')) {
      const repo = parseTableRow(line)
      if (repo) repos.push(repo)
      continue
    }

    if (inTable && (!line || line.startsWith('#'))) {
      inTable = false
    }
  }

  if (repos.length) groups.push({ language, repos })
  return groups
}


const GH_HEADERS = {
  'User-Agent': 'trending-inspector',
  Accept: 'application/vnd.github+json',
}

async function fetchDirectory (year: string, monthNum: string) {
  const url = `${GITHUB_CONTENTS_BASE}/${year}/${monthNum}`
  const res = await fetch(url, { headers: GH_HEADERS })
  if (!res.ok) throw new Error('Month not found')
  return res.json() as Promise<GitHubFile[]>
}

export async function fetchMonthData (month: string): Promise<Record<string, LanguageGroup[]>> {
  const [year, monthNum] = month.split('-')
  const allFiles = await fetchDirectory(year, monthNum)
  const files = allFiles.filter((file) => file.name.endsWith('.md'))
  return processFiles(files)
}

export async function fetchDateData (month: string, date: string): Promise<Record<string, LanguageGroup[]>> {
  const [year, monthNum] = month.split('-')
  const allFiles = await fetchDirectory(year, monthNum)
  const file = allFiles.find((f) => f.name === `${date}.md`)
  if (!file) throw new Error('Date not found')
  return processFiles([file])
}

async function processFiles (files: GitHubFile[]): Promise<Record<string, LanguageGroup[]>> {
  const repositories: Record<string, LanguageGroup[]> = {}
  const results = await Promise.all(
    files.map(async (file) => {
      const content = await fetch(file.download_url).then((res) => res.text())
      const languageGroups = parseMdToLanguageGroups(content) as LanguageGroup[]
      const day = dayFromFileName(file.name)
      return { day, languageGroups }
    })
  )
  for (const { day, languageGroups } of results) {
    if (languageGroups.length > 0) repositories[day] = languageGroups
  }
  return repositories
}
