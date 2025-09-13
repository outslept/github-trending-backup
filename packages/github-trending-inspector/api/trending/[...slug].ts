import type { TrendingResponse } from '../../src/lib/types';
import { fetchMonthData, fetchDateData } from '../lib/github';
import { Logger } from '../lib/logger';
import { ISO_DATE_REGEX, ISO_MONTH_REGEX, monthFrom } from '../lib/date';

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
    const { pathname } = new URL(request.url);
    const slug = pathname.split('/').filter(Boolean).at(-1);

    if (!slug) {
      throw new Error('Invalid endpoint. Use: YYYY-MM or YYYY-MM-DD');
    }

    if (ISO_DATE_REGEX.test(slug)) {
      return await handleDateRequest(slug, logger, startTime);
    }

    if (ISO_MONTH_REGEX.test(slug)) {
      return await handleMonthRequest(slug, logger, startTime);
    }

    throw new Error('Invalid endpoint. Use: YYYY-MM or YYYY-MM-DD');
  } catch (error) {
    const message =
      (error as { message?: unknown })?.message?.toString() ?? 'Failed to fetch data';
    const status = /not found|invalid/i.test(message) ? 404 : 500;

    logger.error('Request failed', error instanceof Error ? error : undefined);
    logger.response(startTime, status);

    return jsonResponse({ error: message }, status);
  }
}

async function handleDateRequest(date: string, logger: Logger, startTime: number) {
  const month = monthFrom(date);

  logger.info('Fetching daily data', { date });

  const repositories = await fetchDateData(month, date);
  const response: TrendingResponse = { month, repositories };

  logger.response(startTime, 200, {
    type: 'daily',
    count: Object.keys(repositories).length,
  });

  return jsonResponse(response);
}

async function handleMonthRequest(month: string, logger: Logger, startTime: number) {
  logger.info('Fetching monthly data', { month });

  const repositories = await fetchMonthData(month);
  const response: TrendingResponse = { month, repositories };

  logger.response(startTime, 200, {
    type: 'monthly',
    count: Object.keys(repositories).length,
  });

  return jsonResponse(response);
}

export function OPTIONS() {
  return new Response(null, { status: 200, headers: responseHeaders });
}