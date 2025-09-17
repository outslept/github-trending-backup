import { todayIso } from './date'
import type { MetadataFile } from './types'
import { lastAvailableDateFromMetadata } from '../shared/metadata'
import { METADATA_URL } from '../shared/github'

export async function fetchTrendingMetadata (): Promise<MetadataFile> {
  const res = await fetch(METADATA_URL)
  if (!res.ok) throw new Error('Failed to fetch metadata')
  return res.json() as Promise<MetadataFile>
}

export function isDateAvailableInMetadata (meta: MetadataFile, date: string): boolean {
  const [y, m, d] = date.split('-')
  return meta.years[y]?.[m]?.includes(d) ?? false
}

export async function fetchLatestAvailableDate (): Promise<string> {
  try {
    const meta = await fetchTrendingMetadata()
    return lastAvailableDateFromMetadata(meta) ?? todayIso()
  } catch {
    return todayIso()
  }
}
