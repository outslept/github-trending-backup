import type {
  LanguageGroup,
  Repository,
  GitHubFile,
} from '../../src/lib/types';

export interface FetchMonthDataResult {
  repositories: Record<string, LanguageGroup[]>;
  totalFiles: number;
  currentPage: number;
  totalPages: number;
}

export interface FetchMetadataResult {
  availableDates: string[];
  totalDays: number;
}

export async function fetchMonthData(
  month: string,
  page = 1,
  limit = 5,
  specificDate?: string,
): Promise<FetchMonthDataResult> {
  const [year, monthNum] = month.split('-');
  const response = await fetch(
    `https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year}/${monthNum}`,
  );

  if (!response.ok) {
    throw new Error('Month not found');
  }

  const allFiles = (await response.json()) as GitHubFile[];
  const files = allFiles.filter((file) => file.name.endsWith('.md'));

  const mdFiles = specificDate
    ? files.filter((file) => file.name === `${specificDate}.md`)
    : files.slice((page - 1) * limit, page * limit);

  if (specificDate && !mdFiles.length) {
    throw new Error('Date not found');
  }

  const repositories: Record<string, LanguageGroup[]> = {};

  for (const file of mdFiles) {
    const content = await fetch(file.download_url).then((res) => res.text());
    const languageGroups = parseMdToLanguageGroups(content);

    if (languageGroups.length > 0) {
      repositories[file.name.replace('.md', '').split('-')[2]] = languageGroups;
    }
  }

  return {
    repositories,
    totalFiles: files.length,
    currentPage: page,
    totalPages: Math.ceil(files.length / limit),
  };
}

export async function fetchMetadata(
  month: string,
): Promise<FetchMetadataResult> {
  const [year, monthNum] = month.split('-');

  try {
    const response = await fetch(
      `https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year}/${monthNum}`,
    );

    if (!response.ok) {
      return { availableDates: [], totalDays: 0 };
    }

    const allFiles = (await response.json()) as GitHubFile[];
    const files = allFiles.filter((file) => file.name.endsWith('.md'));

    return {
      availableDates: files
        .map((file) => file.name.replace('.md', '').split('-')[2])
        .sort(),
      totalDays: files.length,
    };
  } catch {
    return { availableDates: [], totalDays: 0 };
  }
}

const parseMdToLanguageGroups = (mdContent: string): LanguageGroup[] => {
  const languageGroups: LanguageGroup[] = [];
  let currentLanguage = 'Unknown';
  let currentRepos: Repository[] = [];
  let inTable = false;

  for (const line of mdContent.split('\n')) {
    const trimmedLine = line.trim();

    if (
      trimmedLine.startsWith('## ') &&
      !trimmedLine.includes('Table of Contents')
    ) {
      if (currentRepos.length > 0) {
        languageGroups.push({ language: currentLanguage, repos: currentRepos });
      }
      currentLanguage = trimmedLine.replace('## ', '').trim();
      currentRepos = [];
      inTable = false;
      continue;
    }

    if (!inTable && trimmedLine.startsWith('| # | Repository |')) {
      inTable = true;
      continue;
    }

    if (inTable && trimmedLine.startsWith('| ') && trimmedLine.endsWith(' |')) {
      const columns = trimmedLine
        .split('|')
        .map((col) => col.trim())
        .filter(Boolean);
      if (columns.length < 6) continue;

      const repoMatch = columns[1].match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (!repoMatch) continue;

      const starsMatch = columns[3].match(/[\d,]+/);
      const forksMatch = columns[4].match(/[\d,]+/);
      const todayMatch = columns[5].match(/(\d+)\s+stars?\s+today/i);

      currentRepos.push({
        rank: Number.parseInt(columns[0]) || currentRepos.length + 1,
        repo: repoMatch[1].trim(),
        desc: columns[2].trim() || 'No description',
        stars: starsMatch
          ? Number.parseInt(starsMatch[0].replace(/,/g, ''))
          : 0,
        forks: forksMatch
          ? Number.parseInt(forksMatch[0].replace(/,/g, ''))
          : 0,
        today: todayMatch ? Number.parseInt(todayMatch[1]) : 0,
      });
    }

    if (inTable && (!trimmedLine || trimmedLine.startsWith('#'))) {
      inTable = false;
    }
  }

  if (currentRepos.length > 0) {
    languageGroups.push({ language: currentLanguage, repos: currentRepos });
  }

  return languageGroups;
};
