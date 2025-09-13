import type { LanguageGroup, Repository, GitHubFile } from '../../src/lib/types';

const CONTENTS_BASE = 'https://api.github.com/repos/outslept/trending-backup/contents/packages/github-trending-data';

async function fetchDirectory(year: string, monthNum: string) {
  const url = `${CONTENTS_BASE}/${year}/${monthNum}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Month not found');
  return res.json() as Promise<GitHubFile[]>;
}

export async function fetchMonthData(month: string): Promise<Record<string, LanguageGroup[]>> {
  const [year, monthNum] = month.split('-');
  const allFiles = await fetchDirectory(year, monthNum);
  const files = allFiles.filter((file) => file.name.endsWith('.md'));
  return processFiles(files);
}

export async function fetchDateData(month: string, date: string): Promise<Record<string, LanguageGroup[]>> {
  const [year, monthNum] = month.split('-');
  const allFiles = await fetchDirectory(year, monthNum);
  const file = allFiles.find((f) => f.name === `${date}.md`);
  if (!file) throw new Error('Date not found');
  return processFiles([file]);
}

async function processFiles(files: GitHubFile[]): Promise<Record<string, LanguageGroup[]>> {
  const repositories: Record<string, LanguageGroup[]> = {};
  const results = await Promise.all(
    files.map(async (file) => {
      const content = await fetch(file.download_url).then((res) => res.text());
      const languageGroups = parseMdToLanguageGroups(content);
      const day = file.name.replace('.md', '').split('-')[2];
      return { day, languageGroups };
    }),
  );
  for (const { day, languageGroups } of results) {
    if (languageGroups.length > 0) repositories[day] = languageGroups;
  }
  return repositories;
}

function parseNumber(str: string): number {
  const match = /[\d,]+/.exec(str);
  return match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
}

function parseTableRow(line: string): Repository | null {
  const columns = line.split('|').map((col) => col.trim()).filter(Boolean);
  if (columns.length < 6) return null;
  const repoMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(columns[1]);
  if (!repoMatch) return null;
  const todayMatch = /(\d+)\s+stars?\s+today/i.exec(columns[5]);
  return {
    rank: parseInt(columns[0], 10) || 0,
    repo: repoMatch[1].trim(),
    desc: columns[2].trim() || 'No description',
    stars: parseNumber(columns[3]),
    forks: parseNumber(columns[4]),
    today: todayMatch ? parseInt(todayMatch[1], 10) : 0,
  };
}

function parseMdToLanguageGroups(mdContent: string): LanguageGroup[] {
  const languageGroups: LanguageGroup[] = [];
  let currentLanguage = 'Unknown';
  let currentRepos: Repository[] = [];
  let inTable = false;

  for (const line of mdContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ') && !trimmed.includes('Table of Contents')) {
      if (currentRepos.length > 0) languageGroups.push({ language: currentLanguage, repos: currentRepos });
      currentLanguage = trimmed.replace('## ', '').trim();
      currentRepos = [];
      inTable = false;
      continue;
    }
    if (!inTable && trimmed.startsWith('| # | Repository |')) {
      inTable = true;
      continue;
    }
    if (inTable && trimmed.startsWith('| ') && trimmed.endsWith(' |')) {
      const repo = parseTableRow(trimmed);
      if (repo) currentRepos.push(repo);
    }
    if (inTable && (!trimmed || trimmed.startsWith('#'))) {
      inTable = false;
    }
  }

  if (currentRepos.length > 0) languageGroups.push({ language: currentLanguage, repos: currentRepos });
  return languageGroups;
}