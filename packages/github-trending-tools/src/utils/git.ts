import type { SimpleGit } from 'simple-git'
import process from 'node:process'
import simpleGit from 'simple-git'
import { logger } from './logger'

const git: SimpleGit = simpleGit({
  baseDir: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
})

export async function commit(): Promise<void> {
  try {
    await git.add('.')
    await git.commit('Update trending repositories [skip ci]')
    logger.success('Changes committed')
  }
  catch (err) {
    logger.error('Commit failed:', err)
    throw err
  }
}

export async function push(remote = 'origin', branch = 'master'): Promise<void> {
  try {
    const remotes = await git.getRemotes(true)
    const originUrl = remotes.find(r => r.name === remote)?.refs?.push

    if (process.env.GH_TOKEN && originUrl && !originUrl.includes(process.env.GH_TOKEN)) {
      const repoUrl = originUrl.substring(originUrl.indexOf('github.com'))
      await git.push(`https://${process.env.GH_TOKEN}@${repoUrl}`)
    }
    else {
      await git.push(remote, branch)
    }

    logger.success(`Pushed to ${remote}/${branch}`)
  }
  catch (err) {
    logger.error('Push failed:', err)
    throw err
  }
}

export async function hasChanges(): Promise<boolean> {
  try {
    return !(await git.status()).isClean()
  }
  catch (err) {
    logger.error('Status check failed:', err)
    return true
  }
}
