import type { LanguageGroup, Repository } from '../lib/types'

export function dayFromFileName (name: string): string {
  return name.replace('.md', '').split('-')[2]
}

export function parseNumber (str: string): number {
  const match = /[\d,]+/.exec(str ?? '')
  return match ? parseInt(match[0].replace(/,/g, ''), 10) : 0
}

export function parseTableRow (line: string): Repository | null {
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
