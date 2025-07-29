export function formatNumber(value: unknown): string {
  if (value == null) {
    return '0';
  }

  const num = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(num)) {
    return '0';
  }

  return num.toLocaleString();
}

export function getNumberValue(value: unknown): number {
  if (value == null) {
    return 0;
  }

  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
}
