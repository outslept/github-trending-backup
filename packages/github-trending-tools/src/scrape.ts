import { parse, type HTMLElement } from 'node-html-parser';
import { LanguageSlugs, type GitHubLanguage } from './github-languages.js';

export interface TrendingRepo {
  rank: number;
  title: string;
  url: string;
  description: string;
  stars: number | null;
  forks: number | null;
  todayStars: number | null;
}

export interface LanguageReport {
  language: GitHubLanguage;
  repositories: TrendingRepo[];
  success: boolean;
  error?: string;
}

const ROW_SELECTOR = 'article.Box-row, .Box-row';
const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
  Accept: '*/*',
};
const REQUEST_TIMEOUT_MS = 30_000;
const RETRY_LIMIT = 5;
const BACKOFF_BETWEEN_RETRIES_MS = 5_000;
const PAUSE_BETWEEN_LANGUAGES_MS = 5_000;

class HttpError extends Error {
  retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.retryable = retryable;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildTrendingUrl(language: GitHubLanguage) {
  return `https://github.com/trending/${LanguageSlugs[language]}`;
} 

function parseNumber(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === '—' || trimmed === '-') return null;

  const multipliers: Record<string, number> = {
    k: 1_000,
    m: 1_000_000,
    b: 1_000_000_000,
  };

  const match = /^([\d.,]+)\s*([kmb]?)$/i.exec(trimmed);
  if (!match) return null;

  const raw = match[1]!.replace(/,/g, '');
  const number = Number(raw);
  if (!Number.isFinite(number)) return null;

  const multiplier = match[2] ? multipliers[match[2].toLowerCase()] : 1;
  if (!multiplier) return null;

  return Math.round(number * multiplier);
}

function parseTodayStars(row: HTMLElement) {
  const starText = Array.from(row.querySelectorAll('span'))
    .map((span) => span.text.trim())
    .find((text) => /stars?\s+today/i.test(text));

  if (!starText) return null;

  const match = /([\d.,]+)\s+stars?\s+today/i.exec(starText);
  return match ? parseNumber(match[1]) : null;
}

function parseRepositoryRow(row: HTMLElement) {
  const link = row.querySelector('h2 a');
  const href = link?.getAttribute('href');
  if (!href) return null;

  const description =
    row.querySelector('p')?.text.trim().replace(/\s+/g, ' ') ?? 'No description';

  const starsElement = row.querySelector('a[href*="/stargazers"]');
  const forksElement = row.querySelector('a[href*="/network/members"]');

  const stars = parseNumber(starsElement?.text.trim());
  const forks = parseNumber(forksElement?.text.trim());

  return {
    title: href.replace(/^\//, '').replace(/\s+/g, ''),
    url: `https://github.com${href}`,
    description,
    stars,
    forks,
    todayStars: parseTodayStars(row),
  };
}

function extractRepositoriesFrom(html: string) {
  const root = parse(html);
  const rows = root.querySelectorAll(ROW_SELECTOR);

  const parsedRows = rows
    .map(parseRepositoryRow)
    .filter((row): row is Omit<TrendingRepo, 'rank'> => row !== null);

  return parsedRows.map((row, index) => ({ ...row, rank: index + 1 }));
}

async function fetchHtmlWithRetry(url: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt < RETRY_LIMIT; attempt++) {
    if (attempt > 0) await delay(BACKOFF_BETWEEN_RETRIES_MS);

    try {
      const response = await fetch(url, {
        headers: DEFAULT_HEADERS,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        throw new HttpError(`HTTP ${response.status} ${response.statusText}`, retryable);
      }

      return await response.text();
    } catch (error) {
      if (error instanceof HttpError && !error.retryable) throw error;

      lastError = error;
      console.warn(
        `warn: attempt ${attempt + 1}/${RETRY_LIMIT} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const detail =
    lastError instanceof Error ? lastError.message : String(lastError ?? 'Unknown error');
  throw new Error(`Failed to fetch ${url} after ${RETRY_LIMIT} attempts. Last error: ${detail}`);
}

async function scrapeTrendingForLanguage(language: GitHubLanguage) {
  console.log(`info: scraping ${language}`);

  try {
    const url = buildTrendingUrl(language);
    const html = await fetchHtmlWithRetry(url);
    const repositories = extractRepositoriesFrom(html);

    if (repositories.length === 0) {
      throw new Error('No repository rows found in HTML');
    }

    console.log(`info: found ${repositories.length} repositories for ${language}`);

    return { language, repositories, success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`error: failed to scrape ${language}: ${message}`);
    return { language, repositories: [], success: false, error: message };
  } finally {
    await delay(PAUSE_BETWEEN_LANGUAGES_MS);
  }
}

export async function scrapeTrendingForAll(languages: GitHubLanguage[]) {
  console.log(`info: starting scraper for ${languages.length} languages`);
  const reports: LanguageReport[] = [];

  for (const [index, language] of languages.entries()) {
    const report = await scrapeTrendingForLanguage(language);
    reports.push(report);
    console.log(`info: progress ${index + 1}/${languages.length}`);
  }

  return reports;
}
