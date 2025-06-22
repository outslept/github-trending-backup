/* eslint-disable unicorn/prefer-string-replace-all */

import { cache } from "./cache";
import type { LanguageGroup, Repository } from "./types";

interface CacheEntry<T = unknown> {
  data: T;
  _cachedAt: number;
}

interface GitHubFile {
  name: string;
  download_url: string;
}

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

export interface CacheStats {
  size: number;
  maxSize: number;
  keys: string[];
}

const isToday = (dateStr: string): boolean => {
  const today = new Date();
  const utcToday = new Date(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const targetDate = new Date(dateStr);
  return targetDate.getTime() === utcToday.getTime();
};

const getCacheKey = (
  month: string,
  page: number,
  limit: number,
  specificDate?: string,
): string => `${month}-${page}-${limit}-${specificDate || "all"}`;

const shouldRefreshTodayCache = (cachedAt: number): boolean => {
  const utcHour = new Date().getUTCHours();
  const hoursSinceCache = (Date.now() - cachedAt) / (1000 * 60 * 60);

  if (utcHour < 1) return false;
  if (utcHour >= 1 && utcHour < 5) return hoursSinceCache > 1.5;
  return hoursSinceCache > 3;
};

export async function fetchMonthData(
  month: string,
  page = 1,
  limit = 5,
  specificDate?: string,
): Promise<FetchMonthDataResult> {
  const cacheKey = getCacheKey(month, page, limit, specificDate);

  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey) as CacheEntry<FetchMonthDataResult>;

    if (specificDate && isToday(specificDate)) {
      const cacheTime = cached._cachedAt || 0;

      if (!shouldRefreshTodayCache(cacheTime)) {
        return cached.data;
      } else {
        cache.delete(cacheKey);
      }
    } else {
      return cached.data;
    }
  }

  const monthCacheKey = `month-files-${month}`;
  let files: GitHubFile[];

  if (cache.has(monthCacheKey)) {
    files = cache.get(monthCacheKey) as GitHubFile[];
  } else {
    const [year, monthNum] = month.split("-");
    const response = await fetch(
      `https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year}/${monthNum}`,
    );

    if (!response.ok) {
      throw new Error("Month not found");
    }

    const allFiles = (await response.json()) as GitHubFile[];
    files = allFiles.filter((file) => file.name.endsWith(".md"));

    cache.set(monthCacheKey, files);
  }

  const mdFiles = specificDate
    ? files.filter((file) => file.name === `${specificDate}.md`)
    : files.slice((page - 1) * limit, page * limit);

  if (specificDate && !mdFiles.length) {
    throw new Error("Date not found");
  }

  const repositories: Record<string, LanguageGroup[]> = {};

  for (const file of mdFiles) {
    const content = await fetch(file.download_url).then((res) => res.text());
    const languageGroups = parseMdToLanguageGroups(content);

    if (languageGroups.length > 0) {
      repositories[file.name.replace(".md", "").split("-")[2]] = languageGroups;
    }
  }

  const result: FetchMonthDataResult = {
    repositories,
    totalFiles: files.length,
    currentPage: page,
    totalPages: Math.ceil(files.length / limit),
  };

  const isHistorical = specificDate ? !isToday(specificDate) : true;
  const maxAge = isHistorical ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000;

  cache.set(
    cacheKey,
    {
      data: result,
      _cachedAt: Date.now(),
    } as CacheEntry<FetchMonthDataResult>,
    { maxAge },
  );

  return result;
}

export async function fetchMetadata(
  month: string,
): Promise<FetchMetadataResult> {
  const cacheKey = `metadata-${month}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as FetchMetadataResult;
  }

  const monthCacheKey = `month-files-${month}`;

  if (cache.has(monthCacheKey)) {
    const files = cache.get(monthCacheKey) as GitHubFile[];
    const result: FetchMetadataResult = {
      availableDates: files
        .map((file) => file.name.replace(".md", "").split("-")[2])
        .sort(),
      totalDays: files.length,
    };

    cache.set(cacheKey, result, { maxAge: 60 * 60 * 1000 });
    return result;
  }

  const [year, monthNum] = month.split("-");

  try {
    const response = await fetch(
      `https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year}/${monthNum}`,
    );

    if (!response.ok) {
      const result: FetchMetadataResult = { availableDates: [], totalDays: 0 };
      cache.set(cacheKey, result, { maxAge: 5 * 60 * 1000 });
      return result;
    }

    const allFiles = (await response.json()) as GitHubFile[];
    const files = allFiles.filter((file) => file.name.endsWith(".md"));

    cache.set(monthCacheKey, files);

    const result: FetchMetadataResult = {
      availableDates: files
        .map((file) => file.name.replace(".md", "").split("-")[2])
        .sort(),
      totalDays: files.length,
    };

    cache.set(cacheKey, result, { maxAge: 60 * 60 * 1000 });
    return result;
  } catch {
    const result: FetchMetadataResult = { availableDates: [], totalDays: 0 };
    cache.set(cacheKey, result, { maxAge: 5 * 60 * 1000 });
    return result;
  }
}

const parseMdToLanguageGroups = (mdContent: string): LanguageGroup[] => {
  const languageGroups: LanguageGroup[] = [];
  let currentLanguage = "Unknown";
  let currentRepos: Repository[] = [];
  let inTable = false;

  for (const line of mdContent.split("\n")) {
    const trimmedLine = line.trim();

    if (
      trimmedLine.startsWith("## ") &&
      !trimmedLine.includes("Table of Contents")
    ) {
      if (currentRepos.length > 0) {
        languageGroups.push({ language: currentLanguage, repos: currentRepos });
      }
      currentLanguage = trimmedLine.replace("## ", "").trim();
      currentRepos = [];
      inTable = false;
      continue;
    }

    if (!inTable && trimmedLine.startsWith("| # | Repository |")) {
      inTable = true;
      continue;
    }

    if (inTable && trimmedLine.startsWith("| ") && trimmedLine.endsWith(" |")) {
      const columns = trimmedLine
        .split("|")
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
        desc: columns[2].trim() || "No description",
        stars: starsMatch
          ? Number.parseInt(starsMatch[0].replace(/,/g, ""))
          : 0,
        forks: forksMatch
          ? Number.parseInt(forksMatch[0].replace(/,/g, ""))
          : 0,
        today: todayMatch ? Number.parseInt(todayMatch[1]) : 0,
      });
    }

    if (inTable && (!trimmedLine || trimmedLine.startsWith("#"))) {
      inTable = false;
    }
  }

  if (currentRepos.length > 0) {
    languageGroups.push({ language: currentLanguage, repos: currentRepos });
  }

  return languageGroups;
};

export const clearCache = (): void => cache.clear();

export const getCacheStats = (): CacheStats => ({
  size: cache.getSize(),
  maxSize: cache.getMaxSize(),
  keys: cache.keys(),
});
