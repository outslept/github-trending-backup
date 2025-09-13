import { parse } from 'node-html-parser';
import { LanguageSlugs } from './github-languages.js';

export type GitHubLanguage = keyof typeof LanguageSlugs;

interface TrendingRepo {
 rank: number;
 title: string;
 url: string;
 description: string;
 stars: string;
 forks: string;
 todayStars: string;
}

export interface LanguageReport {
 language: GitHubLanguage;
 repositories: TrendingRepo[];
 success: boolean;
 error?: string;
}

const DEFAULT_HEADERS = {
 'User-Agent':
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
 Accept: '*/*',
};

const REQUEST_TIMEOUT_MS = 30_000;
const RETRY_LIMIT = 5;
const BACKOFF_BETWEEN_RETRIES_MS = 5_000;
const PAUSE_BETWEEN_LANGUAGES_MS = 5_000;

async function scrapeTrendingForLanguage(
 language: GitHubLanguage,
): Promise<LanguageReport> {
 console.log(`info: scraping ${language}`);

 try {
  const url = `https://github.com/trending/${LanguageSlugs[language]}`;
  const html = await fetchHtmlWithRetry(url);
  const repositories = extractRepositoriesFrom(html);

  console.log(`info: found ${repositories.length} repositories for ${language}`);

  await pause(PAUSE_BETWEEN_LANGUAGES_MS);
  return { language, repositories, success: true };
 } catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`error: failed to scrape ${language}: ${message}`);
  return { language, repositories: [], success: false, error: message };
 }
}

export async function scrapeTrendingForAll(
 languages: GitHubLanguage[],
): Promise<LanguageReport[]> {
 console.log(`info: starting scraper for ${languages.length} languages`);
 const reports: LanguageReport[] = [];

 for (const [index, language] of languages.entries()) {
  const report = await scrapeTrendingForLanguage(language);
  reports.push(report);
  console.log(`info: progress ${index + 1}/${languages.length}`);
 }

 return reports;
}

async function fetchHtmlWithRetry(url: string): Promise<string> {
 let lastError: unknown;

 for (let attempt = 0; attempt < RETRY_LIMIT; attempt++) {
  if (attempt > 0) {
   await pause(BACKOFF_BETWEEN_RETRIES_MS);
  }

  try {
   const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: DEFAULT_HEADERS,
   });

   if (!response.ok) {
    throw new Error(`Status: ${response.status} ${response.statusText}`);
   }

   return await response.text();
  } catch (error) {
   lastError = error;
   const msg = error instanceof Error ? error.message : String(error);
   console.warn(`warn: attempt ${attempt + 1} failed: ${msg}`);
  }
 }

 const detail =
  lastError instanceof Error ? lastError.message : String(lastError ?? 'Unknown error');
 throw new Error(`Failed to fetch ${url} after ${RETRY_LIMIT} attempts. Last error: ${detail}`);
}

function extractRepositoriesFrom(html: string): TrendingRepo[] {
 const root = parse(html);

 return root
  .querySelectorAll('article.Box-row, .Box-row')
  .flatMap((row, index) => {
   const link = row.querySelector('h2 a');
   const href = link?.getAttribute('href');
   if (!href) return [];

   const description =
    row.querySelector('p')?.text.trim().replace(/\s+/g, ' ') ?? 'No description';

   const stars =
    row.querySelector('a[href$="/stargazers"]')?.text.trim() ??
    row.querySelector('a[href*="/stargazers"]')?.text.trim() ??
    '0';

   const forks =
    row.querySelector('a[href$="/forks"]')?.text.trim() ??
    row.querySelector('a[href*="/network/members"]')?.text.trim() ??
    '0';

   const todayStars =
    Array.from(row.querySelectorAll('span'))
     .map((s) => s.text.trim())
     .find((t) => /stars?\s+today/i.test(t)) ?? 'N/A';

   return [
    {
     rank: index + 1,
     title: href.slice(1).replace(/\s+/g, ''), // "owner/repo"
     url: `https://github.com${href}`,
     description,
     stars,
     forks,
     todayStars,
    },
   ];
  });
}

function pause(ms: number) {
 return new Promise((resolve) => setTimeout(resolve, ms));
}