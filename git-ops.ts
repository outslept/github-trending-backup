import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import process from 'node:process'

export async function performGitOperations(message?: string): Promise<void> {
  const git: SimpleGit = simpleGit({
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 6,
  })

  try {
    await git.add('.')

    const commitMessage = message || new Date().toISOString().replace('T', ' ').slice(0, 19)
    await git.commit(commitMessage)

    console.log('Git operations completed successfully')
  } catch (err) {
    console.error('Git operation error:', err)
    throw err
  }
}

export async function pushToRemote(remote: string = 'origin', branch?: string): Promise<void> {
  const git: SimpleGit = simpleGit({
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 6,
  })

  try {
    if (branch) {
      await git.push(remote, branch)
    } else {
      await git.push(remote)
    }

    console.log(`Successfully pushed to ${remote}`)
  } catch (err) {
    console.error('Git push error:', err)
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
    return status.files.length > 0
  } catch (err) {
    console.error('Git status error:', err)
    return false
  }
}
