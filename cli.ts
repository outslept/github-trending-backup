import process from 'node:process'
import { hasChanges, performGitOperations, pushToRemote } from './git-ops'
import { main as scrape } from './index'

async function run() {
  try {
    console.log('Starting scraping...')
    await scrape()
    console.log('Scraping completed')

    const changes = await hasChanges()
    if (changes) {
      console.log('Changes detected, performing git operations...')
      await performGitOperations('Update trending repositories [skip ci]')
      await pushToRemote('origin', 'master')
      console.log('Commit and push operations completed.')
    }
    else {
      console.log('No changes detected or unable to determine changes.')
    }
  }
  catch (error) {
    console.error('Error during script execution:', error)
    process.exit(1)
  }
}

run()
