import process from 'node:process';
import { type GitHubLanguage } from './github-languages.js';
import { scrapeTrendingForAll } from './scrape.js';
import { saveMonthData, updateMetadata } from './storage.js';

const WATCHLIST: GitHubLanguage[] = [
  'C',
  'C++',
  'CSS',
  'Elixir',
  'Go',
  'Haskell',
  'HTML',
  'Java',
  'JavaScript',
  'Kotlin',
  'Lua',
  'OCaml',
  'Python',
  'Rust',
  'Shell',
  'Svelte',
  'TypeScript',
  'Vue',
  'Zig',
];

async function main(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const day = today.slice(8);

  console.log(`info: starting github trending scraper for ${today}`);

  const groups = await scrapeTrendingForAll(WATCHLIST);

  saveMonthData(month, groups);
  updateMetadata(month, day);

  console.log(`info: saved data for ${month}/${day} (${groups.length} languages)`);
  console.log(`info: completed`);

  if (groups.length < WATCHLIST.length) {
    console.error(`error: failed to scrape ${WATCHLIST.length - groups.length} languages`);
    process.exitCode = 1;
  }
}

main()
