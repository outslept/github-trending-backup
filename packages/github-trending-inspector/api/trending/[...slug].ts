import type { TrendingResponse } from '../../src/lib/types';
import { fetchMonthData, fetchDateData } from '../lib/github';
import { Logger } from '../lib/logger';

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_FORMAT_REGEX = /^\d{4}-\d{2}$/;

const responseHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: responseHeaders });
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const logger = new Logger(request);

  try {
    const url = new URL(request.url);
    const slug = url.pathname.split('/').filter(Boolean).at(-1);

    if (slug == null || slug.length === 0) {
      throw new Error('Invalid endpoint');
    }

    if (DATE_FORMAT_REGEX.test(slug)) {
      return await handleDateRequest(slug, logger, startTime);
    }

    if (MONTH_FORMAT_REGEX.test(slug)) {
      return await handleMonthRequest(slug, url.searchParams, logger, startTime);
    }

    throw new Error('Invalid endpoint. Use: YYYY-MM or YYYY-MM-DD');

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch data';
    const status = message.includes('not found') || message.includes('Invalid') ? 404 : 500;

    logger.error('Request failed', error as Error);
    logger.response(startTime, status);

    return jsonResponse({ error: message }, status);
  }
}

async function handleDateRequest(date: string, logger: Logger, startTime: number) {
  const month = date.split('-').slice(0, 2).join('-');

  logger.info('Fetching daily data', { date });

  const repositories = await fetchDateData(month, date);
  const response: TrendingResponse = { month, repositories };

  logger.response(startTime, 200, { type: 'daily', count: Object.keys(repositories).length });

  return jsonResponse(response);
}

async function handleMonthRequest(month: string, searchParams: URLSearchParams, logger: Logger, startTime: number) {
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '5');

  logger.info('Fetching monthly data', { month, page, limit });

  const data = await fetchMonthData(month, page, limit);
  const response: TrendingResponse = {
    month,
    repositories: data.repositories,
    pagination: { page: data.currentPage, totalPages: data.totalPages },
  };

  logger.response(startTime, 200, {
    type: 'monthly',
    count: Object.keys(data.repositories).length,
    totalPages: data.totalPages
  });

  return jsonResponse(response);
}

export function OPTIONS() {
  return new Response(null, { status: 200, headers: responseHeaders });
}
