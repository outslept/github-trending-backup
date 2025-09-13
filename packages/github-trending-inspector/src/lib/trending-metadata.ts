import { todayIso } from './date';
import type { MetadataFile } from './types';

const REPO_OWNER = 'outslept';
const REPO_NAME = 'github-trending-backup';
const BRANCH = 'master';
const DATA_SUBPATH = 'packages/github-trending-data';

const METADATA_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${DATA_SUBPATH}/metadata.json`;

export async function fetchTrendingMetadata(): Promise<MetadataFile> {
  const res = await fetch(METADATA_URL);
  if (!res.ok) throw new Error('Failed to fetch metadata');
  return res.json() as Promise<MetadataFile>;
}

function lastAvailableDateFromMetadata(meta: MetadataFile): string | null {
  const years = meta.years ?? {};
  const y = Object.keys(years).sort().reverse();
  for (const year of y) {
    const months = years[year] ?? {};
    const m = Object.keys(months).sort().reverse();
    for (const mm of m) {
      const days = (months[mm] ?? []).slice().sort().reverse();
      if (days.length) return `${year}-${mm}-${days[0]}`;
    }
  }
  return null;
}

export function isDateAvailableInMetadata(meta: MetadataFile, date: string): boolean {
  const [y, m, d] = date.split('-');
  return meta.years[y]?.[m]?.includes(d) ?? false;
}

export async function fetchLatestAvailableDate(): Promise<string> {
  try {
    const meta = await fetchTrendingMetadata();
    return lastAvailableDateFromMetadata(meta) ?? todayIso();
  } catch {
    return todayIso();
  }
}