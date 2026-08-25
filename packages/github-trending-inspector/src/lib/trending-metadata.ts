import { todayIso } from './utils'
import type { MetadataFile } from './types'

export const GITHUB_BASE_URL = 'https://github.com'
export const DATA_BASE_URL = 'https://raw.githubusercontent.com/outslept/github-trending-backup/master/packages/github-trending-data'
export const METADATA_URL = `${DATA_BASE_URL}/metadata.json`

export async function fetchTrendingMetadata(): Promise<MetadataFile> {
  const res = await fetch(METADATA_URL)
  if (!res.ok) throw new Error('Failed to fetch metadata')
  return res.json() as Promise<MetadataFile>
}

export function isDateAvailableInMetadata(meta: MetadataFile, date: string): boolean {
  const [y, m, d] = date.split('-')
  return meta.years[y]?.[m]?.includes(d) ?? false
}

export async function fetchLatestAvailableDate(): Promise<string> {
  try {
    const meta = await fetchTrendingMetadata()
    return lastAvailableDateFromMetadata(meta) ?? todayIso()
  } catch {
    return todayIso()
  }
}

export function lastAvailableDateFromMetadata(meta: MetadataFile): string | null {
  const years = meta.years
  const yearsDesc = Object.keys(years).sort((a, b) => b.localeCompare(a));

  for (const year of yearsDesc) {
    const months = years[year] ?? {};
    const monthsDesc = Object.keys(months).sort((a, b) => b.localeCompare(a));

    for (const month of monthsDesc) {
      const days = months[month].slice().sort((a, b) => b.localeCompare(a));
      if (days.length) {
        return `${year}-${month}-${days[0]}`;
      }
    }
  }

  return null;
}

export function getDateBoundsFromMetadata(meta: MetadataFile | undefined): { startMonth: Date | undefined; endMonth: Date | undefined } {
  if (!meta) return { startMonth: undefined, endMonth: undefined }

  const years = Object.keys(meta.years).sort()
  if (years.length === 0) return { startMonth: undefined, endMonth: undefined }

  const minY = years[0]
  const minM = Object.keys(meta.years[minY]).sort()[0]
  const minD = meta.years[minY][minM].sort()[0]
  const startMonth = new Date(`${minY}-${minM}-${minD}T00:00:00`)

  const maxY = years[years.length - 1]
  const maxM = Object.keys(meta.years[maxY]).sort().reverse()[0]
  const maxD = meta.years[maxY][maxM].sort().reverse()[0]
  const endMonth = new Date(`${maxY}-${maxM}-${maxD}T00:00:00`)

  return { startMonth, endMonth }
}
