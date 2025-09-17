import type { MetadataFile } from '../lib/types';

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