import { main as scrape } from './index'
import { performGitOperations, pushToRemote, hasChanges } from './git-ops'

async function run() {
  try {
    console.log('Starting scraping...')
    await scrape()
    console.log('Scraping completed')

    const changes = await hasChanges()
    if (changes) {
      console.log('Changes detected, committing...')

      await performGitOperations('Update trending repositories [skip ci]')

      if (!process.env.CI) {
        console.log('Pushing changes...')
        await pushToRemote()
      }
    } else {
      console.log('No changes detected')
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

run()
