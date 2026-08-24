import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageGroup, MetadataFile, TrendingMonthData } from './types.js';

function findProjectRoot(startDir: string): string {
  let currentDir = startDir;
  while (currentDir !== dirname(currentDir)) {
    if (existsSync(join(currentDir, 'pnpm-workspace.yaml'))) {
      return currentDir;
    }
    currentDir = dirname(currentDir);
  }
  return startDir;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_ROOT = join(findProjectRoot(__dirname), 'data');

const monthPath = (month: string) => join(DATA_ROOT, month.slice(0, 4), `${month}.json`);
const metadataPath = () => join(DATA_ROOT, 'metadata.json');

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    console.warn(`warn: invalid JSON in ${path}`);
    return fallback;
  }
}

function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function saveMonthData(month: string, day: string, groups: LanguageGroup[]) {
  const path = monthPath(month);
  const data = readJson<TrendingMonthData>(path, { month, days: {} });
  data.days[day] = groups;
  writeJson(path, data);
}

export function updateMetadata(month: string, day: string) {
  const path = metadataPath();
  const meta = readJson<MetadataFile>(path, { lastUpdated: '', years: {} });

  const year = month.slice(0, 4);
  const monthKey = month.slice(5, 7);

  const yearData = (meta.years[year] ??= {});
  const monthData = (yearData[monthKey] ??= []);

  if (!monthData.includes(day)) {
    monthData.push(day);
    monthData.sort();
  }

  meta.lastUpdated = `${month}-${day}`;
  writeJson(path, meta);
}
