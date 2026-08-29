import { parse, type HTMLElement } from 'node-html-parser';
import { LanguageSlugs, type GitHubLanguage } from './github-languages.js';
import type { LanguageGroup, Repository } from './types.js';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: '*/*',
};
const REQUEST_TIMEOUT_MS = 30_000;
const RETRY_LIMIT = 5;
const BACKOFF_MS = 5_000;
const PAUSE_MS = 5_000;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseNumber(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === '—' || trimmed === '-') return null;

  const match = /^([\d.,]+)\s*([kmb]?)$/i.exec(trimmed);
  if (!match) return null;

  const raw = match[1]!.replace(/,/g, '');
  const number = Number(raw);
  if (!Number.isFinite(number)) return null;

  const suffix = match[2]!.toLowerCase();
  const multiplier = ({ k: 1e3, m: 1e6, b: 1e9 } as Record<string, number>)[suffix] ?? 1;

  return Math.round(number * multiplier);
}

function parseTodayStars(row: HTMLElement) {
  const text = row
    .querySelectorAll('span')
    .find((s) => /stars?\s+today/i.test(s.textContent))?.textContent;

  const match = text && /([\d.,]+)\s+stars?\s+today/i.exec(text);
  return match ? parseNumber(match[1]) : null;
}

function parseRepositoryRow(row: HTMLElement) {
  const link = row.querySelector('h2 a');
  const href = link?.getAttribute('href');
  if (!href) return null;

  const starsEl = row.querySelector('a[href*="/stargazers"]');
  const forksEl = row.querySelector('a[href*="/forks"]');

  return {
    repo: href.replace(/^\//, ''),
    desc: row.querySelector('p')?.textContent.trim().replace(/\s+/g, ' ') ?? 'No description',
    stars: parseNumber(starsEl?.textContent.trim()),
    forks: parseNumber(forksEl?.textContent.trim()),
    today: parseTodayStars(row),
  };
}

function extractRepositories(html: string) {
  const root = parse(html);
  const rows = root.querySelectorAll('.Box-row');

  return rows.reduce<Repository[]>((acc, row) => {
    const parsed = parseRepositoryRow(row);
    if (parsed) acc.push({ ...parsed, rank: acc.length + 1 });
    return acc;
  }, []);
}

async function fetchWithRetry(url: string) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, {
        headers: DEFAULT_HEADERS,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      console.warn(`warn: attempt ${attempt}/${RETRY_LIMIT} failed`);
      if (attempt === RETRY_LIMIT) throw error;
      await delay(BACKOFF_MS);
    }
  }
}

async function scrapeTrending(language: GitHubLanguage) {
  try {
    const url = `https://github.com/trending/${LanguageSlugs[language]}`;
    const html = await fetchWithRetry(url);
    const repositories = extractRepositories(html);

    if (repositories.length === 0) throw new Error('no rows found');

    return { language, repos: repositories };
  } finally {
    await delay(PAUSE_MS);
  }
}

export async function scrapeTrendingForAll(languages: GitHubLanguage[]) {
  const groups: LanguageGroup[] = [];

  for (const lang of languages) {
    try {
      groups.push(await scrapeTrending(lang));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`error: ${lang}: ${message}`);
    }
  }

  return groups;
}
