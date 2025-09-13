import process from 'node:process';
import { renderMarkdownReport, resolveOutputPath, saveReport } from './report.js';
import { scrapeTrendingForAll, type GitHubLanguage } from './scrape.js';

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

async function run() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`info: starting github trending scraper for ${today}`);

  const reports = await scrapeTrendingForAll(WATCHLIST);

  const outputPath = resolveOutputPath(today);
  const markdown = renderMarkdownReport(reports, today);
  saveReport(markdown, outputPath);
  console.log(`info: saved report to ${outputPath}`);

  const successful = reports.filter((r) => r.success);
  const failed = reports.filter((r) => !r.success);
  console.log(`info: completed ${successful.length}/${reports.length} languages`);

  if (failed.length) {
    console.error(`error: failed languages: ${failed.map((r) => r.language).join(', ')}`);
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(`error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});