import http from 'node:http';
import { URL } from 'node:url';
import { styleText } from 'node:util';

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_FORMAT_REGEX = /^\d{4}-\d{2}$/;
const PORT = 3001;

const LEVEL_COLORS = {
  info: 'blue',
  ok: 'green',
  warn: 'yellow',
  error: 'red',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function log(level, message, ...args) {
  const timestamp = new Date().toISOString().slice(11, 23);
  const styledTimestamp = styleText('gray', timestamp);
  const styledLevel = styleText(
    LEVEL_COLORS[level] || 'reset',
    level.toUpperCase().padEnd(5),
  );
  console.log(`${styledTimestamp} ${styledLevel} ${message}`, ...args);
}

function sendJSON(res, data, status = 200) {
  res.writeHead(status, corsHeaders);
  res.end(JSON.stringify(data));
}

function sendError(res, message, status = 500) {
  sendJSON(res, { error: message }, status);
}

function logResponse(req, pathname, startTime, status, extra = '') {
  const duration = Date.now() - startTime;
  const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'ok';
  log(level, `${req.method} ${pathname} ${styleText('gray', `${status} ${duration}ms`)}${extra ? ` - ${extra}` : ''}`);
}

async function fetchGitHubContent(year, monthNum) {
  const response = await fetch(
    `https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year}/${monthNum}`,
  );

  if (!response.ok) {
    throw new Error('Month not found');
  }

  return response.json();
}

function parseMdToLanguageGroups(mdContent) {
  const languageGroups = [];
  let currentLanguage = 'Unknown';
  let currentRepos = [];
  let inTable = false;

  for (const line of mdContent.split('\n')) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('## ') && !trimmedLine.includes('Table of Contents')) {
      if (currentRepos.length > 0) {
        languageGroups.push({ language: currentLanguage, repos: currentRepos });
      }
      currentLanguage = trimmedLine.replace('## ', '').trim();
      currentRepos = [];
      inTable = false;
      continue;
    }

    if (!inTable && trimmedLine.startsWith('| # | Repository |')) {
      inTable = true;
      continue;
    }

    if (inTable && trimmedLine.startsWith('| ') && trimmedLine.endsWith(' |')) {
      const columns = trimmedLine.split('|').map((col) => col.trim()).filter(Boolean);
      if (columns.length < 6) continue;

      const repoMatch = columns[1].match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (!repoMatch) continue;

      const starsMatch = columns[3].match(/[\d,]+/);
      const forksMatch = columns[4].match(/[\d,]+/);
      const todayMatch = columns[5].match(/(\d+)\s+stars?\s+today/i);

      currentRepos.push({
        rank: parseInt(columns[0]) || currentRepos.length + 1,
        repo: repoMatch[1].trim(),
        desc: columns[2].trim() || 'No description',
        stars: starsMatch ? parseInt(starsMatch[0].replace(/,/g, '')) : 0,
        forks: forksMatch ? parseInt(forksMatch[0].replace(/,/g, '')) : 0,
        today: todayMatch ? parseInt(todayMatch[1]) : 0,
      });
    }

    if (inTable && (!trimmedLine || trimmedLine.startsWith('#'))) {
      inTable = false;
    }
  }

  if (currentRepos.length > 0) {
    languageGroups.push({ language: currentLanguage, repos: currentRepos });
  }

  return languageGroups;
}

async function handleDateRequest(req, res, date, startTime) {
  const month = date.split('-').slice(0, 2).join('-');
  const pathname = new URL(req.url, `http://localhost:${PORT}`).pathname;

  try {
    const [year, monthNum] = month.split('-');
    const allFiles = await fetchGitHubContent(year, monthNum);
    const files = allFiles.filter((file) => file.name.endsWith('.md'));
    const mdFiles = files.filter((file) => file.name === `${date}.md`);

    if (!mdFiles.length) {
      throw new Error('Date not found');
    }

    const repositories = {};
    for (const file of mdFiles) {
      const content = await fetch(file.download_url).then((res) => res.text());
      const languageGroups = parseMdToLanguageGroups(content);
      if (languageGroups.length > 0) {
        repositories[file.name.replace('.md', '').split('-')[2]] = languageGroups;
      }
    }

    sendJSON(res, { month, repositories });
    logResponse(req, pathname, startTime, 200, `date ${date}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch data';
    const status = message === 'Date not found' ? 404 : 500;
    sendError(res, message, status);
    logResponse(req, pathname, startTime, status, message);
  }
}

async function handleMonthRequest(req, res, month, startTime) {
  const pathname = new URL(req.url, `http://localhost:${PORT}`).pathname;

  try {
    const [year, monthNum] = month.split('-');
    const allFiles = await fetchGitHubContent(year, monthNum);
    const files = allFiles.filter((file) => file.name.endsWith('.md'));

    const repositories = {};
    for (const file of files) {
      const content = await fetch(file.download_url).then((res) => res.text());
      const languageGroups = parseMdToLanguageGroups(content);
      if (languageGroups.length > 0) {
        repositories[file.name.replace('.md', '').split('-')[2]] = languageGroups;
      }
    }

    sendJSON(res, { month, repositories });
    logResponse(req, pathname, startTime, 200, `month ${month}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch data';
    sendError(res, message, 500);
    logResponse(req, pathname, startTime, 500, message);
  }
}

const server = http.createServer(async (req, res) => {
  const startTime = Date.now();
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const { pathname } = url;

  log('info', `${req.method} ${pathname}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    logResponse(req, pathname, startTime, 200);
    return;
  }

  if (req.method !== 'GET') {
    sendError(res, 'Method not allowed', 405);
    logResponse(req, pathname, startTime, 405);
    return;
  }

  try {
    const trendingMatch = pathname.match(/^\/api\/trending\/(.+)$/);
    if (trendingMatch) {
      const slug = trendingMatch[1];

      if (DATE_FORMAT_REGEX.test(slug)) {
        await handleDateRequest(req, res, slug, startTime);
        return;
      }

      if (MONTH_FORMAT_REGEX.test(slug)) {
        await handleMonthRequest(req, res, slug, startTime);
        return;
      }

      sendError(res, 'Invalid endpoint. Use: YYYY-MM or YYYY-MM-DD', 404);
      logResponse(req, pathname, startTime, 404, `invalid format: ${slug}`);
      return;
    }

    if (pathname === '/health') {
      sendJSON(res, { status: 'ok', timestamp: new Date().toISOString() });
      logResponse(req, pathname, startTime, 200, 'health check');
      return;
    }

    sendError(res, 'Not found', 404);
    logResponse(req, pathname, startTime, 404);
  } catch (error) {
    log('error', `Server error: ${error.message}`);
    sendError(res, 'Internal server error', 500);
    logResponse(req, pathname, startTime, 500);
  }
});

server.listen(PORT, () => {
  log('info', `Dev API server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  log('warn', 'Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  log('warn', 'Received SIGTERM, shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
