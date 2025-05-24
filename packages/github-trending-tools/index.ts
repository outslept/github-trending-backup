import type { ScraperConfig } from './src/types'
import { TrendingService } from './src/trending-service'
import { defaultConfig } from './src/utils/config'

export async function main(config: ScraperConfig = defaultConfig): Promise<void> {
  const service = new TrendingService(config)
  await service.generateReport()
}
