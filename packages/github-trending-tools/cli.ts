import process from 'node:process'
import { main as scrape } from '.'
import { hasChanges, performGitOperations, pushToRemote } from './src/utils/git'
import { logger } from './src/utils/logger'

async function run() {
  try {
    logger.start('Starting GitHub trending tools')
    await scrape()

    const changes = await hasChanges()
    if (changes) {
      logger.info('Changes detected, performing git operations...')
      await performGitOperations('Update trending repositories [skip ci]')
      await pushToRemote('origin', 'master')
      logger.success('Git operations completed successfully')
    }
    else {
      logger.info('No changes detected')
    }
  }
  catch (error) {
    logger.error('Error during script execution:', error)
    process.exit(1)
  }
}

run()
