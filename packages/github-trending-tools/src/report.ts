import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import type { LanguageReport, TrendingRepo } from './scrape.js';

const MAX_DESCRIPTION_LENGTH = 100;

function createAnchor(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

function escapeMdCell(value: string) {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function formatNumber(value: number | null) {
  if (value === null) return 'N/A';
  return value.toLocaleString('en-US');
}

function formatRepositoryRow(repo: TrendingRepo) {
  const rawDescription =
    repo.description.length > MAX_DESCRIPTION_LENGTH
      ? `${repo.description.slice(0, MAX_DESCRIPTION_LENGTH - 3)}...`
      : repo.description;
  const description = escapeMdCell(rawDescription);

  return `| ${repo.rank} | [${repo.title}](${repo.url}) | ${description} | ${formatNumber(repo.stars)} | ${formatNumber(repo.forks)} | ${formatNumber(repo.todayStars)} |`;
}

export function renderMarkdownReport(reports: LanguageReport[], date: string) {
  const formatSection = (report: LanguageReport) => {
    if (!report.success) {
      return `## ${report.language}\n\nFailed to scrape: ${report.error ?? 'Unknown error'}\n`;
    }

    if (report.repositories.length === 0) {
      return `## ${report.language}\n\nNo trending repositories found.\n`;
    }

    const rows = report.repositories.map(formatRepositoryRow).join('\n');

    return `## ${report.language}\n\n| # | Repository | Description | Stars | Forks | Today |\n| --- | --- | --- | --- | --- | --- |\n${rows}\n`;
  };

  const toc = reports
    .map((report) => `- [${report.language}](#${createAnchor(report.language)})`)
    .join('\n');

  return `# GitHub Trending - ${date}\n\n## Table of Contents\n\n${toc}\n\n${reports.map(formatSection).join('\n')}`;
}

const DEFAULT_DATA_ROOT = join(process.cwd(), 'packages', 'github-trending-data');
export const DATA_ROOT = process.env.GITHUB_TRENDING_DATA_DIR ?? DEFAULT_DATA_ROOT;

export function resolveOutputPath(date: string, dataRoot = DATA_ROOT) {
  const year = date.slice(0, 4);
  const month = date.slice(5, 7);
  return join(dataRoot, year, month, `${date}.md`);
}

export function saveReport(markdown: string, path: string) {
  const outputDir = dirname(path);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  writeFileSync(path, markdown, 'utf8');
}
