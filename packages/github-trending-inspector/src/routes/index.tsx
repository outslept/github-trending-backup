import { createFileRoute, redirect } from '@tanstack/react-router';

import type { MetadataFile } from '../lib/types';

async function getLastAvailableDate(): Promise<string> {
  try {
    const res = await fetch('https://raw.githubusercontent.com/outslept/github-trending-backup/master/data/metadata.json');
    if (!res.ok) return new Date().toLocaleDateString('sv-SE');

    const { years } = await res.json() as MetadataFile;
    for (const year of Object.keys(years).sort().reverse()) {
      const yearData = years[year];
      if (!yearData) continue;

      for (const month of Object.keys(yearData).sort().reverse()) {
        const days = yearData[month];
        if (days.length) return `${year}-${month}-${days.sort().reverse()[0]}`;
      }
    }
  } catch { /* ignore */ }
  return new Date().toLocaleDateString('sv-SE');
}

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect({ to: '/$date', params: { date: await getLastAvailableDate() } });
  },
});
