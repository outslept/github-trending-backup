import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'node-html-parser';

const TRENDING_URL = 'https://github.com/trending';
const TRENDING_PREFIX = '/trending/';
const OUTPUT_PATH = join(import.meta.dirname, 'src', 'github-languages.ts');

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html',
};

const REQUEST_TIMEOUT_MS = 30_000;
const WHITESPACE_RE = /\s+/g;

function extractSlug(href: string): string | undefined {
  if (!href.startsWith(TRENDING_PREFIX)) return undefined;

  const start = TRENDING_PREFIX.length;
  let end = start;

  while (end < href.length) {
    const ch = href.charCodeAt(end);
    // Stop at '/' (47), '?' (63), or '#' (35)
    if (ch === 47 || ch === 63 || ch === 35) break;
    end++;
  }

  return end > start ? href.slice(start, end) : undefined;
}

async function fetchLanguages(): Promise<Map<string, string>> {
  console.log('info: fetching languages');

  const response = await fetch(TRENDING_URL, {
    headers: DEFAULT_HEADERS,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();
  const root = parse(html);

  const menu = root.querySelector('#languages-menuitems');
  const links = menu ? menu.querySelectorAll('a[role="menuitemradio"]') : [];

  if (links.length === 0) {
    throw new Error('language menu not found');
  }

  const languages = new Map<string, string>();

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const href = link.getAttribute('href');
    if (!href) continue;

    const slug = extractSlug(href);
    if (!slug) continue;

    const rawText = link.querySelector('[data-menu-button-text]')?.textContent;
    if (!rawText) continue;

    const trimmed = rawText.trim();
    if (!trimmed) continue;

    const text = trimmed.replace(WHITESPACE_RE, ' ');
    const name = text === 'Unknown languages' ? 'Unknown' : text;

    languages.set(name, slug);
  }

  console.log(`info: parsed ${languages.size} languages`);

  return languages;
}

function generateSource(languages: ReadonlyMap<string, string>): string {
  const entries: string[] = [];

  for (const [name, slug] of languages) {
    entries.push(`  ${JSON.stringify(name)}: ${JSON.stringify(slug)},`);
  }

  return `export const LanguageSlugs = {
${entries.join('\n')}
} as const;

export type GitHubLanguage = keyof typeof LanguageSlugs;
`;
}

const languages = await fetchLanguages();
const source = generateSource(languages);

writeFileSync(OUTPUT_PATH, source, 'utf8');

console.log(`info: updated ${OUTPUT_PATH}`);
