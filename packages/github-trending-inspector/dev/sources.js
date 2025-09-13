import { GITHUB_CONTENTS_BASE, RAW_METADATA_URL } from './config.js'

export function toIsoToday () {
  return new Date().toLocaleDateString('sv-SE')
}

export function dayFromFileName (name) {
  return name.replace('.md', '').split('-')[2]
}

async function listMonthFiles (year, month) {
  const url = `${GITHUB_CONTENTS_BASE}/${year}/${month}`
  const res = await fetch(url, { headers: { 'User-Agent': 'dev-server', Accept: 'application/vnd.github+json' } })
  if (!res.ok) {
    const e = new Error('Month not found')
    e.code = 404
    throw e
  }
  const all = await res.json()
  return all.filter((f) => f.type === 'file' && f.name.endsWith('.md')).map((file) => ({
    name: file.name,
    load: async () => {
      const md = await fetch(file.download_url)
      if (!md.ok) throw new Error(`Failed to download ${file.name}`)
      return md.text()
    },
  }))
}

function parseNumber (str) {
  const match = /[\d,]+/.exec(str ?? '')
  return match ? parseInt(match[0].replace(/,/g, ''), 10) : 0
}

function parseTableRow (line) {
  const columns = line.split('|').map((c) => c.trim()).filter(Boolean)
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

function parseMdToLanguageGroups (md) {
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

export async function fetchTrendingMonth (month) {
  const [year, monthNum] = month.split('-')
  const files = await listMonthFiles(year, monthNum)
  const repositories = {}
  for (const file of files) {
    const content = await file.load()
    const groups = parseMdToLanguageGroups(content)
    if (groups.length) repositories[dayFromFileName(file.name)] = groups
  }
  return { month, repositories }
}

export async function fetchTrendingDate (date) {
  const month = date.slice(0, 7)
  const [year, monthNum] = month.split('-')
  const files = await listMonthFiles(year, monthNum)
  const target = files.find((f) => f.name === `${date}.md`)
  if (!target) {
    const e = new Error('Date not found')
    e.code = 404
    throw e
  }
  const content = await target.load()
  const groups = parseMdToLanguageGroups(content)
  return { month, repositories: { [date.slice(-2)]: groups } }
}

async function computeMetadataFromContents () {
  const years = {}
  const root = await fetch(GITHUB_CONTENTS_BASE, { headers: { 'User-Agent': 'dev-server', Accept: 'application/vnd.github+json' } })
  if (!root.ok) return { lastUpdated: new Date().toISOString(), years: {} }
  const yearDirs = (await root.json()).filter((e) => e.type === 'dir' && /^\d{4}$/.test(e.name))
  for (const y of yearDirs) {
    const monthsRes = await fetch(`${GITHUB_CONTENTS_BASE}/${y.name}`, { headers: { 'User-Agent': 'dev-server', Accept: 'application/vnd.github+json' } })
    if (!monthsRes.ok) continue
    const monthDirs = (await monthsRes.json()).filter((e) => e.type === 'dir' && /^\d{2}$/.test(e.name))
    for (const m of monthDirs) {
      const filesRes = await fetch(`${GITHUB_CONTENTS_BASE}/${y.name}/${m.name}`, { headers: { 'User-Agent': 'dev-server', Accept: 'application/vnd.github+json' } })
      if (!filesRes.ok) continue
      const files = await filesRes.json()
      const days = files.filter((f) => f.type === 'file' && f.name.endsWith('.md')).map((f) => f.name.replace('.md', '').split('-')[2]).sort()
      if (days.length) {
        years[y.name] = years[y.name] ?? {}
        years[y.name][m.name] = days
      }
    }
  }
  return { lastUpdated: new Date().toISOString(), years }
}

export async function fetchTrendingMetadata () {
  try {
    const res = await fetch(RAW_METADATA_URL)
    if (res.ok) return res.json()
  } catch {}
  return computeMetadataFromContents()
}

export function lastAvailableDateFromMetadata (meta) {
  const years = meta?.years ?? {}
  const y = Object.keys(years).sort().reverse()
  for (const year of y) {
    const months = years[year] ?? {}
    const m = Object.keys(months).sort().reverse()
    for (const mm of m) {
      const days = (months[mm] ?? []).slice().sort().reverse()
      if (days.length) return `${year}-${mm}-${days[0]}`
    }
  }
  return null
}
