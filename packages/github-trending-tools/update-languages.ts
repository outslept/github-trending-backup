import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const TRENDING_URL = 'https://github.com/trending';
const TRENDING_PREFIX = '/trending/';
const OUTPUT_PATH = join(import.meta.dirname, 'src', 'github-languages.ts');

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html',
};

const REQUEST_TIMEOUT_MS = 30_000;
const WHITESPACE_RE = /\s+/g;

function findContainerEnd(html: string, idIndex: number): number {
  const openBracket = html.lastIndexOf('<', idIndex);
  if (openBracket === -1) return html.length;

  let nameEnd = openBracket + 1;
  while (nameEnd < idIndex && html.charCodeAt(nameEnd) > 32 && html.charCodeAt(nameEnd) !== 62) {
    nameEnd++;
  }

  const tagName = html.slice(openBracket + 1, nameEnd);
  const openToken = `<${tagName}`;
  const closeToken = `</${tagName}`;

  let depth = 1;
  let pos = html.indexOf('>', idIndex) + 1;
  if (pos === 0) return html.length;

  while (depth > 0 && pos < html.length) {
    const nextClose = html.indexOf(closeToken, pos);
    if (nextClose === -1) return html.length;

    const nextOpen = html.indexOf(openToken, pos);
    if (nextOpen !== -1 && nextOpen < nextClose) {
      const after = html.charCodeAt(nextOpen + openToken.length);
      // Match exact tag name (followed by whitespace, '>', or '/')
      if (after <= 32 || after === 62 || after === 47) {
        depth++;
      }
      pos = nextOpen + openToken.length;
    } else {
      depth--;
      pos = nextClose + closeToken.length;
    }
  }

  return pos;
}

function parseLanguagesMenu(html: string): Map<string, string> {
  const idIndex = html.indexOf('id="languages-menuitems"');
  if (idIndex === -1) {
    throw new Error('language menu not found');
  }

  const menuEnd = findContainerEnd(html, idIndex);
  let pos = html.indexOf('>', idIndex) + 1;
  let linkCount = 0;

  const languages = new Map<string, string>();

  while (pos > 0 && pos < menuEnd) {
    const aStart = html.indexOf('<a', pos);
    if (aStart === -1 || aStart >= menuEnd) break;

    const afterA = html.charCodeAt(aStart + 2);
    if (afterA > 32 && afterA !== 62) {
      pos = aStart + 2;
      continue;
    }

    const aTagEnd = html.indexOf('>', aStart + 2);
    if (aTagEnd === -1 || aTagEnd >= menuEnd) break;

    const aClose = html.indexOf('</a>', aTagEnd + 1);
    if (aClose === -1 || aClose > menuEnd) break;
    pos = aClose + 4;

    const rolePos = html.indexOf('role="menuitemradio"', aStart + 2);
    if (rolePos === -1 || rolePos > aTagEnd) continue;

    linkCount++;

    const hrefAttr = html.indexOf('href="', aStart + 2);
    if (hrefAttr === -1 || hrefAttr > aTagEnd) continue;

    const hrefStart = hrefAttr + 6;
    const hrefEnd = html.indexOf('"', hrefStart);
    if (hrefEnd === -1 || hrefEnd > aTagEnd) continue;

    if (!html.startsWith(TRENDING_PREFIX, hrefStart)) continue;

    const slugStart = hrefStart + TRENDING_PREFIX.length;
    let slugEnd = slugStart;
    while (slugEnd < hrefEnd) {
      const ch = html.charCodeAt(slugEnd);
      // Stop at '/' (47), '?' (63), or '#' (35)
      if (ch === 47 || ch === 63 || ch === 35) break;
      slugEnd++;
    }
    if (slugEnd === slugStart) continue;

    const textMarker = html.indexOf('data-menu-button-text', aTagEnd + 1);
    if (textMarker === -1 || textMarker > aClose) continue;

    const contentStart = html.indexOf('>', textMarker + 21);
    if (contentStart === -1 || contentStart > aClose) continue;

    const contentEnd = html.indexOf('<', contentStart + 1);
    if (contentEnd === -1 || contentEnd > aClose) continue;

    // Trim ASCII whitespace bounds before slicing
    let textStart = contentStart + 1;
    let textEnd = contentEnd;
    while (textStart < textEnd && html.charCodeAt(textStart) <= 32) textStart++;
    while (textEnd > textStart && html.charCodeAt(textEnd - 1) <= 32) textEnd--;
    if (textStart === textEnd) continue;

    const slug = html.slice(slugStart, slugEnd);
    const text = html.slice(textStart, textEnd).replace(WHITESPACE_RE, ' ');
    const name = text === 'Unknown languages' ? 'Unknown' : text;

    languages.set(name, slug);
  }

  if (linkCount === 0) {
    throw new Error('language menu not found');
  }

  return languages;
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
  const languages = parseLanguagesMenu(html);

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
