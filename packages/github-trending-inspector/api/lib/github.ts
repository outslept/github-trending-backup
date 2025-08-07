import type { LanguageGroup, Repository, GitHubFile } from '../../src/lib/types';

export interface FetchResult {
  repositories: Record<string, LanguageGroup[]>;
  totalFiles: number;
  currentPage: number;
  totalPages: number;
}

export async function fetchMonthData(month: string, page = 1, limit = 5): Promise<FetchResult> {
  const [year, monthNum] = month.split('-');
  const response = await fetch(
    `https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year}/${monthNum}`,
  );

  if (!response.ok) {
    throw new Error('Month not found');
  }

  const allFiles = (await response.json()) as GitHubFile[];
  const files = allFiles.filter(file => file.name.endsWith('.md'));
  const mdFiles = files.slice((page - 1) * limit, page * limit);

  const repositories = await processFiles(mdFiles);

  return {
    repositories,
    totalFiles: files.length,
    currentPage: page,
    totalPages: Math.ceil(files.length / limit),
  };
}

export async function fetchDateData(month: string, date: string): Promise<Record<string, LanguageGroup[]>> {
  const [year, monthNum] = month.split('-');
  const response = await fetch(
    `https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year}/${monthNum}`,
  );

  if (!response.ok) {
    throw new Error('Month not found');
  }

  const allFiles = (await response.json()) as GitHubFile[];
  const file = allFiles.find(f => f.name === `${date}.md`);

  if (!file) {
    throw new Error('Date not found');
  }

  return processFiles([file]);
}

async function processFiles(files: GitHubFile[]): Promise<Record<string, LanguageGroup[]>> {
  const repositories: Record<string, LanguageGroup[]> = {};

  const results = await Promise.all(
    files.map(async file => {
      const content = await fetch(file.download_url).then(res => res.text());
      const languageGroups = parseMdToLanguageGroups(content);
      const day = file.name.replace('.md', '').split('-')[2];
      return { day, languageGroups };
    })
  );

  results.forEach(({ day, languageGroups }) => {
    if (languageGroups.length > 0) {
      repositories[day] = languageGroups;
    }
  });

  return repositories;
}

function parseNumber(str: string): number {
  const match = str.match(/[\d,]+/);
  return match ? parseInt(match[0].replace(/,/g, '')) : 0;
}

function parseTableRow(line: string): Repository | null {
  const columns = line.split('|').map(col => col.trim()).filter(Boolean);
  if (columns.length < 6) return null;

  const repoMatch = columns[1].match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (!repoMatch) return null;

  const todayMatch = columns[5].match(/(\d+)\s+stars?\s+today/i);

  return {
    rank: parseInt(columns[0]) || 0,
    repo: repoMatch[1].trim(),
    desc: columns[2].trim() || 'No description',
    stars: parseNumber(columns[3]),
    forks: parseNumber(columns[4]),
    today: todayMatch ? parseInt(todayMatch[1]) : 0,
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
      if (currentRepos.length > 0) {
        languageGroups.push({ language: currentLanguage, repos: currentRepos });
      }
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

  if (currentRepos.length > 0) {
    languageGroups.push({ language: currentLanguage, repos: currentRepos });
  }

  return languageGroups;
}
