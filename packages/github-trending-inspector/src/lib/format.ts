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

export function formatNumber(
  value: NumberLike,
  locale: string = DEFAULT_LOCALE
): string {
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
