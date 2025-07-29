import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';

import { parse } from 'node-html-parser';

import { GitHubLanguages } from './constant.js';

export type GitHubLanguage = keyof typeof GitHubLanguages;

interface Repository {
  rank: number;
  title: string;
  url: string;
  description: string;
  stars: string;
  forks: string;
  todayStars: string;
}

interface ScrapingResult {
  language: GitHubLanguage;
  repositories: Repository[];
  success: boolean;
  error?: string;
}

const LANGUAGES: GitHubLanguage[] = [
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

async function fetchWithRetry(url: string): Promise<string> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
          Accept: '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`Status: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`warn: attempt ${attempt + 1} failed: ${lastError.message}`);
    }
  }

  throw new Error(
    `Failed to fetch ${url} after 5 attempts. Last error: ${lastError?.message ?? 'Unknown error'}`,
  );
}

async function scrapeLanguage(
  language: GitHubLanguage,
): Promise<ScrapingResult> {
  console.log(`info: scraping ${language}`);

  try {
    const html = await fetchWithRetry(
      `https://github.com/trending/${GitHubLanguages[language]}`,
    );
    const root = parse(html);

    const repositories: Repository[] = root
      .querySelectorAll('.Box-row')
      .flatMap((row, index) => {
        const href = row.querySelector('h2 a')?.getAttribute('href');
        if (href === undefined) return [];

        const statLinks = row.querySelectorAll(
          'a.Link--muted.d-inline-block.mr-3',
        );
        const getStat = (type: string): string =>
          Array.from(statLinks)
            .find(
              (link) =>
                link.querySelector('svg')?.getAttribute('aria-label') === type,
            )
            ?.text.trim() ?? '0';

        return [
          {
            rank: index + 1,
            title: href.slice(1).replaceAll(/\s/g, ''),
            url: `https://github.com${href}`,
            description:
              row.querySelector('p.col-9')?.text.trim() ?? 'No description',
            stars: getStat('star'),
            forks: getStat('fork'),
            todayStars:
              row
                .querySelector('span.d-inline-block.float-sm-right')
                ?.text.trim() ?? 'N/A',
          },
        ];
      });

    console.log(
      `info: found ${repositories.length} repositories for ${language}`,
    );

    await new Promise((resolve) => setTimeout(resolve, 5000));
    return { language, repositories, success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`error: failed to scrape ${language}: ${errorMessage}`);

    return {
      language,
      repositories: [],
      success: false,
      error: errorMessage,
    };
  }
}

async function scrapeLanguages(
  languages: GitHubLanguage[],
): Promise<ScrapingResult[]> {
  console.log(`info: starting scraper for ${languages.length} languages`);

  const results: ScrapingResult[] = [];

  for (const [index, language] of languages.entries()) {
    const result = await scrapeLanguage(language);
    results.push(result);
    console.log(`info: progress ${index + 1}/${languages.length}`);
  }

  return results;
}

function formatToMarkdown(results: ScrapingResult[], date: string): string {
  const createAnchor = (text: string): string =>
    text.toLowerCase().replace(/\W/g, '-');

  const formatSection = (result: ScrapingResult): string => {
    if (!result.success) {
      return `## ${result.language}\n\nFailed to scrape: ${result.error ?? 'Unknown error'}\n`;
    }

    return result.repositories.length === 0
      ? `## ${result.language}\n\nNo trending repositories found.\n`
      : `## ${result.language}\n\n| # | Repository | Description | Stars | Forks | Today |\n| --- | --- | --- | --- | --- | --- |\n${result.repositories
          .map(
            (repo) =>
              `| ${repo.rank} | [${repo.title}](${repo.url}) | ${
                repo.description.length > 100
                  ? `${repo.description.slice(0, 97)}...`
                  : repo.description
              } | ${repo.stars} | ${repo.forks} | ${repo.todayStars} |`,
          )
          .join('\n')}\n`;
  };

  return `# GitHub Trending - ${date}\n\n## Table of Contents\n\n${results
    .map((r) => `- [${r.language}](#${createAnchor(r.language)})`)
    .join('\n')}\n\n${results.map(formatSection).join('\n')}`;
}

function findProjectRoot(path: string = process.cwd()): string {
  return existsSync(join(path, '.git')) ? path : findProjectRoot(dirname(path));
}

function getOutputPath(date: string): string {
  const outputDir = join(
    findProjectRoot(),
    'data',
    date.slice(0, 4),
    date.slice(5, 7),
  );

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  return join(outputDir, `${date}.md`);
}

async function main() {
  const date = new Date().toISOString().slice(0, 10);
  console.log(`info: starting github trending scraper for ${date}`);

  const results = await scrapeLanguages(LANGUAGES);

  const outputPath = getOutputPath(date);
  writeFileSync(outputPath, formatToMarkdown(results, date), 'utf8');
  console.log(`info: saved report to ${outputPath}`);

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(
    `info: completed ${successful.length}/${results.length} languages`,
  );

  if (failed.length) {
    console.error(
      `error: failed languages: ${failed.map((r) => r.language).join(', ')}`,
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(
    `error: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
