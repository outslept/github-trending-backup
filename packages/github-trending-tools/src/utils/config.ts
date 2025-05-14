import type { GitHubLanguage } from '../languages'
import type { ScraperConfig } from '../types'

export const defaultConfig: ScraperConfig = {
  languages: [
    'Bash',
    'C',
    'C++',
    'CSS',
    'Elixir',
    'Go',
    'Haskell',
    'HTML',
    'Java',
    'JavaScript',
    'Kotlin',
    'Lua',
    'OCaml',
    'Python',
    'Rust',
    'Svelte',
    'TypeScript',
    'Vue',
    'Zig',
  ] as GitHubLanguage[],
  outputDir: 'data',
  archiveConfig: {
    enabled: true,
    monthlyFolders: true,
  },
  retryConfig: {
    maxRetries: 3,
    baseDelay: 2000,
    maxDelay: 10000,
  },
}

export const fetchOptions = {
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  },
}
