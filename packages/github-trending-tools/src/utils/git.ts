import { execSync } from 'node:child_process'
import { join } from 'node:path'
import process from 'node:process'
import { logger } from './logger'

const rootDir = join(process.cwd(), '..', '..')

function execGit(command: string): string {
  try {
    return execSync(`git ${command}`, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
  }
  catch (error) {
    throw new Error(`Git command failed: ${error}`)
  }
}

export function hasChanges(): boolean {
  try {
    const status = execGit('status --porcelain')
    return status.length > 0
  }
  catch (error) {
    logger.error('Status check failed:', error)
    return true
  }
}

export function commit(): void {
  try {
    execGit('add data/*')
    execGit('commit -m "Update trending repositories [skip ci]"')
    logger.success('Changed commited')
  }
  catch (error) {
    logger.error('Commit failed:', error)
    throw error
  }
}

export function push(remote = 'origin', branch = 'master'): void {
  try {
    if (process.env.GH_TOKEN) {
      const repoUrl = execGit('config --get remote.origin.url')
        .replace(/^https:\/\/github\.com\//, '')
        .replace(/\.git$/, '')

      execGit(`push https://${process.env.GH_TOKEN}@github.com/${repoUrl} ${branch}`)
    }
    else {
      execGit(`push ${remote} ${branch}`)
    }

    logger.success(`Pushed to ${remote}/${branch}`)
  }
  catch (error) {
    logger.error('Push failed:', error)
    throw error
  }
}
