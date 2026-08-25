import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(date: string): boolean {
  if (!ISO_DATE_REGEX.test(date)) return false;

  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);

  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

export function todayIso(): string {
  return new Date().toLocaleDateString('sv-SE');
}

export function formatHumanDate(iso: string): string {
  if (!ISO_DATE_REGEX.test(iso)) return iso;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type NumberLike = number | string | null | undefined;

const DEFAULT_LOCALE = 'en-US';

function validateAndParseNumber(value: NumberLike): number {
  if (value == null) {
    return 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return 0;

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function formatNumber(value: NumberLike, locale: string = DEFAULT_LOCALE): string {
  const num = validateAndParseNumber(value);

  if (num === 0) {
    return '0';
  }

  try {
    return num.toLocaleString(locale);
  } catch {
    return num.toLocaleString(DEFAULT_LOCALE);
  }
}

export function slugify(text: string): string {
  if (text.toLowerCase().trim() === 'c++') return 'cpp';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
