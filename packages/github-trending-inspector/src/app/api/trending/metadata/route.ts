import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const month = new URL(request.url).searchParams.get('month')

  if (!month)
    return Response.json({ error: 'Month parameter is required' }, { status: 400 })

  try {
    const [year, monthNum] = month.split('-')
    const response = await fetch(`https://api.github.com/repos/outslept/github-trending-backup/contents/data/${year}/${monthNum}`)

    if (!response.ok) {
      return Response.json({
        month,
        availableDates: [],
        totalDays: 0,
      }, {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
      })
    }

    const availableDates = (await response.json())
      .filter((file: { name: string }) => file.name.endsWith('.md'))
      .map((file: { name: string }) => file.name.replace('.md', '').split('-')[2])
      .sort()

    return Response.json({
      month,
      availableDates,
      totalDays: availableDates.length,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
  }
  catch (error) {
    console.error('Error fetching metadata:', error)
    return Response.json({
      month,
      availableDates: [],
      totalDays: 0,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
    })
  }
}
