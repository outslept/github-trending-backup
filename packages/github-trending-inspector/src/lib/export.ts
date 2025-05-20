import type { Repository } from './types'

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportToJson(data: Repository[], filename: string) {
  downloadFile(JSON.stringify(data, null, 2), filename, 'application/json')
}

export function exportToCsv(data: Repository[], filename: string) {
  const headers = ['rank', 'title', 'url', 'description', 'stars', 'todayStars', 'language']
  const csvRows = [
    headers.join(','),
    ...data.map(repo => headers.map(header => JSON.stringify((repo as any)[header] || '')).join(',')),
  ]
  downloadFile(csvRows.join('\n'), filename, 'text/csv')
}
