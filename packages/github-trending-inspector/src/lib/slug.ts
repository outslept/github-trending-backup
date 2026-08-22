export function slugify(text: string): string {
  if (text.toLowerCase().trim() === 'c++') return 'cpp'

  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
