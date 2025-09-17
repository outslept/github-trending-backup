import http from 'node:http'
import { URL } from 'node:url'
import { styleText } from 'node:util'
import {
  PORT,
  corsHeaders,
  DATE_FORMAT_REGEX,
  MONTH_FORMAT_REGEX,
  CORS_ORIGIN,
  DEBUG,
} from './config'
import {
  fetchTrendingDate,
  fetchTrendingMonth,
  fetchTrendingMetadata,
  lastAvailableDateFromMetadata,
  toIsoToday,
} from './sources'

const LEVEL_COLORS = { info: 'blue', ok: 'green', warn: 'yellow', error: 'red' }

function log (level, message, ...args) {
  const t = new Date().toISOString().slice(11, 23)
  const ts = styleText('gray', t)
  const lv = styleText(LEVEL_COLORS[level] || 'reset', level.toUpperCase().padEnd(5))
  console.log(`${ts} ${lv} ${message}`, ...args)
}

function wantPretty (url) {
  return url.searchParams.has('pretty')
}

function sendJSON (req, res, data, status = 200) {
  res.writeHead(status, corsHeaders)
  const url = new URL(req.url, `http://localhost:${PORT}`)
  res.end(wantPretty(url) ? JSON.stringify(data, null, 2) : JSON.stringify(data))
}

function sendError (req, res, message, status = 500, extra = {}) {
  sendJSON(req, res, { error: message, ...extra }, status)
}

function logResponse (req, pathname, start, status, note = '') {
  const ms = Date.now() - start
  const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'ok'
  log(level, `${req.method} ${pathname} ${styleText('gray', `${status} ${ms}ms`)}${note ? ` - ${note}` : ''}`)
}

async function handleTrending (req, res, pathname, start) {
  const slug = pathname.split('/').filter(Boolean).at(-1)
  if (!slug) {
    sendError(req, res, 'Invalid endpoint. Use: YYYY-MM or YYYY-MM-DD', 404)
    logResponse(req, pathname, start, 404, 'invalid endpoint')
    return
  }
  try {
    if (slug === 'latest') {
      const meta = await fetchTrendingMetadata()
      const latest = lastAvailableDateFromMetadata(meta) ?? toIsoToday()
      sendJSON(req, res, { date: latest }, 200)
      logResponse(req, pathname, start, 200, 'latest')
      return
    }
    if (DATE_FORMAT_REGEX.test(slug)) {
      DEBUG && log('info', `date=${slug}`)
      const payload = await fetchTrendingDate(slug)
      sendJSON(req, res, payload, 200)
      logResponse(req, pathname, start, 200, `date ${slug}`)
      return
    }
    if (MONTH_FORMAT_REGEX.test(slug)) {
      DEBUG && log('info', `month=${slug}`)
      const payload = await fetchTrendingMonth(slug)
      sendJSON(req, res, payload, 200)
      logResponse(req, pathname, start, 200, `month ${slug}`)
      return
    }
    sendError(req, res, 'Invalid endpoint. Use: YYYY-MM or YYYY-MM-DD', 404)
    logResponse(req, pathname, start, 404, `invalid format: ${slug}`)
  } catch (error) {
    const message = error?.message ?? 'Failed to fetch data'
    const status = /not found/i.test(message) ? 404 : 500
    sendError(req, res, message, status)
    logResponse(req, pathname, start, status, message)
  }
}

async function handleMetadata (req, res, pathname, start) {
  try {
    const meta = await fetchTrendingMetadata()
    sendJSON(req, res, meta, 200)
    logResponse(req, pathname, start, 200, 'metadata')
  } catch (error) {
    const message = error?.message ?? 'Failed to fetch metadata'
    sendError(req, res, message, 500)
    logResponse(req, pathname, start, 500, message)
  }
}

function handleHealth (req, res, pathname, start) {
  sendJSON(req, res, { status: 'ok', timestamp: new Date().toISOString() }, 200)
  logResponse(req, pathname, start, 200, 'health')
}

function handleRoot (req, res, pathname, start) {
  const nowMonth = new Date().toISOString().slice(0, 7)
  const body = {
    health: '/health',
    latest: '/api/trending/latest',
    sampleMonth: `/api/trending/${nowMonth}`,
    sampleDate: `/api/trending/${toIsoToday()}`,
    metadata: '/api/metadata',
    params: { pretty: '1' },
    cors: CORS_ORIGIN,
  }
  sendJSON(req, res, body, 200)
  logResponse(req, pathname, start, 200, 'root')
}

const server = http.createServer(async (req, res) => {
  const start = Date.now()
  const url = new URL(req.url!, `http://localhost:${PORT}`)
  const { pathname } = url

  log('info', `${req.method} ${pathname}`)

  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders)
    res.end()
    logResponse(req, pathname, start, 200, 'preflight')
    return
  }

  if (req.method !== 'GET') {
    sendError(req, res, 'Method not allowed', 405)
    logResponse(req, pathname, start, 405)
    return
  }

  try {
    if (pathname === '/' || pathname === '/index.json') {
      handleRoot(req, res, pathname, start)
      return
    }
    if (pathname.startsWith('/api/trending/')) {
      await handleTrending(req, res, pathname, start)
      return
    }
    if (pathname === '/api/metadata') {
      await handleMetadata(req, res, pathname, start)
      return
    }
    if (pathname === '/health') {
      handleHealth(req, res, pathname, start)
      return
    }
    sendError(req, res, 'Not found', 404)
    logResponse(req, pathname, start, 404)
  } catch (error) {
    sendError(req, res, 'Internal server error', 500)
    logResponse(req, pathname, start, 500)
  }
})

server.listen(PORT, () => {
  log('info', `Dev API server on http://localhost:${PORT}`)
})
