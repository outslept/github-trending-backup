export function GET() {
  return Response.json(
    {
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "GET /api/health",
        metadata: "GET /api/trending/metadata?month=YYYY-MM",
        monthly: "GET /api/trending/[month]?page=1&limit=5",
        daily: "GET /api/trending/[date]",
      },
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
}

export function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
