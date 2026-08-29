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

export function formatNumber(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString('en-US');
}

export function slugify(text: string): string {
  if (text.toLowerCase().trim() === 'c++') return 'cpp';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
