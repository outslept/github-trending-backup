import type { LanguageGroup, GitHubFile } from '../../src/lib/types'
import { parseMdToLanguageGroups, dayFromFileName } from '../../src/shared/markdown'
import { GITHUB_CONTENTS_BASE } from '../../src/shared/github.js'

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
