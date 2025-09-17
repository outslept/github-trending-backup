import type { TrendingResponse } from '../../src/lib/types'
import { fetchMonthData, fetchDateData } from '../lib/github'
import { makeLog } from '../lib/logger'
import { ISO_DATE_REGEX, ISO_MONTH_REGEX } from '../../src/lib/date'

function monthFrom (date: string): string {
  // "YYYY-MM-DD" -> "YYYY-MM"
  return date.slice(0, 7)
}

const responseHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=300, s-maxage=600',
}

function jsonResponse (data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: responseHeaders })
}

export async function GET (request: Request) {
  const log = makeLog(request)

  try {
    const { pathname } = new URL(request.url)
    const slug = pathname.split('/').filter(Boolean).at(-1)

    if (!slug) {
      throw new Error('Invalid endpoint. Use: YYYY-MM or YYYY-MM-DD')
    }

    if (ISO_DATE_REGEX.test(slug)) {
      return await handleDate(slug, log)
    }

    if (ISO_MONTH_REGEX.test(slug)) {
      return await handleMonth(slug, log)
    }

    throw new Error('Invalid endpoint. Use: YYYY-MM or YYYY-MM-DD')
  } catch (error) {
    const message = (error as { message?: unknown })?.message?.toString() ?? 'Failed to fetch data'
    const status = /not found|invalid/i.test(message) ? 404 : 500

    log.error('request failed', error)
    log.done(status)

    return jsonResponse({ error: message }, status)
  }
}

async function handleDate (date: string, log: ReturnType<typeof makeLog>) {
  const month = monthFrom(date)

  log.info('fetching daily data', { date })

  const repositories = await fetchDateData(month, date)
  const response: TrendingResponse = { month, repositories }

  log.done(200, { type: 'daily', count: Object.keys(repositories).length })
  return jsonResponse(response)
}

async function handleMonth (month: string, log: ReturnType<typeof makeLog>) {
  log.info('fetching monthly data', { month })

  const repositories = await fetchMonthData(month)
  const response: TrendingResponse = { month, repositories }

  log.done(200, { type: 'monthly', count: Object.keys(repositories).length })
  return jsonResponse(response)
}

export function OPTIONS () {
  return new Response(null, { status: 200, headers: responseHeaders })
}
