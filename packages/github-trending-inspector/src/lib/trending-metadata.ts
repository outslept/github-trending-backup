import { todayIso } from './utils';
import type { MetadataFile } from './types';

export const GITHUB_BASE_URL = 'https://github.com';
export const DATA_BASE_URL =
  'https://raw.githubusercontent.com/outslept/github-trending-backup/master/data';
export const METADATA_URL = `${DATA_BASE_URL}/metadata.json`;

export async function fetchTrendingMetadata(): Promise<MetadataFile> {
  const res = await fetch(METADATA_URL);
  if (!res.ok) throw new Error('Failed to fetch metadata');
  return res.json() as Promise<MetadataFile>;
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

export function lastAvailableDateFromMetadata(meta?: MetadataFile): string | null {
  if (!meta) return null;
  const years = meta.years;
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

export function getAllAvailableDatesFromMetadata(meta?: MetadataFile): string[] {
  if (!meta) return [];
  const allDates: string[] = [];

  for (const year of Object.keys(meta.years).sort()) {
    const months = meta.years[year] ?? {};
    for (const month of Object.keys(months).sort()) {
      const days = months[month].slice().sort();
      for (const day of days) {
        allDates.push(`${year}-${month}-${day}`);
      }
    }
  }

  return allDates;
}

export function getAdjacentDatesFromMetadata(
  meta: MetadataFile | undefined,
  currentDate: string,
): { prevDate: string | null; nextDate: string | null } {
  if (!meta) return { prevDate: null, nextDate: null };
  const allDates = getAllAvailableDatesFromMetadata(meta);
  if (allDates.length === 0) return { prevDate: null, nextDate: null };

  const idx = allDates.indexOf(currentDate);
  if (idx !== -1) {
    return {
      prevDate: idx > 0 ? allDates[idx - 1] : null,
      nextDate: idx < allDates.length - 1 ? allDates[idx + 1] : null,
    };
  }

  // Fallback if currentDate is not in metadata
  const prevDate = allDates.filter((d) => d < currentDate).pop() ?? null;
  const nextDate = allDates.find((d) => d > currentDate) ?? null;
  return { prevDate, nextDate };
}

export function getRandomDateFromMetadata(meta?: MetadataFile): string | null {
  const dates = getAllAvailableDatesFromMetadata(meta);
  if (dates.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * dates.length);
  return dates[randomIndex];
}

export function getDateBoundsFromMetadata(meta: MetadataFile | undefined): {
  startMonth: Date | undefined;
  endMonth: Date | undefined;
} {
  if (!meta) return { startMonth: undefined, endMonth: undefined };

  const years = Object.keys(meta.years).sort();
  if (years.length === 0) return { startMonth: undefined, endMonth: undefined };

  const minY = years[0];
  const minM = Object.keys(meta.years[minY]).sort()[0];
  const minD = meta.years[minY][minM].sort()[0];
  const startMonth = new Date(`${minY}-${minM}-${minD}T00:00:00`);

  const maxY = years[years.length - 1];
  const maxM = Object.keys(meta.years[maxY]).sort().reverse()[0];
  const maxD = meta.years[maxY][maxM].sort().reverse()[0];
  const endMonth = new Date(`${maxY}-${maxM}-${maxD}T00:00:00`);

  return { startMonth, endMonth };
}
