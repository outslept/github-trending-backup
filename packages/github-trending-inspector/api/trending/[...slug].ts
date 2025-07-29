import type { TrendingResponse } from '../../src/lib/types';
import { fetchMonthData } from '../lib/github';
import { Logger } from '../lib/logger';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET(request: Request) {
  const startTime = Date.now();
  const logger = new Logger(request);

  logger.request();

  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const slug = pathParts.at(-1);

  if (slug == null || slug.length === 0) {
    logger.warn('Invalid endpoint - missing slug');
    logger.response(startTime, 404);
    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // GET /api/trending/YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(slug)) {
    const date = slug;
    const month = date.split('-').slice(0, 2).join('-');

    try {
      logger.info('Fetching daily data', { date, month });

      const data = await fetchMonthData(month, 1, 1, date);
      const response: TrendingResponse = {
        month,
        repositories: data.repositories,
      };

      logger.info('Daily data fetched successfully', {
        repositoryCount: Object.keys(data.repositories).length
      });
      logger.response(startTime, 200, { type: 'daily', date });

      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch data';
      const status = message === 'Date not found' ? 404 : 500;

      logger.error('Failed to fetch daily data', error as Error, { date, month });
      logger.response(startTime, status);

      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  // GET /api/trending/YYYY-MM?page=1&limit=5
  if (/^\d{4}-\d{2}$/.test(slug)) {
    const month = slug;
    const page = Number.parseInt(url.searchParams.get('page') ?? '1');
    const limit = Number.parseInt(url.searchParams.get('limit') ?? '5');

    try {
      logger.info('Fetching monthly data', { month, page, limit });

      const data = await fetchMonthData(month, page, limit);
      const response: TrendingResponse = {
        month,
        repositories: data.repositories,
        pagination: { page: data.currentPage, totalPages: data.totalPages },
      };

      logger.info('Monthly data fetched successfully', {
        repositoryCount: Object.keys(data.repositories).length,
        totalPages: data.totalPages
      });
      logger.response(startTime, 200, { type: 'monthly', month, page });

      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch data';

      logger.error('Failed to fetch monthly data', error as Error, { month, page, limit });
      logger.response(startTime, 500);

      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  logger.warn('Invalid endpoint format', { slug });
  logger.response(startTime, 404);

  return new Response(
    JSON.stringify({
      error: 'Invalid endpoint. Use: YYYY-MM or YYYY-MM-DD',
    }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    },
  );
}

export function OPTIONS(request: Request) {
  const logger = new Logger(request);
  logger.info('CORS preflight request');

  return new Response(null, { status: 200, headers: corsHeaders });
}
