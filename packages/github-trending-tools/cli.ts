import process from 'node:process'
import { parseArgs } from 'node:util'
import { main } from '.'
import { commit, hasChanges, push } from './src/utils/git'
import { logger } from './src/utils/logger'

function showHelp() {
  console.log(`
Usage: github-trending-tools [options]

Options:
  -c, --commit    Commit and push changes
  -h, --help      Show help
`)
  process.exit(0)
}

async function run() {
  try {
    const { values } = parseArgs({
      options: {
        commit: {
          type: 'boolean',
          short: 'c',
        },
        help: {
          type: 'boolean',
          short: 'h',
        },
      },
    })

    if (values.help) {
      showHelp()
    }

    logger.start('Starting GitHub trending tools')
    await main()

    if (values.commit && await hasChanges()) {
      logger.info('Committing changes...')
      await commit()
      await push()
    }
  }
  catch (error) {
    logger.error('Execution failed:', error)
    process.exit(1)
  }
}

run()
