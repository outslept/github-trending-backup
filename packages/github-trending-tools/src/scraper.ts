import { parse } from "node-html-parser";
import { GitHubLanguages } from "./constant";

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

interface Config {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  concurrency: number;
}

async function fetchWithRetry(url: string, config: Config): Promise<string> {
  const options: RequestInit = {
    signal: AbortSignal.timeout(30000),
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Cache-Control": "no-cache",
    },
  };

  let lastError: Error;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.min(
            config.baseDelay * 2 ** (attempt - 1) + Math.random() * 1000,
            config.maxDelay,
          ),
        ),
      );
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`Status: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Attempt ${attempt + 1} failed: ${lastError.message}`);
    }
  }

  throw new Error(
    `Failed to fetch ${url} after ${config.maxRetries} attempts. Last error: ${lastError!.message}`,
  );
}

async function scrapeLanguage(
  language: GitHubLanguage,
  config: Config,
): Promise<ScrapingResult> {
  try {
    const html = await fetchWithRetry(
      `https://github.com/trending/${GitHubLanguages[language]}`,
      config,
    );
    const root = parse(html);

    const repositories: Repository[] = root
      .querySelectorAll(".Box-row")
      .map((row, index) => {
        const titleElement = row.querySelector("h2 a");
        const href = titleElement?.getAttribute("href");
        if (!href) return null;

        const statLinks = row.querySelectorAll(
          "a.Link--muted.d-inline-block.mr-3",
        );
        const getStat = (type: string) =>
          Array.from(statLinks)
            .find(
              (link: any) =>
                link.querySelector("svg")?.getAttribute("aria-label") === type,
            )
            ?.text?.trim() || "0";

        return {
          rank: index + 1,
          title: href.slice(1).replaceAll(/\s/g, ""),
          url: `https://github.com${href}`,
          description:
            row.querySelector("p.col-9")?.text?.trim() || "No description",
          stars: getStat("star"),
          forks: getStat("fork"),
          todayStars:
            row
              .querySelector("span.d-inline-block.float-sm-right")
              ?.text?.trim() || "N/A",
        };
      })
      .filter((repo): repo is Repository => repo !== null);

    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 500),
    );
    return { language, repositories, success: true };
  } catch (error) {
    return {
      language,
      repositories: [],
      success: false,
      error: String(error),
    };
  }
}

export async function scrapeLanguages(
  languages: GitHubLanguage[],
  config: Config,
): Promise<ScrapingResult[]> {
  const results: ScrapingResult[] = [];

  for (let i = 0; i < languages.length; i += config.concurrency) {
    const batchResults = await Promise.all(
      languages
        .slice(i, i + config.concurrency)
        .map((language) => scrapeLanguage(language, config)),
    );
    results.push(...batchResults);
  }

  return results;
}
