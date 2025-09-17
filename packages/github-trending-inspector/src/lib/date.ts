export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
export const ISO_MONTH_REGEX = /^\d{4}-\d{2}$/

export function isValidIsoDate (date: string): boolean {
  if (!ISO_DATE_REGEX.test(date)) return false

  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)

  return (
    dt.getFullYear() === y &&
    dt.getMonth() === m - 1 &&
    dt.getDate() === d
  )
}

export function todayIso (): string {
  // sv-SE → YYYY-MM-DD
  return new Date().toLocaleDateString('sv-SE')
}
