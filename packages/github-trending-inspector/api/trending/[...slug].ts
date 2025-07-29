import { fetchMetadata, fetchMonthData } from '../lib/github';
import type { MetadataResponse, TrendingResponse } from '../../src/lib/types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const slug = pathParts.at(-1);

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // GET /api/trending/metadata?month=YYYY-MM
  if (slug === 'metadata') {
    const month = url.searchParams.get('month');
    if (!month) {
      return new Response(
        JSON.stringify({ error: 'Month parameter is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        },
      );
    }

    try {
      const metadata = await fetchMetadata(month);
      const response: MetadataResponse = { month, ...metadata };

      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
          'Cache-Control':
            'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    } catch (error) {
      console.error('Error fetching metadata:', error);
      const fallbackResponse: MetadataResponse = {
        month,
        availableDates: [],
        totalDays: 0,
      };
      return new Response(JSON.stringify(fallbackResponse), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
        },
      });
    }
  }

  // GET /api/trending/YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(slug)) {
    const date = slug;
    const month = date.split('-').slice(0, 2).join('-');

    try {
      const data = await fetchMonthData(month, 1, 1, date);
      const response: TrendingResponse = {
        month,
        repositories: data.repositories,
      };
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch data';
      const status = message === 'Date not found' ? 404 : 500;
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  // GET /api/trending/YYYY-MM?page=1&limit=5
  if (/^\d{4}-\d{2}$/.test(slug)) {
    const month = slug;
    const page = Number.parseInt(url.searchParams.get('page') || '1');
    const limit = Number.parseInt(url.searchParams.get('limit') || '5');

    try {
      const data = await fetchMonthData(month, page, limit);
      const response: TrendingResponse = {
        month,
        repositories: data.repositories,
        pagination: { page: data.currentPage, totalPages: data.totalPages },
      };
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch data';
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  return new Response(
    JSON.stringify({
      error: 'Invalid endpoint. Use: metadata, YYYY-MM, or YYYY-MM-DD',
    }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    },
  );
}

export function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
