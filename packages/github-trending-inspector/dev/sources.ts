import { GITHUB_CONTENTS_BASE, RAW_METADATA_URL } from './config'
import { parseMdToLanguageGroups, dayFromFileName } from '../src/shared/markdown'
import { lastAvailableDateFromMetadata } from '../src/shared/metadata'

export function toIsoToday () {
  return new Date().toLocaleDateString('sv-SE')
}

async function listMonthFiles (year, month) {
  const url = `${GITHUB_CONTENTS_BASE}/${year}/${month}`
  const res = await fetch(url, { headers: { 'User-Agent': 'dev-server', Accept: 'application/vnd.github+json' } })
  if (!res.ok) {
    throw new Error('Month not found')
  }
  const all = await res.json()
  return all
    .filter((f) => f.type === 'file' && f.name.endsWith('.md'))
    .map((file) => ({
      name: file.name,
      load: async () => {
        const md = await fetch(file.download_url)
        if (!md.ok) throw new Error(`Failed to download ${file.name}`)
        return md.text()
      },
    }))
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
    throw new Error('Date not found')
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
      const days = files
        .filter((f) => f.type === 'file' && f.name.endsWith('.md'))
        .map((f) => f.name.replace('.md', '').split('-')[2])
        .sort()
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

export { lastAvailableDateFromMetadata }
