import { existsSync, mkdirSync, readdirSync, renameSync } from 'node:fs'
import { join } from 'pathe'
import { logger } from './logger'

export function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
    logger.success(`Created: ${dir}`)
  }
}

export function getMonthlyDir(baseDir: string): string {
  const date = new Date()
  const dir = join(baseDir, String(date.getFullYear()), String(date.getMonth() + 1).padStart(2, '0'))
  ensureDir(dir)
  return dir
}

export function archiveFiles(baseDir: string): void {
  const date = new Date()
  const files = readdirSync(baseDir)
    .filter(f => f.endsWith('.md'))
    .filter((f) => {
      const [y, m] = f.split('.')[0].split('-').map(Number)
      return y === date.getFullYear() && m === date.getMonth()
    })

  const archiveDir = join(
    baseDir,
    String(date.getFullYear()),
    String(date.getMonth()).padStart(2, '0'),
  )
  ensureDir(archiveDir)

  files.forEach((f) => {
    renameSync(join(baseDir, f), join(archiveDir, f))
    logger.info(`Archived: ${f}`)
  })
}
