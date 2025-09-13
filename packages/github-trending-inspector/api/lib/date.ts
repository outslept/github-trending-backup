export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const ISO_MONTH_REGEX = /^\d{4}-\d{2}$/;

export function monthFrom(date: string): string {
  // "YYYY-MM-DD" -> "YYYY-MM"
  return date.slice(0, 7);
}