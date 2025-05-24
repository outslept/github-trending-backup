import { existsSync, mkdirSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { logger } from './logger'

export class FileSystem {
  ensureDirectory(dir: string): void {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
      logger.success(`Created directory: ${dir}`)
    }
  }

  getMonthlyDirectory(baseDir: string): string {
    const date = new Date()
    const year = date.getFullYear().toString()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')

    const dir = join(baseDir, year, month)
    this.ensureDirectory(dir)
    return dir
  }

  archiveCurrentMonthFiles(baseDir: string): void {
    const date = new Date()
    const currentYear = date.getFullYear()
    const currentMonth = date.getMonth()

    const files = readdirSync(baseDir)
      .filter(file => file.endsWith('.md'))
      .filter((file) => {
        const [year, month] = file.split('.')[0].split('-').map(Number)
        return year === currentYear && month === currentMonth
      })

    if (files.length === 0)
      return

    const archiveDir = this.getMonthlyDirectory(baseDir)

    files.forEach((file) => {
      const sourcePath = join(baseDir, file)
      const targetPath = join(archiveDir, file)
      renameSync(sourcePath, targetPath)
      logger.info(`Archived: ${file}`)
    })
  }

  writeFile(path: string, content: string): void {
    writeFileSync(path, content, 'utf8')
    logger.success(`Generated: ${path}`)
  }
}
