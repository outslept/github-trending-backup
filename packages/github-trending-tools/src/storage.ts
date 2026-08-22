import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageGroup, MetadataFile, TrendingMonthData } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const DEFAULT_DATA_ROOT = join(repoRoot, 'packages', 'github-trending-data');
export const DATA_ROOT = process.env.GITHUB_TRENDING_DATA_DIR ?? DEFAULT_DATA_ROOT;

export function resolveMonthFilePath(month: string, dataRoot: string = DATA_ROOT): string {
  const year = month.slice(0, 4);
  return join(dataRoot, year, `${month}.json`);
}

export function resolveMetadataPath(dataRoot: string = DATA_ROOT): string {
  return join(dataRoot, 'metadata.json');
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  if (!existsSync(filePath)) return fallback;
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as T;
  } catch {
    console.warn(`warn: invalid JSON in ${filePath}, using fallback`);
    return fallback;
  }
}

function writeJsonFile(filePath: string, data: unknown): void {
  const outputDir = dirname(filePath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function loadMonthData(month: string): TrendingMonthData {
  const filePath = resolveMonthFilePath(month);
  return readJsonFile<TrendingMonthData>(filePath, { month, days: {} });
}

export function saveMonthData(month: string, groups: LanguageGroup[]): void {
  const filePath = resolveMonthFilePath(month);
  const data = loadMonthData(month);

  const day = new Date().toISOString().slice(8, 10);
  data.month = month;
  data.days[day] = groups;

  writeJsonFile(filePath, data);
}

export function loadMetadata(): MetadataFile {
  return readJsonFile<MetadataFile>(resolveMetadataPath(), {
    lastUpdated: new Date().toISOString().slice(0, 10),
    years: {},
  });
}

export function saveMetadata(metadata: MetadataFile): void {
  writeJsonFile(resolveMetadataPath(), metadata);
}

export function updateMetadata(month: string, day: string): void {
  const metadata = loadMetadata();
  const year = month.slice(0, 4);
  const monthKey = month.slice(5);

  const yearData = metadata.years[year] ?? {};
  metadata.years[year] = yearData;

  const monthData = yearData[monthKey] ?? [];
  yearData[monthKey] = monthData;

  if (!monthData.includes(day)) {
    monthData.push(day);
    monthData.sort();
  }

  metadata.lastUpdated = `${month}-${day}`;
  saveMetadata(metadata);
}
