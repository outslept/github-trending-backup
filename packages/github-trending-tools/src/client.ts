import type { ScraperConfig } from './types'

const defaultOptions: RequestInit = {
  signal: AbortSignal.timeout(30000),
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Cache-Control': 'no-cache',
  },
}

export async function fetchWithRetry(
  url: string,
  retryConfig: ScraperConfig['retryConfig'],
): Promise<string> {
  let lastError: Error

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(
          retryConfig.baseDelay * (2 ** attempt) + Math.random() * 1000,
          retryConfig.maxDelay,
        )
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      const response = await fetch(url, defaultOptions)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`)
      }

      return await response.text()
    }
    catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt === retryConfig.maxRetries)
        break
    }
  }

  // eslint-disable-next-line no-throw-literal
  throw lastError!
}
