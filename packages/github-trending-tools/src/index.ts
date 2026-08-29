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

const iso = new Date().toISOString();
const month = iso.slice(0, 7);
const day = iso.slice(8, 10);

const groups = await scrapeTrendingForAll(WATCHLIST);

saveMonthData(month, day, groups);
updateMetadata(month, day);

console.log(`info: saved ${groups.length}/${WATCHLIST.length} languages`);

if (groups.length < WATCHLIST.length) {
  console.error(`error: ${WATCHLIST.length - groups.length} failed`);
  process.exitCode = 1;
}
