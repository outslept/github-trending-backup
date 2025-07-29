import http from 'node:http';
import { URL } from 'node:url';
import { styleText } from 'node:util';

function log(level, message, ...args) {
  const timestamp = new Date().toISOString().slice(11, 23);
  const styledTimestamp = styleText('gray', timestamp);

  const levelColors = {
    info: 'blue',
    ok: 'green',
    warn: 'yellow',
    error: 'red',
  };

  const styledLevel = styleText(levelColors[level] || 'reset', level.toUpperCase().padEnd(5));
  console.log(`${styledTimestamp} ${styledLevel} ${message}`, ...args);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function sendJSON(res, data, status = 200) {
  res.writeHead(status, corsHeaders);
  res.end(JSON.stringify(data));
}

function sendError(res, message, status = 500) {
  sendJSON(res, { error: message }, status);
}

const parseMdToLanguageGroups = (mdContent) => {
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
};

const server = http.createServer(async (req, res) => {
  const startTime = Date.now();
  const url = new URL(req.url, `http://localhost:3001`);
  const { pathname, searchParams } = url;

  // Log incoming request
  log('info', `${req.method} ${pathname}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    log('ok', `${req.method} ${pathname} ${styleText('gray', `200 ${Date.now() - startTime}ms`)}`);
    return;
  }

  if (req.method !== 'GET') {
    sendError(res, 'Method not allowed', 405);
    log('warn', `${req.method} ${pathname} ${styleText('gray', `405 ${Date.now() - startTime}ms`)}`);
    return;
  }

  try {
    if (pathname === '/api/trending/metadata') {
      const month = searchParams.get('month');
      if (!month) {
        sendError(res, 'Month parameter is required', 400);
        log('warn', `${req.method} ${pathname} ${styleText('gray', `400 ${Date.now() - startTime}ms`)} - missing month param`);
        return;
      }

      try {
        const [year, monthNum] = month.split('-');
        const response = await fetch(
          `https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year}/${monthNum}`,
        );

        let metadata;
        if (!response.ok) {
          metadata = { availableDates: [], totalDays: 0 };
        } else {
          const allFiles = await response.json();
          const files = allFiles.filter((file) => file.name.endsWith('.md'));
          metadata = {
            availableDates: files.map((file) => file.name.replace('.md', '').split('-')[2]).sort(),
            totalDays: files.length,
          };
        }

        sendJSON(res, { month, ...metadata });
        log('ok', `${req.method} ${pathname} ${styleText('gray', `200 ${Date.now() - startTime}ms`)} - ${metadata.totalDays} days`);
      } catch (error) {
        log('error', `Error fetching metadata: ${error.message}`);
        sendJSON(res, { month, availableDates: [], totalDays: 0 });
        log('warn', `${req.method} ${pathname} ${styleText('gray', `200 ${Date.now() - startTime}ms`)} - fallback response`);
      }
      return;
    }

    const trendingMatch = pathname.match(/^\/api\/trending\/(.+)$/);
    if (trendingMatch) {
      const slug = trendingMatch[1];
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '5');

      // YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(slug)) {
        const date = slug;
        const month = date.split('-').slice(0, 2).join('-');

        try {
          const [year, monthNum] = month.split('-');
          const response = await fetch(
            `https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year}/${monthNum}`,
          );

          if (!response.ok) {
            throw new Error('Month not found');
          }

          const allFiles = await response.json();
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
          log('ok', `${req.method} ${pathname} ${styleText('gray', `200 ${Date.now() - startTime}ms`)} - date ${date}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch data';
          const status = message === 'Date not found' ? 404 : 500;
          sendError(res, message, status);
          log('error', `${req.method} ${pathname} ${styleText('gray', `${status} ${Date.now() - startTime}ms`)} - ${message}`);
        }
        return;
      }

      // YYYY-MM format
      if (/^\d{4}-\d{2}$/.test(slug)) {
        const month = slug;

        try {
          const [year, monthNum] = month.split('-');
          const response = await fetch(
            `https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year}/${monthNum}`,
          );

          if (!response.ok) {
            throw new Error('Month not found');
          }

          const allFiles = await response.json();
          const files = allFiles.filter((file) => file.name.endsWith('.md'));
          const mdFiles = files.slice((page - 1) * limit, page * limit);

          const repositories = {};
          for (const file of mdFiles) {
            const content = await fetch(file.download_url).then((res) => res.text());
            const languageGroups = parseMdToLanguageGroups(content);
            if (languageGroups.length > 0) {
              repositories[file.name.replace('.md', '').split('-')[2]] = languageGroups;
            }
          }

          sendJSON(res, {
            month,
            repositories,
            pagination: { page, totalPages: Math.ceil(files.length / limit) },
          });
          log('ok', `${req.method} ${pathname} ${styleText('gray', `200 ${Date.now() - startTime}ms`)} - month ${month}, page ${page}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch data';
          sendError(res, message, 500);
          log('error', `${req.method} ${pathname} ${styleText('gray', `500 ${Date.now() - startTime}ms`)} - ${message}`);
        }
        return;
      }

      sendError(res, 'Invalid endpoint. Use: metadata, YYYY-MM, or YYYY-MM-DD', 404);
      log('warn', `${req.method} ${pathname} ${styleText('gray', `404 ${Date.now() - startTime}ms`)} - invalid format: ${slug}`);
      return;
    }

    // /health
    if (pathname === '/health') {
      sendJSON(res, { status: 'ok', timestamp: new Date().toISOString() });
      log('ok', `${req.method} ${pathname} ${styleText('gray', `200 ${Date.now() - startTime}ms`)} - health check`);
      return;
    }

    sendError(res, 'Not found', 404);
    log('warn', `${req.method} ${pathname} ${styleText('gray', `404 ${Date.now() - startTime}ms`)}`);
  } catch (error) {
    log('error', `Server error: ${error.message}`);
    sendError(res, 'Internal server error', 500);
    log('error', `${req.method} ${pathname} ${styleText('gray', `500 ${Date.now() - startTime}ms`)}`);
  }
});

const port = 3001;

server.listen(port, () => {
  log('info', `Dev API server running on http://localhost:${port}`);
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
