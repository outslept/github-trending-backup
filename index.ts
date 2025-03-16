import type { SimpleGit } from 'simple-git'
import * as fs from 'node:fs'
import * as path from 'node:path'
import process from 'node:process'
import axios from 'axios'
import * as cheerio from 'cheerio'
import simpleGit from 'simple-git'

let tempDate: string

const targets = [
  'JavaScript',
  'Python',
  'Java',
  'TypeScript',
  'C++',
  'C#',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'Dart',
  'Scala',
  'Haskell',
  'Elixir',
  'Clojure',
  'F#',
  'Lua',
  'Julia',
  'R',
  'Groovy',
  'Perl',
  'Objective-C',
  'Assembly',
  'Shell',
  'C',
  'Fortran',
  'COBOL',
  'Erlang',
  'Nim',
  'Crystal',
  'OCaml',
  'Zig',
  'D',
  'V',
  'Elm',
  'PureScript',
  'Reason',
  'Solidity',
  'HTML',
  'CSS',
  'Vue',
  'React',
  'Angular',
  'Svelte',
  'Markdown',
  'TeX',
  'SQL',
  'Makefile',
  'PowerShell',
  'Bash',
  'YAML',
  'JSON',
]

const git: SimpleGit = simpleGit({
  baseDir: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
})

const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  },
})

async function main(): Promise<void> {
  tempDate = new Date().toISOString().slice(0, 10)
  let _message = ''

  if (new Date().getDate() === 10) {
    try {
      const [ok, err] = await collectDocs()
      if (ok) {
        _message += 'Collect the *.md files: OK!\n'
      }
      else if (err) {
        _message += `collectDocs() is failed. ${err.message}\n`
      }
    }
    catch (err: any) {
      _message += `collectDocs() is failed. ${err.message}\n`
    }
  }

  let content = ''
  let readme = ''

  const results = await Promise.all(
    targets.map(target => scrapeLanguageWithRetry(target)),
  )

  content = `### ${tempDate}\n${results.join('')}`

  writeMarkDown(tempDate, content)
  _message += `${tempDate}.md is completed.\n`

  readme = '# GitHub Trending Scraper\n\nWe scrape the GitHub trending page of these languages: '
  readme += targets.join(', ')
  readme += '.\n\n'
  readme += `[${tempDate}.md](https://github.com/yangwenmai/github-trending-backup/blob/master/${tempDate}.md)\n\n`
  readme += `Last Updated: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`
  writeMarkDown('README', readme)
  console.log('README.md is updated.')

  try {
    await git.pull('origin', 'master')
    await git.add('.')
    await git.commit(new Date().toISOString().replace('T', ' ').slice(0, 19))
    await git.push('origin', 'master')
    console.log('Git operations completed successfully')
  }
  catch (err) {
    console.error('Git operation error:', err)
  }
}

async function scrapeLanguageWithRetry(language: string, maxRetries = 2): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await scrapeLanguage(language)
      console.log(`${language} is completed.`)
      return result
    }
    catch (err) {
      if (attempt < maxRetries) {
        console.log(`Retrying ${language} (${attempt + 1}/${maxRetries}): ${err.message}`)
        await new Promise(r => setTimeout(r, 2000))
      }
      else {
        console.log(`Failed to scrape ${language} after ${maxRetries + 1} attempts: ${err.message}`)
        return `\n#### ${language}\nFailed to scrape this language after multiple attempts.\n`
      }
    }
  }
  return `\n#### ${language}\nFailed to scrape this language.\n`
}

async function collectDocs(): Promise<[boolean, Error | null]> {
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
  const docName = `${lastMonth.getFullYear()}/${String(lastMonth.getMonth() + 1).padStart(2, '0')}`
  const regType = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

  try {
    const docPath = process.cwd()
    const mdFiles = await listDir(docPath, '.md')

    const mdNewFiles: string[] = []
    for (const v of mdFiles) {
      if (new RegExp(regType).test(v)) {
        mdNewFiles.push(v)
      }
    }

    fs.mkdirSync(docName, { recursive: true })

    for (const v of mdNewFiles) {
      fs.renameSync(v, path.join(docName, v))
    }

    return [true, null]
  }
  catch (err: any) {
    return [false, err]
  }
}

async function listDir(dirPth: string, suffix: string): Promise<string[]> {
  const files: string[] = []
  const dir = fs.readdirSync(dirPth)

  suffix = suffix.toUpperCase()

  for (const fi of dir) {
    const stat = fs.statSync(path.join(dirPth, fi))
    if (!stat.isDirectory() && fi.toUpperCase().endsWith(suffix)) {
      files.push(fi)
    }
  }

  return files
}

function writeMarkDown(fileName: string, content: string): void {
  fs.writeFileSync(`${fileName}.md`, content)
}

async function scrapeLanguage(language: string): Promise<string> {
  let result = `\n#### ${language}\n`

  const response = await axiosInstance.get(`https://github.com/trending?l=${language}`)
  const $ = cheerio.load(response.data)

  let repoCount = 0
  $('.Box-row').each((i, elem) => {
    try {
      const description = $(elem).find('p.col-9').text().trim()
      const repoURL = $(elem).find('h2 a').attr('href') || ''
      const title = repoURL.substring(1)
      const url = `https://github.com${repoURL}`

      let stars = '0'
      let forks = '0'

      $(elem).find('a.Link--muted.d-inline-block.mr-3').each((i, contentSelection) => {
        const iconLabel = $(contentSelection).find('svg').attr('aria-label')
        if (iconLabel === 'star') {
          stars = $(contentSelection).text().trim()
        }
        else if (iconLabel === 'fork') {
          forks = $(contentSelection).text().trim()
        }
      })

      result += `${i + 1}. [${title.replace(/\s/g, '')} (${stars.trim()}s/${forks.trim()}f)](${url}) : ${description.trim()}\n`
      repoCount++
    }
    catch (err) {
      console.error(`Error processing repo ${i} for ${language}:`, err)
    }
  })

  if (repoCount === 0) {
    result += `No trending repositories found for ${language} today.\n`
  }

  return result
}

main().catch((err) => {
  console.error('Error in script execution:', err)
  process.exit(1)
})
