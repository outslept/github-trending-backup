import type { SimpleGit } from 'simple-git'
import process from 'node:process'
import simpleGit from 'simple-git'
import { logger } from './logger'

export async function performGitOperations(_message?: string): Promise<void> {
  const git: SimpleGit = simpleGit({
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 6,
  })

  try {
    await git.add('.')
    // const commitMessage = message || new Date().toISOString().replace('T', ' ').slice(0, 19)
    // await git.commit(commitMessage)
    logger.success('Git commit completed')
  }
  catch (err) {
    logger.error('Git commit operation failed:', err)
    throw err
  }
}

export async function pushToRemote(remote: string = 'origin', branch: string = 'master'): Promise<void> {
  const git: SimpleGit = simpleGit({
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 6,
  })

  try {
    const remotes = await git.getRemotes(true)
    const originUrl = remotes.find(r => r.name === remote)?.refs?.push

    let pushOptions: string[] = []

    if (process.env.GH_TOKEN && originUrl && !originUrl.includes('x-access-token') && !originUrl.includes(process.env.GH_TOKEN)) {
      logger.info(`Pushing to ${remote}/${branch} using GH_TOKEN`)
      const repoUrl = originUrl.substring(originUrl.indexOf('github.com'))
      const authUrl = `https://${process.env.GH_TOKEN}@${repoUrl}`
      pushOptions = [authUrl]
    }
    else {
      logger.info(`Pushing to ${remote}/${branch}`)
      pushOptions = [remote, branch]
    }

    await git.push(...pushOptions)
    logger.success(`Successfully pushed to ${remote}/${branch}`)
  }
  catch (err) {
    logger.error('Git push failed:', err)
    throw err
  }
}

export async function hasChanges(): Promise<boolean> {
  const git: SimpleGit = simpleGit({
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 6,
  })

  try {
    const status = await git.status()
    return !status.isClean()
  }
  catch (err) {
    logger.error('Git status check failed:', err)
    return true
  }
}
