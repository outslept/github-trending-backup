import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'node-html-parser';

const TRENDING_URL = 'https://github.com/trending';
const OUTPUT_PATH = join(import.meta.dirname, 'src', 'github-languages.ts');

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html',
};

const REQUEST_TIMEOUT_MS = 30_000;

async function fetchLanguages() {
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

  const links = root.querySelectorAll('#languages-menuitems a[role="menuitemradio"]');

  if (links.length === 0) {
    throw new Error('language menu not found');
  }

  const languages = new Map<string, string>();

  for (const link of links) {
    const href = link.getAttribute('href');

    if (!href) continue;

    const match = /^\/trending\/([^/?#]+)/.exec(href);

    if (!match) continue;

    const text = link
      .querySelector('[data-menu-button-text]')
      ?.textContent.trim()
      .replace(/\s+/g, ' ');

    if (!text) continue;

    const name = text === 'Unknown languages' ? 'Unknown' : text;

    languages.set(name, match[1]);
  }

  console.log(`info: parsed ${languages.size} languages`);

  return [...languages.entries()];
}

function generateSource(languages: [string, string][]) {
  const entries = languages.map(
    ([name, slug]) => `  ${JSON.stringify(name)}: ${JSON.stringify(slug)},`,
  );

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
