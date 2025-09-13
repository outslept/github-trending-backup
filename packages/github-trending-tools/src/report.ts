import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import type { LanguageReport } from './scrape.js';

export function renderMarkdownReport(reports: LanguageReport[], date: string): string {
  const createAnchor = (text: string): string =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-');

  const escapeMdCell = (s: string): string =>
    s.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

  const formatSection = (report: LanguageReport): string => {
    if (!report.success) {
      return `## ${report.language}\n\nFailed to scrape: ${report.error ?? 'Unknown error'}\n`;
    }

    if (report.repositories.length === 0) {
      return `## ${report.language}\n\nNo trending repositories found.\n`;
    }

    const rows = report.repositories
      .map((repo) => {
        const desc =
          repo.description.length > 100
            ? `${repo.description.slice(0, 97)}...`
            : repo.description;

        return `| ${repo.rank} | [${repo.title}](${repo.url}) | ${escapeMdCell(desc)} | ${repo.stars} | ${repo.forks} | ${repo.todayStars} |`;
      })
      .join('\n');

    return `## ${report.language}\n\n| # | Repository | Description | Stars | Forks | Today |\n| --- | --- | --- | --- | --- | --- |\n${rows}\n`;
  };

  const toc = reports
    .map((r) => `- [${r.language}](#${createAnchor(r.language)})`)
    .join('\n');

  return `# GitHub Trending - ${date}\n\n## Table of Contents\n\n${toc}\n\n${reports.map(formatSection).join('\n')}`;
}

export function locateProjectRoot(start: string = process.cwd()): string {
  let current = start;
  while (true) {
    if (existsSync(join(current, '.git'))) return current;
    const parent = dirname(current);
    if (parent === current) {
      return start;
    }
    current = parent;
  }
}

const DATA_ROOT = join(locateProjectRoot(), 'packages', 'github-trending-data');

export function resolveOutputPath(date: string): string {
  const year = date.slice(0, 4);
  const month = date.slice(5, 7);

  const outputDir = join(DATA_ROOT, year, month);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  return join(outputDir, `${date}.md`);
}

export function saveReport(markdown: string, path: string) {
  writeFileSync(path, markdown, 'utf8');
}