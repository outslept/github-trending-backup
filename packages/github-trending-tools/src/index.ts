import process from 'node:process';
import { scrapeTrendingForAll } from './scrape.js';
import { renderMarkdownReport, resolveOutputPath, saveReport } from './report.js';
import type { GitHubLanguage } from './github-languages.js';

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

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`info: starting github trending scraper for ${today}`);

  const reports = await scrapeTrendingForAll(WATCHLIST);

  const outputPath = resolveOutputPath(today);
  const markdown = renderMarkdownReport(reports, today);
  saveReport(markdown, outputPath);
  console.log(`info: saved report to ${outputPath}`);

  const successful = reports.filter((report) => report.success);
  const failed = reports.filter((report) => !report.success);
  console.log(`info: completed ${successful.length}/${reports.length} languages`);

  if (failed.length > 0) {
    console.error(`error: failed languages: ${failed.map((report) => report.language).join(', ')}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
