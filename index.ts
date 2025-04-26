import * as fs from 'node:fs'
import { join } from 'pathe'
import process from 'node:process'
import { ofetch } from 'ofetch'
import * as cheerio from 'cheerio'

let tempDate: string

const targets = [
  'Bash',
  'C',
  'C++',
  'CSS',
  'Elixir',
  'Go',
  'Haskell',
  'HTML',
  'Java',
  'JavaScript',
  'Kotlin',
  'Lua',
  'OCaml',
  'Python',
  'Rust',
  'Svelte',
  'TypeScript',
  'Vue',
  'Zig',
]

interface Repository {
  rank: number;
  title: string;
  url: string;
  description: string;
  stars: string;
  forks: string;
  todayStars: string;
}

const fetchOptions = {
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  },
}

export async function main(): Promise<void> {
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

  let content = `# GitHub Trending - ${tempDate}\n\n`

  content += "## Table of Contents\n\n"
  for (const language of targets) {
    const anchor = language.toLowerCase().replace(/[^\w]/g, '-')
    content += `- [${language}](#${anchor})\n`
  }
  content += "\n"

  const results = await Promise.all(
    targets.map(target => scrapeLanguageWithRetry(target)),
  )

  content += results.join('\n')

  writeMarkDown(tempDate, content)
  _message += `${tempDate}.md is completed.\n`
  console.log(_message)
}

async function scrapeLanguageWithRetry(language: string, maxRetries = 3): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = 2000 * 1.5 ** attempt + Math.floor(Math.random() * 1000)
        await new Promise(r => setTimeout(r, delay))
      }

      const result = await scrapeLanguage(language)
      console.log(`${language} is completed.`)

      await new Promise(r => setTimeout(r, 500 + Math.floor(Math.random() * 500)))

      return result
    }
    catch (err) {
      if (attempt < maxRetries) {
        console.log(`Retrying ${language} (${attempt + 1}/${maxRetries}): ${err.message}`)
      }
      else {
        console.log(`Failed to scrape ${language} after ${maxRetries + 1} attempts: ${err.message}`)
        return `## ${language}\n\nFailed to scrape this language after multiple attempts.\n`
      }
    }
  }
  return `## ${language}\n\nFailed to scrape this language.\n`
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
      fs.renameSync(v, join(docName, v))
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
    const stat = fs.statSync(join(dirPth, fi))
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
  let result = `## ${language}\n\n`

  let urlParam: string

  switch (language) {
    case 'C#':
      urlParam = 'c%23'
      break
    case 'C++':
      urlParam = 'c%2B%2B'
      break
    case 'F#':
      urlParam = 'f%23'
      break
    default:
      urlParam = language.toLowerCase()
  }

  try {
    const response = await ofetch(`https://github.com/trending/${urlParam}`, {
      ...fetchOptions,
      responseType: 'text'
    })

    const $ = cheerio.load(response)

    let repoCount = 0
    const repos: Repository[] = []

    $('.Box-row').each((i, elem) => {
      try {
        const description = $(elem).find('p.col-9').text().trim()
        const repoURL = $(elem).find('h2 a').attr('href') || ''
        const title = repoURL.substring(1)
        const url = `https://github.com${repoURL}`

        let stars = '0'
        let forks = '0'
        let todayStars = ''

        $(elem).find('a.Link--muted.d-inline-block.mr-3').each((i, contentSelection) => {
          const iconLabel = $(contentSelection).find('svg').attr('aria-label')
          if (iconLabel === 'star') {
            stars = $(contentSelection).text().trim()
          }
          else if (iconLabel === 'fork') {
            forks = $(contentSelection).text().trim()
          }
        })

        const todayStarsText = $(elem).find('span.d-inline-block.float-sm-right').text().trim()
        if (todayStarsText) {
          todayStars = todayStarsText.replace(/\s+/g, ' ')
        }

        repos.push({
          rank: i + 1,
          title: title.replace(/\s/g, ''),
          url,
          description: description.trim() || 'No description provided',
          stars: stars.trim() || '0',
          forks: forks.trim() || 'No forks',
          todayStars: todayStars || 'N/A'
        })

        repoCount++
      }
      catch (err) {
        console.error(`Error processing repo ${i} for ${language}:`, err)
      }
    })

    if (repoCount === 0) {
      result += `No trending repositories found for ${language} today.\n`
    } else {
      result += `| # | Repository | Description | Stars | Forks | Today |\n`
      result += `| --- | --- | --- | --- | --- | --- |\n`

      for (const repo of repos) {
        const shortDescription = repo.description.length > 100
          ? repo.description.substring(0, 97) + '...'
          : repo.description

        result += `| ${repo.rank} | [${repo.title}](${repo.url}) | ${shortDescription} | ${repo.stars} | ${repo.forks} | ${repo.todayStars} |\n`
      }
    }

    return result
  }
  catch (err) {
    console.error(`Error scraping ${language}:`, err.message)
    return `## ${language}\n\nError: Could not retrieve data for this language. ${err.message}\n`
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Error in script execution:', err)
    process.exit(1)
  })
}
