import type { ScraperConfig } from '../types'
import { join } from 'node:path'
import process from 'node:process'

export const defaultConfig: ScraperConfig = {
  languages: [
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
    'Shell',
    'Svelte',
    'TypeScript',
    'Vue',
    'Zig',
  ] as const,
  outputDir: join(process.cwd(), '..', '..', 'data'),
  concurrency: 3,
  retryConfig: {
    maxRetries: 3,
    baseDelay: 2000,
    maxDelay: 10000,
  },
  archiveConfig: {
    enabled: true,
    monthlyFolders: true,
  },
} as const
