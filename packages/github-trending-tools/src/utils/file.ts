import { join } from 'pathe'
import { mkdirSync, existsSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { logger } from './logger'

export function ensureDirectoryExists(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
    logger.success(`Created directory: ${dir}`)
  }
}

export function getMonthlyFolder(baseDir: string): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const monthlyDir = join(baseDir, String(year), month)
  ensureDirectoryExists(monthlyDir)
  return monthlyDir
}

export async function archiveFiles(baseDir: string): Promise<void> {
  const date = new Date()
  const currentYear = date.getFullYear()
  const currentMonth = date.getMonth() + 1

  const files = readdirSync(baseDir)
    .filter(file => file.endsWith('.md'))
    .filter(file => {
      const fileDate = file.split('.')[0]
      const [fileYear, fileMonth] = fileDate.split('-').map(Number)
      return fileYear === currentYear && fileMonth === currentMonth - 1
    })

  const archiveDir = join(
    baseDir,
    String(currentYear),
    String(currentMonth - 1).padStart(2, '0')
  )
  ensureDirectoryExists(archiveDir)

  for (const file of files) {
    const sourcePath = join(baseDir, file)
    const targetPath = join(archiveDir, file)
    renameSync(sourcePath, targetPath)
    logger.info(`Archived file: ${file} to ${archiveDir}`)
  }
}

export function writeMarkDown(outputPath: string, content: string): void {
  writeFileSync(outputPath, content)
  logger.success(`Generated markdown file: ${outputPath}`)
}
