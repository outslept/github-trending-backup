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

const NUMBER_RE = /^([\d.,]+)\s*([kmb]?)$/i;
const STARS_TODAY_RE = /([\d.,]+)\s+stars?\s+today/i;
const WHITESPACE_RE = /\s+/g;

const MULTIPLIERS: Readonly<Record<string, number>> = {
  k: 1e3,
  m: 1e6,
  b: 1e9,
};

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function parseNumber(value: string | null | undefined): number | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed === '—' || trimmed === '-') return null;

  const match = NUMBER_RE.exec(trimmed);
  if (!match) return null;

  const raw = match[1]!.replaceAll(',', '');
  const number = Number(raw);
  if (!Number.isFinite(number)) return null;

  const suffix = match[2]!.toLowerCase();
  const multiplier = MULTIPLIERS[suffix] ?? 1;

  return Math.round(number * multiplier);
}

function parseTodayStars(row: HTMLElement): number | null {
  const spans = row.querySelectorAll('span');

  for (let i = 0; i < spans.length; i++) {
    const match = STARS_TODAY_RE.exec(spans[i]!.textContent);
    if (match) return parseNumber(match[1]);
  }

  return null;
}

function parseRepositoryRow(row: HTMLElement, rank: number): Repository | null {
  const link = row.querySelector('h2 a');
  const href = link?.getAttribute('href');
  if (!href) return null;

  const repo = href.startsWith('/') ? href.slice(1) : href;
  const rawDesc = row.querySelector('p')?.textContent.trim();
  const desc = rawDesc ? rawDesc.replace(WHITESPACE_RE, ' ') : 'No description';

  const starsEl = row.querySelector('a[href*="/stargazers"]');
  const forksEl = row.querySelector('a[href*="/forks"]');

  return {
    rank,
    repo,
    desc,
    stars: parseNumber(starsEl?.textContent),
    forks: parseNumber(forksEl?.textContent),
    today: parseTodayStars(row),
  };
}

function extractRepositories(html: string): Repository[] {
  const root = parse(html);
  const rows = root.querySelectorAll('.Box-row');
  const repos: Repository[] = [];

  for (let i = 0; i < rows.length; i++) {
    const parsed = parseRepositoryRow(rows[i]!, repos.length + 1);
    if (parsed) repos.push(parsed);
  }

  return repos;
}

async function fetchWithRetry(url: string): Promise<string> {
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

async function scrapeTrending(language: GitHubLanguage): Promise<LanguageGroup> {
  const url = `https://github.com/trending/${LanguageSlugs[language]}`;
  const html = await fetchWithRetry(url);
  const repos = extractRepositories(html);

  if (repos.length === 0) throw new Error('no rows found');

  return { language, repos };
}

export async function scrapeTrendingForAll(
  languages: readonly GitHubLanguage[],
): Promise<LanguageGroup[]> {
  const groups: LanguageGroup[] = [];

  for (let i = 0; i < languages.length; i++) {
    const lang = languages[i]!;
    console.log(`info: [${i + 1}/${languages.length}] scraping ${lang}`);

    try {
      const group = await scrapeTrending(lang);
      groups.push(group);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`error: ${lang}: ${message}`);
    }

    if (i < languages.length - 1) {
      await delay(PAUSE_MS);
    }
  }

  return groups;
}
